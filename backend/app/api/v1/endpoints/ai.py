from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from app.core.security import require_roles, get_current_user
from app.models.enums import UserRole
from app.services.ai.orchestrator import ai_orchestrator
from app.schemas.ai import (
    SkillGapAnalysisRequest,
    SkillGapAnalysisResponse,
    CareerRecommendationsRequest,
    CareerRecommendationsResponse,
    LearningRecommendationsRequest,
    LearningRecommendationsResponse,
    ResumeSuggestionsRequest,
    ResumeSuggestionsResponse,
    CandidateMatchRequest,
    CandidateMatchResponse,
    CohortInsightsRequest,
    CohortInsightsResponse,
    AIAssistantChatRequest,
    AIAssistantChatResponse,
)

router = APIRouter(tags=["Multi-Model AI"])

# -----------------------------------------------------------------------------
# 0. Health & Engine Status
# -----------------------------------------------------------------------------
@router.get("/health")
def get_ai_engine_health():
    """Returns AI multi-model engine status and operational readiness."""
    return {
        "status": "online",
        "models": {
            "gemini": "active (gemini-1.5-flash)",
            "groq": "active (llama-3.3-70b-versatile via Groq LPU)",
            "multi_model_orchestrator": "active"
        },
        "capabilities": [
            "student_skill_gap_analysis",
            "career_pathway_guidance",
            "learning_recommendations",
            "resume_optimization",
            "candidate_matching",
            "cohort_pedagogical_insights",
            "role_scoped_assistant"
        ]
    }


# -----------------------------------------------------------------------------
# 1. Student AI Endpoints
# -----------------------------------------------------------------------------
@router.post("/student/skill-gap", response_model=SkillGapAnalysisResponse)
async def analyze_student_skill_gap(
    payload: SkillGapAnalysisRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Run diagnostic skill-gap analysis comparing student competencies with a target role."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return await ai_orchestrator.analyze_skill_gap(
        user_id=user_id,
        target_role=payload.target_role or "Full Stack Engineer",
        custom_skills=payload.custom_skills
    )


@router.post("/student/career-recommendations", response_model=CareerRecommendationsResponse)
async def get_student_career_recommendations(
    payload: CareerRecommendationsRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Generate personalized career pathways and starting salary projections."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return await ai_orchestrator.get_career_recommendations(
        user_id=user_id,
        interests=payload.interests
    )


@router.post("/student/learning-recommendations", response_model=LearningRecommendationsResponse)
async def get_student_learning_recommendations(
    payload: LearningRecommendationsRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Recommend targeted courses and labs from SWAYAM/NPTEL to close identified gaps."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return await ai_orchestrator.get_learning_recommendations(
        user_id=user_id,
        focus_skills=payload.focus_skills
    )


@router.post("/student/resume-suggestions", response_model=ResumeSuggestionsResponse)
async def get_student_resume_suggestions(
    payload: ResumeSuggestionsRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Generate ATS keyword enhancements and quantified bullet point suggestions."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return await ai_orchestrator.get_resume_suggestions(
        user_id=user_id,
        target_role=payload.target_job_title,
        custom_summary=payload.custom_summary
    )


# -----------------------------------------------------------------------------
# 2. Industry / HR AI Endpoints
# -----------------------------------------------------------------------------
@router.post("/industry/candidate-match", response_model=CandidateMatchResponse)
async def match_industry_candidates(
    payload: CandidateMatchRequest,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Synthesize candidate compatibility scores, matching skills, and recruiter rationales."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000003"))
    return await ai_orchestrator.match_candidates(
        user_id=user_id,
        opportunity_id=payload.opportunity_id,
        model_mode=payload.model_mode or "hybrid"
    )


# -----------------------------------------------------------------------------
# 3. Academician / Faculty AI Endpoints
# -----------------------------------------------------------------------------
@router.post("/academician/student-insights", response_model=CohortInsightsResponse)
async def get_academician_cohort_insights(
    payload: CohortInsightsRequest,
    current_user: Any = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    """Analyze authorized student cohort data and identify systemic gaps and interventions."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000002"))
    return await ai_orchestrator.get_cohort_insights(
        user_id=user_id,
        department_id=payload.department_id
    )


# -----------------------------------------------------------------------------
# 4. Role-Scoped AI Assistant Chat
# -----------------------------------------------------------------------------
@router.post("/assistant/chat", response_model=AIAssistantChatResponse)
async def chat_with_ai_assistant(
    payload: AIAssistantChatRequest,
    current_user: Any = Depends(get_current_user)
):
    """Contextual role-aware AI chat assistant with domain suggestions."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "guest"))
    role_obj = getattr(current_user, "role", "student")
    role_str = getattr(role_obj, "value", str(role_obj)).lower().replace("userrole.", "")
    return await ai_orchestrator.assistant_chat(
        user_id=user_id,
        role=role_str,
        message=payload.message,
        history=payload.conversation_history
    )
