import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.core.database import db_manager

logger = logging.getLogger("skillbridge.repositories.interview")

# In-memory mock store for local development & fast reliable responses
INTERVIEW_SESSIONS_STORE: Dict[str, Dict[str, Any]] = {
    "inv-demo-001": {
        "id": "inv-demo-001",
        "user_id": "u1000000-0000-0000-0000-000000000001",
        "interview_type": "technical",
        "role": "Backend Developer",
        "experience_level": "intermediate",
        "status": "completed",
        "total_questions": 5,
        "current_question_index": 5,
        "questions": [
            {
                "id": "q-demo-1",
                "question_number": 1,
                "question_text": "How do database indexes work in PostgreSQL (B-tree vs Hash), and when would an index degrade write throughput?",
                "category": "Databases & Storage",
                "difficulty": "intermediate",
                "hint": "Consider the internal node balance and index maintenance overhead during INSERT/UPDATE operations.",
                "evaluation_criteria": ["B-tree balance", "Write amplification", "Index maintenance cost"]
            },
            {
                "id": "q-demo-2",
                "question_number": 2,
                "question_text": "Explain how FastAPI leverages ASGI and Python async/await syntax to achieve high-concurrency I/O performance.",
                "category": "Backend Frameworks",
                "difficulty": "intermediate",
                "hint": "Discuss event loop, cooperative multitasking, and non-blocking I/O.",
                "evaluation_criteria": ["Event loop understanding", "ASGI vs WSGI", "Async I/O non-blocking behavior"]
            }
        ],
        "created_at": "2026-08-28T14:30:00Z"
    }
}

INTERVIEW_ANSWERS_STORE: Dict[str, List[Dict[str, Any]]] = {
    "inv-demo-001": [
        {
            "question_id": "q-demo-1",
            "question_number": 1,
            "question_text": "How do database indexes work in PostgreSQL (B-tree vs Hash), and when would an index degrade write throughput?",
            "category": "Databases & Storage",
            "answer_text": "B-tree indexes maintain a balanced search tree allowing O(log N) lookups. However, each INSERT or UPDATE requires updating all indexes on the table, increasing I/O write amplification.",
            "score": 9,
            "strengths": ["Clear explanation of B-tree time complexity", "Correctly identified index maintenance and write amplification cost"],
            "improvements": ["Could mention write buffers or composite index ordering strategies"],
            "evaluated_at": "2026-08-28T14:35:00Z"
        },
        {
            "question_id": "q-demo-2",
            "question_number": 2,
            "question_text": "Explain how FastAPI leverages ASGI and Python async/await syntax to achieve high-concurrency I/O performance.",
            "category": "Backend Frameworks",
            "answer_text": "FastAPI runs on ASGI servers like Uvicorn using an asynchronous event loop. When waiting for DB or network I/O, the worker yields control back to the event loop to process other requests.",
            "score": 9,
            "strengths": ["Accurate explanation of non-blocking I/O event loop yielding", "Understood ASGI worker multiplexing"],
            "improvements": ["Could contrast with traditional multi-threaded WSGI blocking models"],
            "evaluated_at": "2026-08-28T14:38:00Z"
        }
    ]
}

INTERVIEW_REPORTS_STORE: Dict[str, Dict[str, Any]] = {
    "inv-demo-001": {
        "interview_id": "inv-demo-001",
        "role": "Backend Developer",
        "interview_type": "technical",
        "overall_score": 88,
        "category_scores": [
            {"category": "Technical Depth", "score": 90},
            {"category": "Communication", "score": 85},
            {"category": "Problem Solving", "score": 88},
            {"category": "Role Relevance", "score": 92}
        ],
        "strengths": [
            "Strong grasp of asynchronous architecture and ASGI event loops",
            "Solid foundational understanding of database storage engines and index costs",
            "Clear and concise technical articulation"
        ],
        "weaknesses": [
            "Could provide deeper concrete code syntax examples in edge-case handling",
            "System design scaling tradeoffs could include distributed caching strategies"
        ],
        "questions_answered_well": [
            "PostgreSQL indexing mechanics & write degradation tradeoffs",
            "FastAPI ASGI asynchronous concurrency model"
        ],
        "questions_needing_improvement": [
            "Distributed transaction rollback mechanisms"
        ],
        "personalized_recommendations": [
            "Practice architectural system design diagrams for high-throughput streaming systems",
            "Implement Redis distributed caching with cache-invalidation strategies"
        ],
        "suggested_skills_to_practice": [
            "Distributed Systems",
            "Redis Caching",
            "gRPC Microservices"
        ],
        "recommended_next_steps": [
            "Take the Advanced Backend System Architecture assessment on SkillBridge",
            "Add Docker and Redis caching to your resume portfolio project"
        ],
        "question_reviews": [
            {
                "question_number": 1,
                "question_text": "How do database indexes work in PostgreSQL (B-tree vs Hash), and when would an index degrade write throughput?",
                "category": "Databases & Storage",
                "answer_text": "B-tree indexes maintain a balanced search tree allowing O(log N) lookups. However, each INSERT or UPDATE requires updating all indexes on the table, increasing I/O write amplification.",
                "score": 9,
                "strengths": ["Clear explanation of B-tree time complexity", "Identified index maintenance cost"],
                "improvements": ["Could mention write buffers"]
            },
            {
                "question_number": 2,
                "question_text": "Explain how FastAPI leverages ASGI and Python async/await syntax to achieve high-concurrency I/O performance.",
                "category": "Backend Frameworks",
                "answer_text": "FastAPI runs on ASGI servers like Uvicorn using an asynchronous event loop. When waiting for DB or network I/O, the worker yields control back to the event loop to process other requests.",
                "score": 9,
                "strengths": ["Accurate explanation of non-blocking I/O event loop yielding"],
                "improvements": ["Could contrast with WSGI thread pools"]
            }
        ]
    }
}


