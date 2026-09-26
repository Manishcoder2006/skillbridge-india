import math
import re
import uuid
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
from qdrant_client import QdrantClient, models

from app.core.config import settings
from app.services.ai.embedding_service import get_embedding_provider, BaseEmbeddingProvider
from app.services.ai.qdrant_manager import qdrant_manager, QdrantManager
from app.services.ai.rag_document_parser import rag_document_parser, RAGDocumentParser

logger = logging.getLogger("skillbridge.ai.rag")


class RAGService:
    """
    Dedicated Vector Retrieval & Ingestion Service for SkillBridge India.
    Integrates DOCX semantic chunking, Qdrant vector retrieval, metadata filtering,
    keyword-aware reranking, and grounded response generation.
    """

    LEARNING_COLLECTION = "learning_resources"
    INTERVIEW_COLLECTION = "interview_competencies"
    KB_COLLECTION = settings.QDRANT_COLLECTION_NAME or "skillbridge_knowledge_base"

    def __init__(self):
        self.qdrant: QdrantManager = qdrant_manager
        self.client: QdrantClient = self.qdrant.client
        self.embedding_provider: BaseEmbeddingProvider = get_embedding_provider()
        self.vector_dim = self.embedding_provider.dimension
        self.parser: RAGDocumentParser = rag_document_parser

        self._init_collections()
        self._seed_default_knowledge_base()
        self._auto_ingest_provided_kb()

    def _init_collections(self):
        """Initializes collections in Qdrant with Cosine distance."""
        for coll_name in [self.LEARNING_COLLECTION, self.INTERVIEW_COLLECTION, self.KB_COLLECTION]:
            try:
                self.qdrant.ensure_collection(collection_name=coll_name, vector_dim=self.vector_dim)
            except Exception as e:
                logger.warning(f"[RAG] Collection '{coll_name}' init note: {e}")

    def normalize_query(self, query: str) -> str:
        """
        Normalizes student/interviewer query:
        Strips conversational prefixes, filler words, and punctuation.
        """
        if not query:
            return ""
        q = query.strip()
        prefixes = [
            r"^i want to learn\s+",
            r"^i would like to learn\s+",
            r"^teach me\s+",
            r"^how to learn\s+",
            r"^guide me on\s+",
            r"^prepare me for\s+",
            r"^interview for\s+",
            r"^help me with\s+",
            r"^can you explain\s+",
            r"^what is\s+",
            r"^tell me about\s+",
            r"^give me\s+",
            r"^show me\s+",
        ]
        for p in prefixes:
            q = re.sub(p, "", q, flags=re.IGNORECASE)
        q = re.sub(r"\s+", " ", q).strip()
        return q or query.strip()

    def _generate_dense_vector(self, text: str) -> List[float]:
        """Generates dense semantic embedding vector using configured provider."""
        return self.embedding_provider.embed_text(text)

    def _auto_ingest_provided_kb(self):
        """Automatically ingests the provided knowledge base DOCX file if available."""
        doc_filename = settings.KNOWLEDGE_BASE_DOC_PATH
        possible_paths = [
            Path(doc_filename),
            Path("..") / doc_filename,
            Path("backend") / doc_filename,
            Path("Skill_Bridge_India_RAG_Knowledge_Base (6).docx"),
            Path("..") / "Skill_Bridge_India_RAG_Knowledge_Base (6).docx",
        ]
        target_path = None
        for p in possible_paths:
            if p.exists():
                target_path = p
                break

        if target_path:
            logger.info(f"[RAG] Auto-ingesting Knowledge Base DOCX from: {target_path}")
            try:
                self.ingest_knowledge_base(str(target_path), force_reload=False)
            except Exception as e:
                logger.error(f"[RAG] Auto-ingestion failed: {e}")
        else:
            logger.info(f"[RAG] Knowledge Base doc '{doc_filename}' not found at local paths. Skipping auto-ingest.")

    def ingest_knowledge_base(
        self,
        file_path: Optional[str] = None,
        force_reload: bool = False
    ) -> Dict[str, Any]:
        """
        Reads, parses, chunks, and batch-upserts the DOCX Knowledge Base into Qdrant.
        Idempotent: Uses stable UUIDs to avoid duplicate vectors.
        """
        path_str = file_path or settings.KNOWLEDGE_BASE_DOC_PATH
        chunks = self.parser.parse_docx(path_str)

        if not chunks:
            return {
                "success": False,
                "message": "No chunks extracted from document",
                "chunks_count": 0,
                "collection": self.KB_COLLECTION
            }

        # Check existing collection state
        info = self.qdrant.get_collection_info(self.KB_COLLECTION)
        existing_points = info.get("points_count", 0)

        # Batch upsert into Qdrant
        total_upserted = self.qdrant.upsert_chunks(
            chunks=chunks,
            embedding_provider=self.embedding_provider,
            collection_name=self.KB_COLLECTION
        )

        categories: Dict[str, int] = {}
        for c in chunks:
            sec = c.get("section", "Other")
            categories[sec] = categories.get(sec, 0) + 1

        logger.info(f"[RAG] Knowledge base ingested: {total_upserted} chunks into '{self.KB_COLLECTION}'.")

        return {
            "success": True,
            "document_id": chunks[0].get("document_id") if chunks else "unknown",
            "source_filename": chunks[0].get("source_filename") if chunks else path_str,
            "collection_name": self.KB_COLLECTION,
            "total_chunks_parsed": len(chunks),
            "total_upserted_points": total_upserted,
            "categories_breakdown": categories,
            "embedding_provider": self.embedding_provider.model_name,
            "vector_dimension": self.vector_dim,
            "is_remote_qdrant": self.qdrant.is_remote()
        }

    def search_knowledge_base(
        self,
        query: str,
        top_k: int = 5,
        score_threshold: Optional[float] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs semantic vector retrieval against the unified Knowledge Base collection.
        Includes keyword term boosting for technical interview questions (BFS, DFS, Java, React, SQL, etc.).
        """
        threshold = score_threshold if score_threshold is not None else settings.RAG_SCORE_THRESHOLD
        normalized = self.normalize_query(query)
        query_vec = self._generate_dense_vector(f"{query} {normalized}")

        logger.info(f"[RAG] Query: '{query}' | Normalized: '{normalized}' | Filters: {filters}")

        # Vector search in Qdrant with filters (fetch wider candidate pool for hybrid technical reranking)
        candidate_limit = max(top_k * 10, 50)
        raw_hits = self.qdrant.search(
            query_vector=query_vec,
            top_k=candidate_limit,
            score_threshold=0.01,
            filters=filters,
            collection_name=self.KB_COLLECTION
        )

        # Hybrid Technical Keyword Reranking with Stopword Suppression
        stopwords = {
            "give", "me", "show", "tell", "what", "how", "why", "the", "a", "an",
            "is", "are", "for", "to", "in", "of", "and", "or", "questions", "question",
            "interview", "with", "vs", "about", "some", "can", "you", "please", "i", "need"
        }
        query_terms = (set(re.findall(r"\b[a-zA-Z0-9_+#.-]+\b", query.lower())) |
                       set(re.findall(r"\b[a-zA-Z0-9_+#.-]+\b", normalized.lower()))) - stopwords

        scored_results = []
        for hit in raw_hits:
            base_score = hit["score"]
            question = (hit.get("question") or "").lower()
            section = (hit.get("section") or "").lower()
            answer = (hit.get("answer") or "").lower()
            topic = (hit.get("topic") or "").lower()
            role = (hit.get("role") or "").lower()
            combined_text = f"{section} {topic} {role} {question} {answer}"

            # Exact technical domain match boosts
            boost = 0.0
            for term in query_terms:
                if len(term) < 2:
                    continue
                # Section / Role / Topic direct match
                if term in section or term in topic or term in role:
                    boost += 0.40
                elif f" {term} " in f" {question} ":
                    boost += 0.35
                elif f" {term} " in f" {combined_text} ":
                    boost += 0.15

            final_score = round(min(base_score + boost, 1.0), 4)

            if final_score >= threshold or len(scored_results) < 2:
                hit_copy = dict(hit)
                hit_copy["score"] = final_score
                scored_results.append(hit_copy)

        # Sort descending by final score
        scored_results.sort(key=lambda x: x["score"], reverse=True)
        final_results = scored_results[:top_k]

        logger.info(f"[RAG] Retrieved {len(final_results)} relevant chunks for '{query}'.")
        return final_results

    async def answer_grounded_query(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        user_role: str = "student",
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Executes grounded retrieval-augmented generation.
        Returns strictly evidence-grounded answer with source citations and confidence.
        States clearly when evidence is insufficient instead of hallucinating.
        """
        from app.services.ai.gemini_service import gemini_service
        from app.services.ai.groq_service import groq_service

        retrieved_sources = self.search_knowledge_base(
            query=query,
            top_k=4,
            filters=filters
        )

        if not retrieved_sources:
            return {
                "answer": (
                    "The SkillBridge India knowledge base does not contain sufficient verified evidence "
                    "to answer this specific question. Please consult official curriculum guides, university "
                    "placement notices, or request faculty assistance."
                ),
                "has_sufficient_evidence": False,
                "confidence_score": 0.0,
                "sources": [],
                "suggested_actions": ["Search broader topics", "Ask Academic Advisor", "Check Learning Dashboard"]
            }

        # Format retrieved evidence
        evidence_blocks = []
        for i, src in enumerate(retrieved_sources, 1):
            q_part = f"Question: {src.get('question')}\n" if src.get('question') else ""
            a_part = f"Answer/Content: {src.get('answer')}\n" if src.get('answer') else f"Content: {src.get('chunk_text')}\n"
            evidence_blocks.append(
                f"[Source {i} | Section: {src.get('section')} | Topic: {src.get('topic')}]\n"
                f"{q_part}{a_part}"
            )
        evidence_text = "\n---\n".join(evidence_blocks)

        prompt = f"""You are the SkillBridge India Knowledge Base AI Assistant.
A user with role '{user_role.upper()}' asked: "{query}"

RETRIEVED KNOWLEDGE BASE EVIDENCE:
{evidence_text}

MANDATORY GROUNDED GENERATION RULES:
1. Base your answer EXCLUSIVELY on the provided evidence above. Do NOT invent facts or external statistics.
2. If the user asks about interview answers, clarify that the sample answer is an illustrative framework (e.g. STAR method) and that the candidate must adapt it with their own authentic project experiences.
3. If the evidence does not contain sufficient information to answer the question completely, clearly state: "The official knowledge base does not provide further details on this aspect."
4. Structure the response clearly with concise bullet points where appropriate.
5. Provide a professional, encouraging tone suitable for national placement and internship preparation.

Return JSON format:
{{
  "answer": "<direct, grounded answer with clear explanations>",
  "is_sample_answer": <true if question is an interview Q&A sample, false otherwise>,
  "confidence_score": <float between 0.0 and 1.0 based on evidence match quality>,
  "key_takeaways": ["<bullet 1>", "<bullet 2>", "<bullet 3>"],
  "follow_up_suggestions": ["<suggestion 1>", "<suggestion 2>"]
}}"""

        try:
            parsed, latency, is_fallback = await gemini_service.generate_structured_json(prompt=prompt)
        except Exception:
            try:
                parsed, latency, is_fallback = await groq_service.generate_structured_json(prompt=prompt)
            except Exception:
                # Deterministic fallback directly synthesized from top retrieved chunk
                top = retrieved_sources[0]
                q_text = top.get("question") or query
                a_text = top.get("answer") or top.get("chunk_text") or ""
                parsed = {
                    "answer": f"According to the SkillBridge India Knowledge Base ({top.get('section')}):\n\n{a_text}",
                    "is_sample_answer": top.get("is_qa", False),
                    "confidence_score": top.get("score", 0.85),
                    "key_takeaways": [f"Section: {top.get('section')}", f"Topic: {top.get('topic')}"],
                    "follow_up_suggestions": ["Review related interview questions", "Explore learning roadmap"]
                }

        return {
            "query": query,
            "answer": parsed.get("answer", ""),
            "has_sufficient_evidence": True,
            "confidence_score": parsed.get("confidence_score", 0.90),
            "is_sample_answer": parsed.get("is_sample_answer", False),
            "key_takeaways": parsed.get("key_takeaways", []),
            "follow_up_suggestions": parsed.get("follow_up_suggestions", []),
            "sources": [
                {
                    "chunk_id": s.get("chunk_id"),
                    "section": s.get("section"),
                    "topic": s.get("topic"),
                    "role": s.get("role"),
                    "content_type": s.get("content_type"),
                    "score": s.get("score"),
                    "question": s.get("question")
                }
                for s in retrieved_sources
            ]
        }

    # --------------------------------------------------------------------------
    # Backward Compatibility Methods for Existing Subsystems
    # --------------------------------------------------------------------------
    def _seed_default_knowledge_base(self):
        """Pre-seeds canonical knowledge base resources and interview competencies."""
        learning_docs = [
            {
                "id": "eng-1",
                "title": "English Communication & Spoken Fluency Masterclass",
                "category": "Communication & Languages",
                "skill_tag": "English",
                "resource_type": "course",
                "provider": "Swayam / IIT Madras",
                "duration": "6 weeks",
                "url": "https://swayam.gov.in/english-communication",
                "level": "beginner",
                "content": "Master English grammar, spoken pronunciation, vocabulary building, and conversational fluency for technical presentations and career interviews.",
                "keywords": ["english", "grammar", "vocabulary", "speaking", "pronunciation", "communication", "fluency", "accent"]
            },
            {
                "id": "eng-2",
                "title": "Professional Business English & Corporate Email Etiquette",
                "category": "Soft Skills",
                "skill_tag": "Business English",
                "resource_type": "tutorial",
                "provider": "British Council / SkillBridge",
                "duration": "4 hours",
                "url": "https://learnenglish.britishcouncil.org",
                "level": "intermediate",
                "content": "Essential Business English vocabulary, corporate email correspondence, sentence framing, voice clarity, and active listening skills in English.",
                "keywords": ["english", "business english", "email writing", "vocabulary", "verbal communication", "formal speech"]
            },
            {
                "id": "eng-3",
                "title": "English Grammar Essentials, Tenses & Active Vocabulary",
                "category": "Languages",
                "skill_tag": "English Grammar",
                "resource_type": "workshop",
                "provider": "Cambridge English Open Learning",
                "duration": "8 hours",
                "url": "https://cambridgeenglish.org/learning",
                "level": "beginner",
                "content": "Core English grammar rules, sentence structure, active vs passive voice, prepositions, tenses, common errors, and vocabulary expansion.",
                "keywords": ["english", "grammar", "tenses", "vocabulary", "speaking", "language", "syntax"]
            },
            {
                "id": "eng-4",
                "title": "Accent Training, Phonetics & Spoken English Practice",
                "category": "Communication",
                "skill_tag": "Spoken English",
                "resource_type": "video",
                "provider": "National Skill Development Corp",
                "duration": "5 hours",
                "url": "https://nsdcindia.org/english-phonetics",
                "level": "beginner",
                "content": "Intonation, word stress, phonetic symbols, overcoming mother-tongue influence, and daily spoken English conversational drills.",
                "keywords": ["english", "spoken english", "phonetics", "accent", "pronunciation", "speaking", "conversation"]
            },
            {
                "id": "py-1",
                "title": "Python for Algorithmic Problem Solving & Data Structures",
                "category": "Software Engineering",
                "skill_tag": "Python",
                "resource_type": "course",
                "provider": "AICTE / NEAT Portal",
                "duration": "8 weeks",
                "url": "https://neat.aicte-india.org",
                "level": "intermediate",
                "content": "Comprehensive Python programming, generators, decorators, GIL, memory management, algorithms, and object-oriented architecture in Python.",
                "keywords": ["python", "algorithms", "data structures", "decorators", "gil", "concurrency", "dsa"]
            },
            {
                "id": "py-2",
                "title": "FastAPI High-Performance Async Backend Engineering",
                "category": "Backend Engineering",
                "skill_tag": "FastAPI",
                "resource_type": "tutorial",
                "provider": "SkillBridge Labs",
                "duration": "6 hours",
                "url": "https://fastapi.tiangolo.com",
                "level": "intermediate",
                "content": "Building asynchronous REST APIs with Python, FastAPI, Pydantic, dependency injection, and non-blocking event loops.",
                "keywords": ["python", "fastapi", "backend", "api", "async", "pydantic", "rest"]
            },
            {
                "id": "react-1",
                "title": "Modern React 18 & Frontend State Architecture",
                "category": "Web Development",
                "skill_tag": "React / Frontend",
                "resource_type": "course",
                "provider": "SWAYAM / NPTEL",
                "duration": "4 weeks",
                "url": "https://swayam.gov.in",
                "level": "intermediate",
                "content": "React 18 concurrent features, Virtual DOM diffing, component lifecycle, hooks (useState, useEffect, useMemo), and client-side routing.",
                "keywords": ["react", "frontend", "javascript", "virtual dom", "hooks", "state management", "web"]
            },
            {
                "id": "react-2",
                "title": "Responsive CSS Layouts, Flexbox & CSS Grid Mastery",
                "category": "Web Development",
                "skill_tag": "CSS / Web",
                "resource_type": "workshop",
                "provider": "SkillBridge Open Lab",
                "duration": "3 hours",
                "url": "https://developer.mozilla.org",
                "level": "beginner",
                "content": "Modern CSS layouts, Flexbox alignment, CSS Grid two-dimensional layouts, media queries, and responsive web design standards.",
                "keywords": ["css", "html", "flexbox", "grid", "frontend", "responsive", "web design"]
            },
            {
                "id": "db-1",
                "title": "Database Modeling & PostgreSQL Row Level Security",
                "category": "Databases",
                "skill_tag": "PostgreSQL",
                "resource_type": "workshop",
                "provider": "IIT Delhi Open Courseware",
                "duration": "3 hours",
                "url": "https://www.postgresql.org/docs/",
                "level": "advanced",
                "content": "Relational schema design, B-Tree and Hash indexing, query optimization, ACID transactions, and Row-Level Security policies in PostgreSQL.",
                "keywords": ["database", "sql", "postgresql", "indexing", "acid", "query optimization", "rls"]
            },
            {
                "id": "devops-1",
                "title": "Cloud Infrastructure & Docker Containerization",
                "category": "DevOps",
                "skill_tag": "Docker",
                "resource_type": "video",
                "provider": "NPTEL Cloud Series",
                "duration": "5 hours",
                "url": "https://nptel.ac.in",
                "level": "intermediate",
                "content": "Docker images, Dockerfile optimization, multi-container orchestration with compose, container networking, and cloud deployment pipelines.",
                "keywords": ["docker", "devops", "cloud", "containers", "kubernetes", "ci/cd"]
            }
        ]

        points = []
        for doc in learning_docs:
            text_for_vec = f"{doc['title']} {doc['category']} {doc['skill_tag']} {doc['content']} {' '.join(doc['keywords'])}"
            vec = self._generate_dense_vector(text_for_vec)
            points.append(
                models.PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, str(doc["id"]))),
                    vector=vec,
                    payload=doc
                )
            )

        self.client.upsert(
            collection_name=self.LEARNING_COLLECTION,
            points=points
        )

        interview_competencies = [
            {
                "id": "inv-comp-py-1",
                "role": "Python Developer",
                "category": "Language Internals & Memory",
                "difficulty": "intermediate",
                "content": "Python memory management, reference counting, generational garbage collection, Global Interpreter Lock (GIL) implications on multithreading.",
                "keywords": ["python", "gil", "garbage collection", "memory", "multithreading", "concurrency"]
            },
            {
                "id": "inv-comp-py-2",
                "role": "Python Developer",
                "category": "Advanced Python Constructs",
                "difficulty": "intermediate",
                "content": "Generators vs iterators, memory efficiency of yield, custom decorators with functools.wraps, context managers with __enter__ and __exit__.",
                "keywords": ["python", "generators", "decorators", "iterators", "context managers", "yield"]
            },
            {
                "id": "inv-comp-py-3",
                "role": "Python Developer",
                "category": "Async & Web Architecture",
                "difficulty": "advanced",
                "content": "Asyncio event loop architecture, coroutines, non-blocking I/O, ASGI frameworks like FastAPI compared to WSGI like Django/Flask.",
                "keywords": ["python", "asyncio", "fastapi", "asgi", "event loop", "backend", "concurrency"]
            },
            {
                "id": "inv-comp-fe-1",
                "role": "Frontend Developer",
                "category": "Virtual DOM & Reconciliation",
                "difficulty": "intermediate",
                "content": "React Fiber reconciliation algorithm, tree diffing heuristics, stable component keys, preventing unnecessary rerenders with memo and useCallback.",
                "keywords": ["frontend", "react", "virtual dom", "reconciliation", "fiber", "javascript"]
            },
            {
                "id": "inv-comp-fe-2",
                "role": "Frontend Developer",
                "category": "State Architecture & Performance",
                "difficulty": "intermediate",
                "content": "Client-side state (Context, Redux, Zustand) vs Server-side caching (React Query / SWR), Core Web Vitals (LCP, FID/INP, CLS) optimization, code-splitting.",
                "keywords": ["frontend", "react", "state management", "core web vitals", "performance", "web"]
            },
            {
                "id": "inv-comp-hr-1",
                "role": "HR Interview",
                "category": "Behavioral & Conflict Resolution",
                "difficulty": "intermediate",
                "content": "STAR framework (Situation, Task, Action, Result) for conflict resolution, handling technical disagreements constructively, cross-functional teamwork.",
                "keywords": ["hr", "behavioral", "conflict resolution", "star", "teamwork", "leadership"]
            },
            {
                "id": "inv-comp-hr-2",
                "role": "HR Interview",
                "category": "Prioritization & Growth",
                "difficulty": "beginner",
                "content": "Handling competing project deadlines, stress management, professional self-awareness, authentic strengths, and long-term career ambition.",
                "keywords": ["hr", "behavioral", "time management", "prioritization", "growth mindset", "career"]
            }
        ]

        inv_points = []
        for comp in interview_competencies:
            text_for_vec = f"{comp['role']} {comp['category']} {comp['content']} {' '.join(comp['keywords'])}"
            vec = self._generate_dense_vector(text_for_vec)
            inv_points.append(
                models.PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, str(comp["id"]))),
                    vector=vec,
                    payload=comp
                )
            )

        self.client.upsert(
            collection_name=self.INTERVIEW_COLLECTION,
            points=inv_points
        )

    def sync_faculty_resources(self, resources: List[Dict[str, Any]]):
        """Dynamically ingests Faculty-created resources into Qdrant collection."""
        if not resources:
            return
        points = []
        for r in resources:
            r_id = str(r.get("id") or hash(r.get("title", "")))
            title = r.get("title", "")
            cat = r.get("category", "")
            skill = r.get("skill_tag", "")
            desc = r.get("description") or title
            text_for_vec = f"{title} {cat} {skill} {desc}"
            vec = self._generate_dense_vector(text_for_vec)
            payload = {
                "id": r_id,
                "title": title,
                "category": cat,
                "skill_tag": skill,
                "resource_type": r.get("resource_type", "course"),
                "provider": r.get("provider", "Faculty Resource"),
                "duration": r.get("duration", "4 hours"),
                "url": r.get("url", "#"),
                "level": r.get("level", "intermediate"),
                "content": desc,
                "is_faculty_content": True
            }
            points.append(
                models.PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, str(r_id))),
                    vector=vec,
                    payload=payload
                )
            )
        self.client.upsert(
            collection_name=self.LEARNING_COLLECTION,
            points=points
        )

    def search_learning_resources(
        self,
        query: str,
        top_k: int = 4,
        score_threshold: float = 0.20
    ) -> List[Dict[str, Any]]:
        """Retrieves top relevant learning resources strictly aligned with student's query."""
        normalized = self.normalize_query(query)
        query_vec = self._generate_dense_vector(normalized)

        try:
            hits = self.client.query_points(
                collection_name=self.LEARNING_COLLECTION,
                query=query_vec,
                limit=top_k * 2,
            ).points
        except Exception as e:
            logger.error(f"[RAG] Qdrant search error: {e}")
            return []

        norm_lower = normalized.lower()
        is_english = any(w in norm_lower for w in ["english", "grammar", "speak", "pronunci", "vocab", "communicat"])
        is_python = any(w in norm_lower for w in ["python", "django", "fastapi", "asyncio", "numpy", "pandas"])
        is_react = any(w in norm_lower for w in ["react", "frontend", "web", "html", "css", "jsx", "javascript", "ui"])

        filtered = []
        for hit in hits:
            score = round(float(hit.score), 4)
            p = hit.payload or {}
            title = p.get("title", "").lower()
            content = p.get("content", "").lower()
            skill_tag = p.get("skill_tag", "").lower()
            combined_doc_text = f"{title} {content} {skill_tag}"

            if is_english and not any(w in combined_doc_text for w in ["english", "grammar", "speak", "vocabulary", "communication", "pronunciation"]):
                continue
            elif is_python and not any(w in combined_doc_text for w in ["python", "fastapi", "backend", "algorithm", "dsa"]):
                continue
            elif is_react and not any(w in combined_doc_text for w in ["react", "frontend", "javascript", "web", "css", "html"]):
                continue

            if score >= score_threshold or len(filtered) < 2:
                filtered.append({
                    "id": p.get("id"),
                    "title": p.get("title"),
                    "category": p.get("category"),
                    "skill_tag": p.get("skill_tag"),
                    "resource_type": p.get("resource_type", "course"),
                    "provider": p.get("provider"),
                    "duration": p.get("duration"),
                    "url": p.get("url"),
                    "level": p.get("level"),
                    "content": p.get("content"),
                    "score": score
                })
            if len(filtered) >= top_k:
                break

        return filtered

    def search_interview_competencies(
        self,
        role: str,
        skills: Optional[List[str]] = None,
        interview_type: str = "technical",
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """Retrieves relevant interview competency chunks from Qdrant based on role and skills."""
        skills_str = " ".join(skills or [])
        query_text = f"{role} {skills_str} {interview_type}"
        normalized = self.normalize_query(query_text)
        query_vec = self._generate_dense_vector(normalized)

        try:
            hits = self.client.query_points(
                collection_name=self.INTERVIEW_COLLECTION,
                query=query_vec,
                limit=top_k * 2
            ).points
        except Exception as e:
            logger.error(f"[RAG] Qdrant search error for interview: {e}")
            return []

        role_lower = role.lower()
        is_hr = interview_type.lower() == "hr" or "hr" in role_lower or "behavioral" in role_lower
        is_python = "python" in role_lower or any("python" in s.lower() for s in (skills or []))
        is_frontend = any(w in role_lower for w in ["frontend", "react", "ui", "web"])

        results = []
        for hit in hits:
            p = hit.payload or {}
            content = (p.get("content", "") + " " + p.get("role", "")).lower()

            if is_hr and not ("hr" in content or "behavioral" in content or "star" in content):
                continue
            if is_python and not ("python" in content or "backend" in content or "async" in content or "gil" in content):
                continue
            if is_frontend and not ("frontend" in content or "react" in content or "web" in content or "dom" in content):
                continue

            results.append({
                "id": p.get("id"),
                "role": p.get("role"),
                "category": p.get("category"),
                "difficulty": p.get("difficulty"),
                "content": p.get("content"),
                "score": round(float(hit.score), 4)
            })
            if len(results) >= top_k:
                break

        return results


rag_service = RAGService()
