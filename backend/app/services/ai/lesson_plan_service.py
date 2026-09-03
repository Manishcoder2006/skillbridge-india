from typing import List, Dict, Any

from app.services.ai.prompts import PromptTemplates, sanitize_user_context

class LessonPlanService:
    """Service that generates a structured lesson plan JSON using Gemini/Groq.
    The lesson plan includes sections with titles, narration text, visual description,
    and estimated duration (seconds) for each section.
    """

    async def generate_lesson_plan(self, topic: str, user_id: str) -> Dict[str, Any]:
        # Build a prompt that asks Gemini (primary) to produce a lesson plan.
        prompt = PromptTemplates.lesson_plan_prompt(topic=topic, user_id=user_id)
        fallback_data = {
            "topic": topic,
            "title": f"Learning {topic}",
            "sections": [
                {
                    "title": "Introduction",
                    "narration": f"Welcome to the lesson on {topic}.",
                    "visual": "Title slide with topic name",
                    "duration_seconds": 30,
                },
                {
                    "title": "Core Concepts",
                    "narration": f"We will cover the core concepts of {topic}.",
                    "visual": "Bullet points outlining key ideas",
                    "duration_seconds": 120,
                },
                {
                    "title": "Summary",
                    "narration": f"That concludes the lesson on {topic}.",
                    "visual": "Summary slide",
                    "duration_seconds": 30,
                },
            ],
        }
        # Use the existing AI orchestrator services directly.
        from app.services.ai.gemini_service import gemini_service
        from app.services.ai.groq_service import groq_service
        from app.services.ai.router import model_router

        strategy, models = model_router.route_task("lesson_plan_generation")
        # Try Gemini first.
        try:
            parsed, latency, is_fallback = await gemini_service.generate_structured_json(
                prompt=prompt,
                system_instruction=PromptTemplates.SYSTEM_BASE,
                fallback_data=fallback_data,
            )
        except Exception:
            parsed = None
            latency = 0
            is_fallback = True
        # If Gemini fell back, try Groq.
        if is_fallback and groq_service.api_key and not groq_service.api_key.startswith("your-"):
            try:
                g_parsed, g_latency, g_is_fallback = await groq_service.generate_structured_json(
                    prompt=prompt,
                    system_instruction=PromptTemplates.SYSTEM_BASE,
                    fallback_data=fallback_data,
                )
                if not g_is_fallback and g_parsed:
                    parsed = g_parsed
                    latency = g_latency
                    is_fallback = False
                    models = ["llama-3.3-70b-versatile (Groq LPU)"]
            except Exception:
                pass
        # Final fallback.
        if not parsed or is_fallback:
            parsed = fallback_data
            is_fallback = True
        return {
            "lesson_plan": parsed,
            "ai_meta": {
                "model_used": models[0] if not is_fallback else "SkillBridge LessonPlan Fallback",
                "routing_strategy": strategy,
                "latency_ms": latency,
                "is_simulated_fallback": is_fallback,
            },
        }
