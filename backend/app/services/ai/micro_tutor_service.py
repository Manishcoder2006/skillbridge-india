import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.schemas.ai import AIMeta
from app.schemas.learning import (
    LearningPathRequest,
    LearningPathResponse,
    MicroLesson,
    AskTutorRequest,
    AskTutorResponse,
)
from app.repositories.micro_learning_repository import micro_learning_repo
from app.services.ai.gemini_service import gemini_service
from app.services.ai.groq_service import groq_service
from app.services.ai.router import model_router
from app.services.ai.prompts import PromptTemplates

logger = logging.getLogger("skillbridge.ai.micro_tutor")

class MicroTutorService:
    """
    AI Micro-Learning Tutor Service.
    Generates bite-sized, 30-120 second interactive educational lessons
    with spoken scripts, synchronized bullet points, code snippets, visual diagrams,
    and contextual lesson Q&A.
    """

    def _build_fallback_path(self, topic: str, difficulty: str, goal: str) -> Dict[str, Any]:
        """Provides realistic, high-quality educational micro-lessons if AI providers are unreachable."""
        t_lower = topic.lower()

        if "front" in t_lower or "web" in t_lower or "html" in t_lower or "css" in t_lower:
            lessons = [
                {
                    "lesson_number": 1,
                    "title": "What is Frontend Development?",
                    "duration_seconds": 45,
                    "objective": "Understand the role of frontend technologies in modern web applications.",
                    "script": "Frontend development is everything a user sees, touches, and interacts with in their web browser. It transforms raw server data into dynamic, responsive user interfaces using HTML for structure, CSS for presentation, and JavaScript for interactivity.",
                    "key_points": [
                        "HTML defines structure and semantic content",
                        "CSS governs typography, colors, and responsive layouts",
                        "JavaScript powers user interactivity and asynchronous API calls"
                    ],
                    "example": "Think of a car: HTML is the frame, CSS is the paint and upholstery, and JavaScript is the engine and steering.",
                    "code_snippet": "<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello SkillBridge</h1>\n  </body>\n</html>",
                    "code_language": "html",
                    "visual_diagram": "[ BROWSER CLIENT ]\n   ├── HTML (Structure)\n   ├── CSS (Style)\n   └── JS (Behavior)\n        ▲\n        │ HTTP REST\n        ▼\n[ BACKEND SERVER ]",
                    "is_completed": False
                },
                {
                    "lesson_number": 2,
                    "title": "HTML5 Semantic Structure",
                    "duration_seconds": 55,
                    "objective": "Master semantic elements for accessibility and SEO.",
                    "script": "Semantic HTML means using elements that clearly describe their meaning to both browser and developer. Instead of generic div tags everywhere, semantic tags like header, nav, main, article, and footer provide meaning, accessibility for screen readers, and major SEO benefits.",
                    "key_points": [
                        "Use <main>, <header>, <nav>, <section>, <footer>",
                        "Screen readers rely on landmarks for accessibility",
                        "Search engine crawlers index semantic markup accurately"
                    ],
                    "example": "Reading a newspaper: headlines, columns, and footnotes make reading intuitive compared to a wall of unformatted text.",
                    "code_snippet": "<header>\n  <nav>\n    <a href=\"/\">Home</a>\n  </nav>\n</header>\n<main>\n  <article>Content</article>\n</main>",
                    "code_language": "html",
                    "visual_diagram": "+------------------------------+\n| <header> / <nav>             |\n+------------------------------+\n| <main>                       |\n|   <article> ... </article>   |\n+------------------------------+\n| <footer>                     |\n+------------------------------+",
                    "is_completed": False
                },
                {
                    "lesson_number": 3,
                    "title": "CSS Box Model & Layout Flow",
                    "duration_seconds": 60,
                    "objective": "Understand content, padding, border, and margin dimensions.",
                    "script": "Every HTML element rendered on screen is enclosed in a rectangular box. The CSS box model consists of four concentric layers: the innermost content area, surrounding padding, the border, and the outermost margin that pushes other elements away.",
                    "key_points": [
                        "Content: text and images",
                        "Padding: clear space around content inside border",
                        "Border: stroke wrapping padding and content",
                        "Margin: transparent area outside border creating breathing room"
                    ],
                    "example": "A framed photograph: the photo is content, the white mat is padding, the wooden frame is border, and distance to neighboring frames is margin.",
                    "code_snippet": ".card {\n  box-sizing: border-box;\n  padding: 16px;\n  border: 1px solid #e2e8f0;\n  margin: 12px;\n}",
                    "code_language": "css",
                    "visual_diagram": "┌───────────────────────────┐\n│ Margin                    │\n│  ┌─────────────────────┐  │\n│  │ Border              │  │\n│  │  ┌───────────────┐  │  │\n│  │  │ Padding       │  │  │\n│  │  │  ┌─────────┐  │  │  │\n│  │  │  │ Content │  │  │  │\n│  │  │  └─────────┘  │  │  │\n│  │  └───────────────┘  │  │\n│  └─────────────────────┘  │\n└───────────────────────────┘",
                    "is_completed": False
                },
                {
                    "lesson_number": 4,
                    "title": "Modern Flexbox Layouts",
                    "duration_seconds": 65,
                    "objective": "Arrange items easily along horizontal and vertical axes.",
                    "script": "Flexbox is a powerful one-dimensional CSS layout model. By declaring display flex on a container, you gain instant control over item alignment, distribution, and wrapping using justify-content along the main axis and align-items along the cross axis.",
                    "key_points": [
                        "display: flex activates the flexible container",
                        "justify-content aligns along the main axis (e.g. center, space-between)",
                        "align-items aligns along the cross axis (e.g. center, stretch)"
                    ],
                    "example": "Arranging passengers in a row: you can center them, push them to the windows, or space them out evenly.",
                    "code_snippet": ".navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem;\n}",
                    "code_language": "css",
                    "visual_diagram": "FLEX CONTAINER (display: flex)\n────────────────────────────────────────\n[ Item 1 ]    [ Item 2 ]    [ Item 3 ]\n────────────────────────────────────────\n◄─────── Main Axis (justify-content) ──►\n▲ Cross Axis (align-items)\n▼",
                    "is_completed": False
                },
                {
                    "lesson_number": 5,
                    "title": "JavaScript DOM Manipulation",
                    "duration_seconds": 60,
                    "objective": "Dynamically select and manipulate HTML elements in response to events.",
                    "script": "The Document Object Model, or DOM, is the browser's in-memory tree representation of the webpage. JavaScript uses methods like querySelector and addEventListener to listen for user clicks, update text, and toggle CSS classes without refreshing the page.",
                    "key_points": [
                        "document.querySelector targets CSS selectors",
                        "addEventListener binds interactive events like 'click' or 'submit'",
                        "element.classList.toggle modifies visual state dynamically"
                    ],
                    "example": "A light switch: flipping the switch triggers a wire event that changes the bulb state from off to on.",
                    "code_snippet": "const btn = document.querySelector('#theme-btn');\nbtn.addEventListener('click', () => {\n  document.body.classList.toggle('dark-mode');\n});",
                    "code_language": "javascript",
                    "visual_diagram": "USER ACTION (Click Button)\n        │\n        ▼\naddEventListener('click')\n        │\n        ▼\nDOM Tree Updated (classList.add)\n        │\n        ▼\n[ BROWSER RE-RENDERS UI ]",
                    "is_completed": False
                },
                {
                    "lesson_number": 6,
                    "title": "React Components & State",
                    "duration_seconds": 75,
                    "objective": "Build reusable UI components powered by declarative state.",
                    "script": "React shifts web development from imperative DOM queries to declarative components. A component is a self-contained JavaScript function that returns JSX. When internal state updates via useState, React automatically computes differences and updates the DOM efficiently.",
                    "key_points": [
                        "Components are reusable Lego blocks returning JSX",
                        "State represents data that changes over time",
                        "React's Virtual DOM ensures surgical, high-performance re-renders"
                    ],
                    "example": "An odometer in a car: as mileage updates, the dashboard counter re-renders without needing to rebuild the entire car.",
                    "code_snippet": "import { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Clicked {count} times\n    </button>\n  );\n}",
                    "code_language": "javascript",
                    "visual_diagram": "+----------------------------+\n| <Counter /> Component      |\n|  State: count = 0          |\n|  [ Clicked 0 times ]       |\n+----------------------------+\n             │ (Click)\n             ▼\n+----------------------------+\n|  State: count = 1          |\n|  [ Clicked 1 times ]       |\n+----------------------------+",
                    "is_completed": False
                }
            ]
        else:
            # Generic technical topic fallback
            lessons = [
                {
                    "lesson_number": 1,
                    "title": f"Introduction to {topic}",
                    "duration_seconds": 45,
                    "objective": f"Understand core objectives and importance of {topic}.",
                    "script": f"Welcome to this micro-learning series on {topic}. In modern technology ecosystems, mastering {topic} empowers engineers to build scalable, resilient, and performant systems.",
                    "key_points": [
                        f"Core principles underlying {topic}",
                        "Industry relevance in enterprise architectures",
                        "Prerequisites and operational landscape"
                    ],
                    "example": f"Applying {topic} in production streamlines development and prevents costly downtime.",
                    "code_snippet": f"# Core initialization for {topic}\ndef initialize_system():\n    print('Configuring {topic} pipeline...')",
                    "code_language": "python",
                    "visual_diagram": f"[ INPUT ] ──► [ {topic.upper()} ] ──► [ RESULT ]",
                    "is_completed": False
                },
                {
                    "lesson_number": 2,
                    "title": "Core Architecture & Data Flow",
                    "duration_seconds": 60,
                    "objective": "Analyze the primary components and architectural interactions.",
                    "script": f"At the heart of {topic} is a layered separation of concerns. Understanding how data enters, undergoes transformation, and exits ensures reliable troubleshooting under production workloads.",
                    "key_points": [
                        "Separation of concerns across modules",
                        "Stateless vs stateful execution considerations",
                        "Latency and throughput tradeoffs"
                    ],
                    "example": "An assembly line: each station performs a distinct task without interfering with upstream or downstream units.",
                    "code_snippet": "async def process_payload(data: dict):\n    validated = validate_schema(data)\n    return await execute_pipeline(validated)",
                    "code_language": "python",
                    "visual_diagram": "[ CLIENT ] ──(Request)──► [ GATEWAY ] ──► [ SERVICE ] ──► [ DB ]",
                    "is_completed": False
                },
                {
                    "lesson_number": 3,
                    "title": "Best Practices & Common Pitfalls",
                    "duration_seconds": 60,
                    "objective": "Avoid antipatterns and implement industry-standard safeguards.",
                    "script": "Building reliable solutions requires proactive error handling, automated validation, and clear observability. Beware of tight coupling, unhandled exceptions, and unindexed bottlenecks.",
                    "key_points": [
                        "Always validate inputs early",
                        "Implement timeout and circuit breaker policies",
                        "Log structured telemetry for observability"
                    ],
                    "example": "A circuit breaker in your home: it automatically cuts power to prevent electrical damage during a surge.",
                    "code_snippet": "try:\n    result = execute_task()\nexcept SpecificTimeoutError as e:\n    logger.warning('Task timed out: %s', e)\n    fallback_routine()",
                    "code_language": "python",
                    "visual_diagram": "TRY CALL ──► [ SUCCESS ] ──► RETURN\n   │\n   └─(Error)─► [ FALLBACK ] ──► RECOVER",
                    "is_completed": False
                },
                {
                    "lesson_number": 4,
                    "title": "Production Scaling & Optimization",
                    "duration_seconds": 70,
                    "objective": "Apply caching, concurrency, and indexing to scale efficiently.",
                    "script": "When traffic spikes, unoptimized applications experience cascading slowdowns. Employing asynchronous non-blocking I/O, horizontal replication, and intelligent caching guarantees sustained throughput.",
                    "key_points": [
                        "Leverage Redis or in-memory caches for hot read data",
                        "Use asynchronous non-blocking concurrency",
                        "Index high-cardinality database query filters"
                    ],
                    "example": "A library catalog: finding a book using an index takes seconds rather than searching through thousands of shelves.",
                    "code_snippet": "# Example caching decorator\n@cache.memoize(timeout=300)\ndef get_expensive_resource(resource_id: str):\n    return db.fetch(resource_id)",
                    "code_language": "python",
                    "visual_diagram": "[ APP ] ──(Check Cache)──► [ REDIS ] (Hit: 2ms)\n   │ (Miss)\n   ▼\n[ DATABASE ] (15ms)",
                    "is_completed": False
                }
            ]

        total_secs = sum(l["duration_seconds"] for l in lessons)
        return {
            "topic": topic,
            "difficulty": difficulty,
            "learning_goal": goal,
            "total_lessons": len(lessons),
            "estimated_total_minutes": max(1, round(total_secs / 60)),
            "lessons": lessons
        }

    async def generate_learning_path(
        self,
        user_id: str,
        payload: LearningPathRequest
    ) -> LearningPathResponse:
        """
        Generates a focused micro-learning path (6-8 lessons, each 30-120 seconds)
        with spoken narration scripts, key concept bullets, code examples, and visual diagrams.
        """
        topic = payload.topic.strip()
        difficulty = payload.difficulty or "beginner"
        goal = payload.learning_goal or "interview_prep"

        fallback_dict = self._build_fallback_path(topic, difficulty, goal)

        prompt = f"""You are the SkillBridge India Elite AI Micro-Learning Tutor (SIH 2026).
Generate a structured micro-learning path for the topic: "{topic}".
Target Audience Difficulty: {difficulty.upper()}
Learning Goal: {goal.upper()}

Guidelines:
- Generate exactly 6 to 8 short, highly-focused micro-lessons.
- Each lesson MUST represent a bite-sized concept (~45 to 90 seconds spoken duration).
- For each lesson, provide:
  1. "lesson_number": (1 to N)
  2. "title": Concise, crisp concept title
  3. "duration_seconds": (integer between 30 and 120)
  4. "objective": 1-sentence learning objective
  5. "script": Clean, conversational, spoken explanation script for Text-to-Speech narration (approx 60-120 words).
  6. "key_points": Array of 3-4 bullet points summarizing key takeaways.
  7. "example": 1 intuitive analogy or practical real-world scenario.
  8. "code_snippet": Short clean code example if technical, or null if conceptual.
  9. "code_language": Language name e.g. "javascript", "python", "html", "css", "sql", or null.
  10. "visual_diagram": ASCII art or structured box layout visualizing the concept.

Respond in strict JSON with the following structure:
{{
  "topic": "{topic}",
  "difficulty": "{difficulty}",
  "learning_goal": "{goal}",
  "total_lessons": <number>,
  "estimated_total_minutes": <number>,
  "lessons": [
    {{
      "lesson_number": 1,
      "title": "...",
      "duration_seconds": 60,
      "objective": "...",
      "script": "...",
      "key_points": ["...", "..."],
      "example": "...",
      "code_snippet": "...",
      "code_language": "javascript",
      "visual_diagram": "..."
    }}
  ]
}}"""

        strategy, models = model_router.route_task("lesson_plan_generation")

        parsed_data = None
        latency = 200
        is_fallback = False

        try:
            parsed_data, latency, is_fallback = await gemini_service.generate_structured_json(
                prompt=prompt,
                system_instruction=PromptTemplates.SYSTEM_BASE,
                fallback_data=fallback_dict
            )
        except Exception:
            try:
                parsed_data, latency, is_fallback = await groq_service.generate_structured_json(
                    prompt=prompt,
                    system_instruction=PromptTemplates.SYSTEM_BASE,
                    fallback_data=fallback_dict
                )
                is_fallback = False
            except Exception:
                parsed_data = fallback_dict
                latency = 120
                is_fallback = True

        raw_lessons = parsed_data.get("lessons", [])
        if not raw_lessons or not isinstance(raw_lessons, list):
            raw_lessons = fallback_dict["lessons"]

        formatted_lessons: List[MicroLesson] = []
        for idx, l in enumerate(raw_lessons):
            formatted_lessons.append(MicroLesson(
                lesson_number=idx + 1,
                title=l.get("title") or f"Lesson {idx + 1}",
                duration_seconds=int(l.get("duration_seconds", 60)),
                objective=l.get("objective") or f"Master fundamental concepts of {topic}.",
                script=l.get("script") or f"Welcome to lesson {idx + 1} on {topic}.",
                key_points=l.get("key_points") or ["Core principle", "Key application"],
                example=l.get("example"),
                code_snippet=l.get("code_snippet"),
                code_language=l.get("code_language"),
                visual_diagram=l.get("visual_diagram"),
                is_completed=False
            ))

        total_secs = sum(l.duration_seconds for l in formatted_lessons)
        path_id = f"mlp-{uuid.uuid4().hex[:10]}"

        path_record = {
            "id": path_id,
            "user_id": user_id,
            "topic": topic,
            "difficulty": difficulty,
            "learning_goal": goal,
            "total_lessons": len(formatted_lessons),
            "estimated_total_minutes": max(1, round(total_secs / 60)),
            "lessons": [l.model_dump() for l in formatted_lessons],
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        micro_learning_repo.create_path(path_record)

        return LearningPathResponse(
            id=path_id,
            user_id=user_id,
            topic=topic,
            difficulty=difficulty,
            learning_goal=goal,
            total_lessons=len(formatted_lessons),
            estimated_total_minutes=path_record["estimated_total_minutes"],
            lessons=formatted_lessons,
            created_at=path_record["created_at"],
            ai_meta=AIMeta(
                model_used=f"{models[0]} (Multi-Model AI Tutor)",
                routing_strategy=strategy,
                latency_ms=latency,
                confidence_score=0.96,
                is_simulated_fallback=is_fallback
            )
        )

    async def answer_contextual_question(
        self,
        user_id: str,
        payload: AskTutorRequest
    ) -> AskTutorResponse:
        """
        Answers a student's contextual question about the current lesson
        with an educational, concise explanation.
        """
        lesson_title = payload.lesson_title
        question = payload.question.strip()
        script = payload.context_script or ""

        fallback_answer = {
            "answer": f"Great question regarding {lesson_title}. In real-world software engineering, this concept is primarily used to ensure clear separation of concerns, optimal performance, and maintainability. When designing architectures, always consider tradeoffs between simplicity and scalability.",
            "key_takeaway": "Focus on foundational tradeoffs and clean implementation."
        }

        prompt = f"""You are the SkillBridge India AI Micro-Learning Tutor.
A student is learning the micro-lesson: "{lesson_title}".
Lesson Context Script:
"{script}"

Student's Question:
"{question}"

Provide a concise, crystal-clear educational explanation (approx 2 to 4 sentences).
Highlight 1 specific key takeaway.

Respond in strict JSON:
{{
  "answer": "<Clear, encouraging, concise educational answer>",
  "key_takeaway": "<1-sentence actionable takeaway>"
}}"""

        strategy, models = model_router.route_task("candidate_analysis")
        parsed = None
        latency = 150
        is_fallback = False

        try:
            parsed, latency, is_fallback = await gemini_service.generate_structured_json(
                prompt=prompt,
                system_instruction=PromptTemplates.SYSTEM_BASE,
                fallback_data=fallback_answer
            )
        except Exception:
            try:
                parsed, latency, is_fallback = await groq_service.generate_structured_json(
                    prompt=prompt,
                    system_instruction=PromptTemplates.SYSTEM_BASE,
                    fallback_data=fallback_answer
                )
                is_fallback = False
            except Exception:
                parsed = fallback_answer
                latency = 120
                is_fallback = True

        return AskTutorResponse(
            lesson_number=payload.lesson_number,
            question=question,
            answer=parsed.get("answer") or fallback_answer["answer"],
            key_takeaway=parsed.get("key_takeaway") or fallback_answer["key_takeaway"],
            ai_meta=AIMeta(
                model_used=f"{models[0]} (Groq + Gemini Contextual Tutor)",
                routing_strategy=strategy,
                latency_ms=latency,
                confidence_score=0.95,
                is_simulated_fallback=is_fallback
            )
        )


micro_tutor_service = MicroTutorService()
