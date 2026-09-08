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
    expected_key_points: Optional[List[str]] = Field(default_factory=list)


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
    score: int = Field(..., ge=0, le=100, description="Score from 0 to 100")
    technical_correctness: Optional[int] = Field(default=0, ge=0, le=40, description="Technical correctness (0-40)")
    relevance: Optional[int] = Field(default=0, ge=0, le=40, description="Relevance to question (0-25 for technical, 0-40 for HR)")
    completeness: Optional[int] = Field(default=0, ge=0, le=20, description="Completeness & depth (0-20)")
    communication: Optional[int] = Field(default=0, ge=0, le=25, description="Communication & clarity (0-15 for technical, 0-25 for HR)")
    professionalism: Optional[int] = Field(default=None, ge=0, le=15, description="Professionalism & consistency (0-15 for HR)")
    assessment: Optional[str] = Field(default="Evaluation complete", description="Overall assessment summary")
    covered_key_points: Optional[List[str]] = Field(default_factory=list, description="Concepts correctly addressed")
    missing_key_points: Optional[List[str]] = Field(default_factory=list, description="Important concepts missed")
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
    covered_key_points: Optional[List[str]] = Field(default_factory=list)
    missing_key_points: Optional[List[str]] = Field(default_factory=list)
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
