import logging
import re
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("skillbridge.ai.guard")

class RelevanceGuard:
    """
    Topic Contamination & Relevance Guard.
    Validates that AI-generated responses (learning roadmaps, micro-lessons, interview questions)
    faithfully match the user's requested query, topic, or role, and strictly rejects
    unrelated seeded or frontend content.
    """

    FRONTEND_KEYWORDS = {"react", "virtual dom", "html5", "css box", "flexbox", "jsx", "javascript dom", "tailwind", "zustand"}
    PYTHON_KEYWORDS = {"python", "fastapi", "django", "gil", "generator", "asyncio", "decorator", "pytest"}
    ENGLISH_KEYWORDS = {"english", "grammar", "spoken", "pronunciation", "vocabulary", "accent", "communication", "listening", "fluency"}
    HR_KEYWORDS = {"star method", "conflict", "behavioral", "prioritization", "weakness", "strength", "leadership", "deadline"}

    def validate_learning_content(self, topic: str, content: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validates that generated learning path or recommendations match requested topic.
        Returns (is_valid, rejection_reason).
        """
        t_lower = topic.lower()
        content_str = str(content).lower()

        is_english_topic = any(k in t_lower for k in ["english", "speak", "grammar", "pronunci", "vocab", "communicat"])
        is_python_topic = "python" in t_lower
        is_react_topic = any(k in t_lower for k in ["react", "frontend", "web", "html", "css", "ui"])

        if is_english_topic:
            # Check for frontend contamination
            matched_fe = [k for k in self.FRONTEND_KEYWORDS if k in content_str]
            if matched_fe:
                msg = f"Topic Contamination: User requested '{topic}', but response contains frontend keywords: {matched_fe}"
                logger.error(f"[Guard] {msg}")
                return False, msg

            # Must contain English/communication keywords
            matched_eng = [k for k in self.ENGLISH_KEYWORDS if k in content_str]
            if not matched_eng:
                msg = f"Relevance Failure: Response does not contain English communication concepts for topic '{topic}'"
                logger.error(f"[Guard] {msg}")
                return False, msg

        elif is_python_topic:
            matched_fe = [k for k in ["virtual dom", "react reconciliation", "html5 semantic"] if k in content_str]
            if matched_fe:
                msg = f"Topic Contamination: Python query contaminated with frontend concepts: {matched_fe}"
                logger.error(f"[Guard] {msg}")
                return False, msg

        elif is_react_topic:
            # Must contain React / frontend keywords
            if not any(k in content_str for k in ["react", "frontend", "web", "component", "ui", "state"]):
                msg = f"Relevance Failure: Response does not contain React/frontend concepts for topic '{topic}'"
                logger.error(f"[Guard] {msg}")
                return False, msg

        logger.info(f"[Guard] Learning content verified relevant for topic: '{topic}'")
        return True, ""

    def validate_interview_questions(self, role: str, questions: List[Dict[str, Any]]) -> Tuple[bool, str]:
        """
        Validates that generated interview questions correspond to the selected role.
        """
        role_lower = role.lower()
        combined_text = " ".join([
            f"{q.get('question_text', '')} {q.get('category', '')} {' '.join(q.get('evaluation_criteria', []))}"
            for q in questions
        ]).lower()

        is_python_role = "python" in role_lower
        is_frontend_role = any(w in role_lower for w in ["frontend", "react", "ui", "web"])
        is_hr_role = any(w in role_lower for w in ["hr", "behavioral", "culture", "people"])

        if is_python_role:
            if any(fe in combined_text for fe in ["virtual dom", "react reconciliation", "css box model", "flexbox"]):
                msg = f"Topic Contamination: Python Developer interview contains frontend questions"
                logger.error(f"[Guard] {msg}")
                return False, msg
            if not any(py in combined_text for py in ["python", "async", "backend", "memory", "gil", "database", "api", "query", "code", "architecture"]):
                msg = f"Relevance Failure: Questions missing Python technical depth for role '{role}'"
                logger.error(f"[Guard] {msg}")
                return False, msg

        elif is_frontend_role:
            if not any(fe in combined_text for fe in ["react", "dom", "frontend", "css", "state", "component", "web", "performance"]):
                msg = f"Relevance Failure: Questions missing frontend technical depth for role '{role}'"
                logger.error(f"[Guard] {msg}")
                return False, msg

        elif is_hr_role:
            if any(tech in combined_text for tech in ["b-tree", "virtual dom", "fastapi asgi", "index pages"]):
                msg = f"Topic Contamination: HR Interview contains technical database/frontend questions"
                logger.error(f"[Guard] {msg}")
                return False, msg

        logger.info(f"[Guard] Interview questions verified relevant for role: '{role}'")
        return True, ""

relevance_guard = RelevanceGuard()
