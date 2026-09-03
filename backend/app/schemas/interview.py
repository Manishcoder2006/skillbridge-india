from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.ai import AIMeta

# -----------------------------------------------------------------------------
# Interview Request & Configuration Schemas
# -----------------------------------------------------------------------------
class InterviewStartRequest(BaseModel):
    interview_type: str = Field(..., description="technical | hr | custom")
    role: str = Field(..., description="Target role e.g. Backend Developer")
    experience_level: Optional[str] = "intermediate"  # beginner | intermediate | advanced
    skills: Optional[List[str]] = Field(default_factory=list)
    interview_focus: Optional[str] = "technical"  # technical | hr | system_design | project_based | mixed
    number_of_questions: Optional[int] = 5  # 5 | 10 | 15
    resume_personalization: Optional[bool] = False
    job_description: Optional[str] = None
    custom_instructions: Optional[str] = None


class InterviewQuestion(BaseModel):
    id: str
    question_number: int
    question_text: str
    category: str
    difficulty: str = "intermediate"  # beginner | intermediate | advanced
    hint: Optional[str] = None
    evaluation_criteria: Optional[List[str]] = Field(default_factory=list)


class InterviewResponse(BaseModel):
    id: str
    user_id: str
    interview_type: str
    role: str
    experience_level: str
    status: str = "in_progress"  # in_progress | completed | abandoned
    total_questions: int
    current_question_index: int = 0
    questions: List[InterviewQuestion]
    created_at: str
    ai_meta: Optional[AIMeta] = None


# -----------------------------------------------------------------------------
# Answer Submission & Evaluation Schemas
# -----------------------------------------------------------------------------
class AnswerSubmitRequest(BaseModel):
    question_id: str
    answer_text: str


class AnswerEvaluationResponse(BaseModel):
    question_id: str
    score: int = Field(..., ge=0, le=10, description="Score from 0 to 10")
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    suggested_answer_points: Optional[List[str]] = Field(default_factory=list)
    next_question: Optional[InterviewQuestion] = None
    is_final_question: Optional[bool] = False
    ai_meta: Optional[AIMeta] = None


# -----------------------------------------------------------------------------
# Performance Report & History Schemas
# -----------------------------------------------------------------------------
class CategoryScore(BaseModel):
    category: str  # Technical Depth, Communication, Problem Solving, Role Relevance
    score: int  # 0 to 100


class QuestionReviewItem(BaseModel):
    question_number: int
    question_text: str
    category: str
    answer_text: str
    score: int
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)


class FinalPerformanceReportResponse(BaseModel):
    interview_id: str
    role: str
    interview_type: str
    overall_score: int  # 0 to 100
    category_scores: List[CategoryScore]
    strengths: List[str]
    weaknesses: List[str]
    questions_answered_well: List[str]
    questions_needing_improvement: List[str]
    personalized_recommendations: List[str]
    suggested_skills_to_practice: List[str]
    recommended_next_steps: List[str]
    question_reviews: List[QuestionReviewItem]
    ai_meta: Optional[AIMeta] = None


class InterviewHistoryItem(BaseModel):
    id: str
    role: str
    interview_type: str
    overall_score: Optional[int] = None
    total_questions: int
    answered_questions: int
    status: str
    created_at: str