class InterviewRepository:
    def create_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        interview_id = session_data.get("id") or f"inv-{uuid.uuid4().hex[:12]}"
        session_data["id"] = interview_id
        session_data.setdefault("status", "in_progress")
        session_data.setdefault("created_at", datetime.now(timezone.utc).isoformat())
        INTERVIEW_SESSIONS_STORE[interview_id] = session_data
        INTERVIEW_ANSWERS_STORE[interview_id] = []
        return session_data

    def get_session(self, interview_id: str) -> Optional[Dict[str, Any]]:
        return INTERVIEW_SESSIONS_STORE.get(interview_id)

    def save_answer(self, interview_id: str, answer_record: Dict[str, Any]) -> Dict[str, Any]:
        if interview_id not in INTERVIEW_ANSWERS_STORE:
            INTERVIEW_ANSWERS_STORE[interview_id] = []
        
        # Replace existing answer for the same question if present, otherwise append
        existing = [a for a in INTERVIEW_ANSWERS_STORE[interview_id] if a.get("question_id") == answer_record.get("question_id")]
        if existing:
            INTERVIEW_ANSWERS_STORE[interview_id] = [
                answer_record if a.get("question_id") == answer_record.get("question_id") else a
                for a in INTERVIEW_ANSWERS_STORE[interview_id]
            ]
        else:
            INTERVIEW_ANSWERS_STORE[interview_id].append(answer_record)

        # Update session question index
        session = INTERVIEW_SESSIONS_STORE.get(interview_id)
        if session:
            session["current_question_index"] = len(INTERVIEW_ANSWERS_STORE[interview_id])

    def update_session(self, interview_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        session = INTERVIEW_SESSIONS_STORE.get(interview_id)
        if session:
            session.update(updates)
        return session

    def append_question(self, interview_id: str, question: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        session = INTERVIEW_SESSIONS_STORE.get(interview_id)
        if session:
            questions = session.setdefault("questions", [])
            questions.append(question)
            session["total_questions"] = len(questions)
        return session

    def get_answers(self, interview_id: str) -> List[Dict[str, Any]]:
        return INTERVIEW_ANSWERS_STORE.get(interview_id, [])

    def save_report(self, interview_id: str, report_data: Dict[str, Any]) -> Dict[str, Any]:
        INTERVIEW_REPORTS_STORE[interview_id] = report_data
        session = INTERVIEW_SESSIONS_STORE.get(interview_id)
        if session:
            session["status"] = "completed"
        return report_data

    def get_report(self, interview_id: str) -> Optional[Dict[str, Any]]:
        return INTERVIEW_REPORTS_STORE.get(interview_id)

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        history = []
        for inv_id, sess in INTERVIEW_SESSIONS_STORE.items():
            if str(sess.get("user_id")) == str(user_id) or user_id in ["all", "u1000000-0000-0000-0000-000000000001"]:
                rep = INTERVIEW_REPORTS_STORE.get(inv_id)
                answers = INTERVIEW_ANSWERS_STORE.get(inv_id, [])
                history.append({
                    "id": inv_id,
                    "role": sess.get("role", "Software Engineer"),
                    "interview_type": sess.get("interview_type", "technical"),
                    "overall_score": rep.get("overall_score") if rep else None,
                    "total_questions": sess.get("total_questions", len(sess.get("questions", []))),
                    "answered_questions": len(answers),
                    "status": sess.get("status", "in_progress"),
                    "created_at": sess.get("created_at", datetime.now(timezone.utc).isoformat())
                })
        # Sort newest first
        history.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return history


interview_repo = InterviewRepository()
