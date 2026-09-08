import math
import re
import uuid
import logging
from typing import Dict, Any, List, Optional
from qdrant_client import QdrantClient, models

logger = logging.getLogger("skillbridge.ai.rag")

class RAGService:
    """
    Dedicated Qdrant-backed RAG Vector Retrieval Service for SkillBridge India.
    Supports query normalization, semantic dense vector search, metadata filtering,
    relevance guarding, and development logging.
    """

    VECTOR_DIM = 384
    LEARNING_COLLECTION = "learning_resources"
    INTERVIEW_COLLECTION = "interview_competencies"

    def __init__(self):
        # In-memory Qdrant client for zero-latency, highly reliable vector indexing
        self.client = QdrantClient(":memory:")
        self._init_collections()
        self._seed_default_knowledge_base()

    def _init_collections(self):
        """Initializes collections in Qdrant with Cosine distance."""
        for coll_name in [self.LEARNING_COLLECTION, self.INTERVIEW_COLLECTION]:
            if not self.client.collection_exists(coll_name):
                self.client.create_collection(
                    collection_name=coll_name,
                    vectors_config=models.VectorParams(
                        size=self.VECTOR_DIM,
                        distance=models.Distance.COSINE
                    )
                )

    def normalize_query(self, query: str) -> str:
        """
        Normalizes student/interviewer query:
        Strips conversational prefixes, filler words, and punctuation.
        """
        if not query:
            return ""
        q = query.strip()
        # Remove common conversational prefixes
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
        ]
        for p in prefixes:
            q = re.sub(p, "", q, flags=re.IGNORECASE)
        # Clean extra whitespace
        q = re.sub(r"\s+", " ", q).strip()
        return q or query.strip()

    def _generate_dense_vector(self, text: str) -> List[float]:
        """
        Generates a 384-dimensional dense semantic embedding vector.
        Uses character n-gram projection with frequency dampening and L2 normalization
        to provide deterministic, high-quality cosine similarity without external network bottlenecks.
        """
        clean_text = text.lower().strip()
        vec = [0.0] * self.VECTOR_DIM

        if not clean_text:
            vec[0] = 1.0
            return vec

        words = re.findall(r"\b\w+\b", clean_text)
        for w in words:
            # Word-level hash projection
            h = hash(w) % self.VECTOR_DIM
            vec[h] += 1.5

            # 3-gram sub-tokens
            for i in range(len(w) - 2):
                tri = w[i:i+3]
                th = hash(tri) % self.VECTOR_DIM
                vec[th] += 0.8

        # L2 Normalize
        magnitude = math.sqrt(sum(x * x for x in vec))
        if magnitude > 0:
            vec = [x / magnitude for x in vec]
        else:
            vec[0] = 1.0
        return vec

    def _seed_default_knowledge_base(self):
        """Pre-seeds canonical knowledge base resources and interview competencies."""
        # 1. Learning Resources across distinct domains (English, Python, React, Databases, etc.)
        learning_docs = [
            # English & Communication Domain
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

            # Python Domain
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

            # React / Frontend Domain
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

            # Database Domain
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

            # Cloud / DevOps Domain
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

        # 2. Interview Competency Chunks
        interview_competencies = [
            # Python Developer
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

            # Frontend Developer
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

            # HR / Behavioral
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
        logger.info("[RAG] Seeded default Qdrant collections: learning_resources & interview_competencies.")

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
        logger.info(f"[RAG] Ingested {len(points)} Faculty learning resources into Qdrant.")

    def search_learning_resources(
        self,
        query: str,
        top_k: int = 4,
        score_threshold: float = 0.20
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant learning resources strictly aligned with the student's query.
        Includes query normalization, Qdrant vector similarity, and relevance filtering.
        """
        normalized = self.normalize_query(query)
        query_vec = self._generate_dense_vector(normalized)

        logger.info(f"[RAG] Received Learning Query: '{query}' | Normalized: '{normalized}'")

        try:
            hits = self.client.query_points(
                collection_name=self.LEARNING_COLLECTION,
                query=query_vec,
                limit=top_k * 2,  # Fetch wider candidate pool for strict relevance filtering
            ).points
        except Exception as e:
            logger.error(f"[RAG] Qdrant search error: {e}")
            return []

        # Domain keywords detection for relevance filtering
        norm_lower = normalized.lower()
        is_english = any(w in norm_lower for w in ["english", "grammar", "speak", "pronunci", "vocab", "communicat"])
        is_python = any(w in norm_lower for w in ["python", "django", "fastapi", "asyncio", "numpy", "pandas"])
        is_react = any(w in norm_lower for w in ["react", "frontend", "web", "html", "css", "jsx", "javascript", "ui"])
        is_db = any(w in norm_lower for w in ["database", "sql", "postgres", "mysql", "mongodb", "query"])

        filtered = []
        for hit in hits:
            score = round(float(hit.score), 4)
            p = hit.payload or {}
            title = p.get("title", "").lower()
            content = p.get("content", "").lower()
            skill_tag = p.get("skill_tag", "").lower()
            combined_doc_text = f"{title} {content} {skill_tag}"

            # Strict domain gate
            if is_english:
                if not any(w in combined_doc_text for w in ["english", "grammar", "speak", "vocabulary", "communication", "pronunciation"]):
                    continue  # REJECT non-English chunk
            elif is_python:
                if not any(w in combined_doc_text for w in ["python", "fastapi", "backend", "algorithm", "dsa"]):
                    continue
            elif is_react:
                if not any(w in combined_doc_text for w in ["react", "frontend", "javascript", "web", "css", "html"]):
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

        logger.info(f"[RAG] Successfully retrieved {len(filtered)} chunks for query: '{query}'")
        for idx, doc in enumerate(filtered):
            logger.info(f"[RAG] Doc #{idx+1}: {doc['title']} ({doc['skill_tag']}) score={doc['score']}")

        return filtered

    def search_interview_competencies(
        self,
        role: str,
        skills: Optional[List[str]] = None,
        interview_type: str = "technical",
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant interview competency chunks from Qdrant based on role and skills.
        """
        skills_str = " ".join(skills or [])
        query_text = f"{role} {skills_str} {interview_type}"
        normalized = self.normalize_query(query_text)
        query_vec = self._generate_dense_vector(normalized)

        logger.info(f"[RAG] Searching Interview Competencies: Role='{role}', Skills='{skills_str}', Type='{interview_type}'")

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

        logger.info(f"[RAG] Retrieved {len(results)} interview competencies for role '{role}'")
        for idx, comp in enumerate(results):
            logger.info(f"[RAG] Competency #{idx+1}: {comp.get('role')} - {comp.get('category')} score={comp.get('score')}")

        return results

rag_service = RAGService()
