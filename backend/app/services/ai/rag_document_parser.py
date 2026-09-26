import re
import hashlib
import uuid
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import docx
from app.core.config import settings

logger = logging.getLogger("skillbridge.ai.rag_parser")


class RAGDocumentParser:
    """
    Production-grade document parser and semantic chunking pipeline for SkillBridge India.
    Extracts Q&A pairs, career role profiles, skill mappings, learning roadmaps,
    and metadata while strictly keeping questions and answers unified in a single chunk.
    """

    def __init__(
        self,
        chunk_size: int = None,
        chunk_overlap: int = None
    ):
        self.chunk_size = chunk_size or settings.RAG_CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.RAG_CHUNK_OVERLAP

    def _compute_document_id(self, file_path: str) -> str:
        """Computes a stable, deterministic document ID using SHA-256 of file content."""
        path = Path(file_path)
        if not path.exists():
            # If relative, check root and common project paths
            possible_paths = [
                path,
                Path("..") / file_path,
                Path(".") / file_path,
                Path("Skill_Bridge_India_RAG_Knowledge_Base (6).docx"),
            ]
            for p in possible_paths:
                if p.exists():
                    path = p
                    break

        if not path.exists():
            return "skillbridge_kb_default_doc"

        try:
            with open(path, "rb") as f:
                content = f.read()
            return f"doc_{hashlib.sha256(content).hexdigest()[:16]}"
        except Exception as e:
            logger.warning(f"Failed to read file hash: {e}")
            return f"doc_{path.stem}"

    def parse_metadata_string(self, text: str) -> Dict[str, str]:
        """
        Parses metadata strings of format:
        'Metadata: type=interview_qa; role=general; difficulty=beginner; topic=HR'
        """
        meta = {}
        clean = text.strip()
        if clean.lower().startswith("metadata:"):
            clean = clean[9:].strip()

        # Split on semicolon or commas
        pairs = re.split(r"[;,]", clean)
        for pair in pairs:
            if "=" in pair:
                k, v = pair.split("=", 1)
                meta[k.strip().lower()] = v.strip()
        return meta

    def clean_heading(self, heading: str) -> str:
        """Strips numerical prefixes like '1. ', '12. ' from headings."""
        return re.sub(r"^\d+\.\s*", "", heading).strip()

    def parse_docx(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Reads DOCX file and extracts semantic chunks with comprehensive metadata.
        Returns a list of chunk dictionaries with:
        - chunk_id
        - document_id
        - source_filename
        - section
        - subsection
        - content_type
        - role
        - topic
        - difficulty
        - question (if Q&A)
        - answer (if Q&A)
        - chunk_text (unified representation for semantic embedding)
        - version
        """
        path = Path(file_path)
        if not path.exists():
            # Fallback search
            alt = Path(".") / "Skill_Bridge_India_RAG_Knowledge_Base (6).docx"
            if alt.exists():
                path = alt
            else:
                alt2 = Path("..") / "Skill_Bridge_India_RAG_Knowledge_Base (6).docx"
                if alt2.exists():
                    path = alt2

        if not path.exists():
            raise FileNotFoundError(f"Knowledge base document not found at: {file_path}")

        document_id = self._compute_document_id(str(path))
        doc = docx.Document(str(path))

        chunks: List[Dict[str, Any]] = []
        parsing_errors: List[str] = []

        current_h1 = "Introduction"
        current_h2 = ""
        buffer_paragraphs: List[str] = []

        # Iterate through paragraphs
        i = 0
        total_p = len(doc.paragraphs)

        while i < total_p:
            p = doc.paragraphs[i]
            text = p.text.strip()
            style = p.style.name if p.style else ""

            if not text:
                i += 1
                continue

            if style == "Heading 1":
                current_h1 = text
                current_h2 = ""
                i += 1
                continue

            if style == "Heading 2":
                current_h2 = text
                clean_title = self.clean_heading(current_h2)

                # Lookahead to see if next paragraphs form a Q&A pair (Answer + optional Metadata)
                j = i + 1
                next_paragraphs = []
                while j < total_p and (doc.paragraphs[j].style.name if doc.paragraphs[j].style else "") not in ["Heading 1", "Heading 2"]:
                    next_txt = doc.paragraphs[j].text.strip()
                    if next_txt:
                        next_paragraphs.append(next_txt)
                    j += 1

                # Detect type of section
                h1_lower = current_h1.lower()

                if "interview q&a" in h1_lower or "interview qa" in h1_lower or "q&a" in h1_lower:
                    # Q&A Pair processing
                    answer_text = ""
                    meta_dict = {}
                    for np in next_paragraphs:
                        if np.lower().startswith("answer:"):
                            answer_text = np[7:].strip()
                        elif np.lower().startswith("metadata:"):
                            meta_dict = self.parse_metadata_string(np)
                        elif not answer_text:
                            answer_text = np

                    # Default role from H1 if not in metadata
                    role = meta_dict.get("role", "software_engineer")
                    if "hr & behavioral" in h1_lower:
                        role = "general"
                    elif "java" in h1_lower:
                        role = "java_developer"
                    elif "python" in h1_lower:
                        role = "python_developer"
                    elif "javascript" in h1_lower or "web" in h1_lower:
                        role = "frontend"
                    elif "sql" in h1_lower or "database" in h1_lower:
                        role = "backend"
                    elif "ai/ml" in h1_lower or "rag" in h1_lower:
                        role = "ai_ml"
                    elif "data analytics" in h1_lower:
                        role = "data_analyst"

                    content_type = meta_dict.get("type", "interview_qa")
                    difficulty = meta_dict.get("difficulty", "intermediate")
                    topic = meta_dict.get("topic", clean_title)

                    # Unified chunk text: Question and Answer KEPT TOGETHER
                    chunk_text = f"Section: {current_h1}\nQuestion: {clean_title}\nAnswer: {answer_text}"

                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))

                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": content_type,
                        "role": role,
                        "topic": topic,
                        "difficulty": difficulty,
                        "question": clean_title,
                        "answer": answer_text,
                        "chunk_text": chunk_text,
                        "version": "1.0",
                        "is_qa": True
                    })

                elif "career role profiles" in h1_lower:
                    # Role Profile chunk
                    content = " ".join(next_paragraphs)
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": "career_role_profile",
                        "role": clean_title.lower().replace(" ", "_"),
                        "topic": "career_profile",
                        "difficulty": "all",
                        "question": f"What is the role profile and required skills for a {clean_title}?",
                        "answer": content,
                        "chunk_text": f"Career Role: {clean_title}\nProfile & Required Skills: {content}",
                        "version": "1.0",
                        "is_qa": False
                    })

                elif "academic-to-industry skill mapping" in h1_lower:
                    content = " ".join(next_paragraphs)
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": "skill_mapping",
                        "role": "software_engineering",
                        "topic": clean_title,
                        "difficulty": "academic",
                        "question": f"How does academic course {clean_title} map to industry competencies?",
                        "answer": content,
                        "chunk_text": f"Academic-to-Industry Mapping: {clean_title}\nCore Competencies: {content}",
                        "version": "1.0",
                        "is_qa": False
                    })

                elif "learning roadmaps" in h1_lower:
                    content = " ".join(next_paragraphs)
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))
                    role = clean_title.split("—")[0].strip().lower().replace(" ", "_")
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": "learning_roadmap",
                        "role": role,
                        "topic": "roadmap",
                        "difficulty": "all",
                        "question": f"What is the learning roadmap for {clean_title}?",
                        "answer": content,
                        "chunk_text": f"Learning Roadmap: {clean_title}\nCurriculum Schedule: {content}",
                        "version": "1.0",
                        "is_qa": False
                    })

                elif "resume & project guidance" in h1_lower:
                    content = " ".join(next_paragraphs)
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": "resume_guidance",
                        "role": "general",
                        "topic": clean_title,
                        "difficulty": "all",
                        "question": clean_title,
                        "answer": content,
                        "chunk_text": f"Resume Guidance: {clean_title}\nRecommendations: {content}",
                        "version": "1.0",
                        "is_qa": False
                    })

                elif "internship & placement faqs" in h1_lower:
                    content = " ".join(next_paragraphs)
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": "placement_faq",
                        "role": "general",
                        "topic": "placement_internship",
                        "difficulty": "beginner",
                        "question": clean_title,
                        "answer": content,
                        "chunk_text": f"FAQ: {clean_title}\nAnswer: {content}",
                        "version": "1.0",
                        "is_qa": True
                    })

                elif "aptitude & group discussion" in h1_lower:
                    content = " ".join(next_paragraphs)
                    meta_dict = {}
                    clean_content = content
                    for np in next_paragraphs:
                        if "metadata:" in np.lower():
                            meta_dict = self.parse_metadata_string(np)
                            clean_content = clean_content.replace(np, "").strip()

                    c_type = meta_dict.get("type", "aptitude_practice" if "question" in clean_title.lower() else "gd_practice")
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": c_type,
                        "role": "general",
                        "topic": meta_dict.get("topic", "aptitude"),
                        "difficulty": meta_dict.get("difficulty", "intermediate"),
                        "question": clean_title,
                        "answer": clean_content,
                        "chunk_text": f"Practice Topic: {clean_title}\nSolution / Discussion Points: {clean_content}",
                        "version": "1.0",
                        "is_qa": True
                    })

                elif "mock interview question sets" in h1_lower:
                    # Heading 2 is a Role (Frontend Developer, Backend Developer, AI/ML Engineer, HR)
                    # Next paragraphs are 10 individual questions!
                    role = clean_title.lower().replace(" ", "_")
                    for q_idx, np in enumerate(next_paragraphs, start=1):
                        q_text = np.strip()
                        if not q_text:
                            continue
                        stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}_{q_idx}_{q_text[:20]}"))
                        chunks.append({
                            "chunk_id": stable_id,
                            "document_id": document_id,
                            "source_filename": path.name,
                            "section": current_h1,
                            "subsection": clean_title,
                            "content_type": "mock_interview_question",
                            "role": role,
                            "topic": "mock_interview",
                            "difficulty": "intermediate",
                            "question": q_text,
                            "answer": f"Mock interview question for {clean_title} candidate evaluation.",
                            "chunk_text": f"Role: {clean_title} Mock Interview Question #{q_idx}\nQuestion: {q_text}",
                            "version": "1.0",
                            "is_qa": True
                        })

                else:
                    # General section fallback
                    content = " ".join(next_paragraphs)
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{clean_title}"))
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": clean_title,
                        "content_type": "knowledge_overview",
                        "role": "general",
                        "topic": clean_title,
                        "difficulty": "all",
                        "question": clean_title,
                        "answer": content,
                        "chunk_text": f"{current_h1} - {clean_title}: {content}",
                        "version": "1.0",
                        "is_qa": False
                    })

                # Advance pointer to paragraph after next_paragraphs
                i = j
                continue

            elif style == "Heading 1":
                current_h1 = text
                current_h2 = ""
                i += 1
                continue
            else:
                # Top-level or section intro paragraph
                if current_h1 in ["Ingestion guidance", "Scope and limitations", "Introduction"]:
                    stable_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{current_h1}_{i}"))
                    chunks.append({
                        "chunk_id": stable_id,
                        "document_id": document_id,
                        "source_filename": path.name,
                        "section": current_h1,
                        "subsection": current_h1,
                        "content_type": "system_guidance",
                        "role": "general",
                        "topic": current_h1.lower().replace(" ", "_"),
                        "difficulty": "all",
                        "question": f"Overview of {current_h1}",
                        "answer": text,
                        "chunk_text": f"Section: {current_h1}\n{text}",
                        "version": "1.0",
                        "is_qa": False
                    })
                i += 1

        logger.info(
            f"[RAGParser] Completed parsing '{path.name}': "
            f"Generated {len(chunks)} chunks across document sections."
        )
        return chunks


rag_document_parser = RAGDocumentParser()
