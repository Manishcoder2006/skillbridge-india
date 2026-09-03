from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.ai import AIMeta

# -----------------------------------------------------------------------------
# Micro-Learning Request & Path Schemas
# -----------------------------------------------------------------------------
class LearningPathRequest(BaseModel):
    topic: str = Field(..., description="Topic to learn, e.g. 'Frontend Development' or 'FastAPI Concurrency'")
    difficulty: Optional[str] = "beginner"  # beginner | intermediate | advanced
    learning_goal: Optional[str] = "interview_prep"  # interview_prep | quick_revision | practical_skills


class MicroLesson(BaseModel):
    lesson_number: int
    title: str
    duration_seconds: int = 60
    objective: str
    script: str  # Spoken narration script for SpeechSynthesis (~30-120 seconds spoken text)
    key_points: List[str] = Field(default_factory=list)
    example: Optional[str] = None
    code_snippet: Optional[str] = None
    code_language: Optional[str] = None  # html | css | javascript | python | sql | bash
    visual_diagram: Optional[str] = None  # ASCII or structured visual representation
    is_completed: bool = False


class LearningPathResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    difficulty: str
    learning_goal: str
    total_lessons: int
    estimated_total_minutes: int
    lessons: List[MicroLesson]
    created_at: str
    ai_meta: Optional[AIMeta] = None


# -----------------------------------------------------------------------------
# Contextual "Ask AI Tutor" Schemas
# -----------------------------------------------------------------------------
class AskTutorRequest(BaseModel):
    path_id: str
    lesson_number: int
    lesson_title: str
    question: str
    context_script: Optional[str] = None


class AskTutorResponse(BaseModel):
    lesson_number: int
    question: str
    answer: str
    key_takeaway: Optional[str] = None
    ai_meta: Optional[AIMeta] = None


# -----------------------------------------------------------------------------
# Progress Tracking Schemas
# -----------------------------------------------------------------------------
class LessonProgressUpdateRequest(BaseModel):
    path_id: str
    lesson_number: int
    is_completed: bool = True
