from typing import Tuple, List

class ModelRouter:
    """Intelligent Task Classifier & Model Router for SkillBridge Multi-Model AI (Gemini + Groq)."""

    @staticmethod
    def route_task(task_type: str, user_preference: str = "auto") -> Tuple[str, List[str]]:
        # Interview generation should always use Gemini as primary provider
        if task_type == "interview_generation":
            return "gemini_only", ["gemini-1.5-flash"]
        """
        Determines the primary and secondary execution strategy for a given AI task.
        Returns: (routing_strategy, models_to_invoke)
        Strategies: 'gemini_only', 'groq_only', 'hybrid_synthesis', 'fallback'
        """
        if user_preference == "gemini":
            return "gemini_only", ["gemini-1.5-flash"]
        elif user_preference in ["groq", "grok"]:
            return "groq_only", ["llama-3.3-70b-versatile"]
        elif user_preference == "hybrid":
            return "hybrid_synthesis", ["gemini-1.5-flash", "llama-3.3-70b-versatile"]

        # Intelligent Task-Based Classification
        if task_type in ["skill_gap", "learning_recommendations", "resume_suggestions", "cohort_insights"]:
            # Structured educational & taxonomy tasks benefit most from Gemini's reasoning
            return "gemini_only", ["gemini-1.5-flash"]

        elif task_type in ["candidate_analysis", "curriculum_trends"]:
            # Ultra-fast real-world hiring market & industry demand insights from Groq
            return "groq_only", ["llama-3.3-70b-versatile"]

        elif task_type in ["candidate_matching", "career_guidance"]:
            # High-stakes multi-perspective decisions synthesize both Gemini & Groq
            return "hybrid_synthesis", ["gemini-1.5-flash", "llama-3.3-70b-versatile"]

        else:
            return "gemini_only", ["gemini-1.5-flash"]


model_router = ModelRouter()
