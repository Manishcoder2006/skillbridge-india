from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from app.core.security import require_roles, get_current_user
from app.models.enums import UserRole
from app.services.ai.orchestrator import ai_orchestrator
from app.core.database import db_manager
from app.schemas.ai import (
    SkillGapAnalysisRequest,
    SkillGapAnalysisResponse,
    CareerRecommendationsRequest,
    CareerRecommendationsResponse,
    LearningRecommendationsRequest,
    LearningRecommendationsResponse,
    ResumeSuggestionsRequest,
    ResumeSuggestionsResponse,
    ResumeBulletImproveRequest,
    ResumeBulletImproveResponse,
    ResumeSummaryGenerateRequest,
    ResumeSummaryGenerateResponse,
    CandidateMatchRequest,
    CandidateMatchResponse,
    CohortInsightsRequest,
    CohortInsightsResponse,
    AIAssistantChatRequest,
    AIAssistantChatResponse,
    VideoTutorRequest,
    VideoTutorResponse,
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
    """Generate ATS keyword enhancements, match diagnostic, and quantified bullet point suggestions."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return await ai_orchestrator.get_resume_suggestions(
        user_id=user_id,
        target_role=payload.target_job_title,
        job_description=payload.target_job_description,
        custom_summary=payload.custom_summary,
        custom_resume_data=payload.resume_data
    )


@router.post("/student/resume-summary-generate", response_model=ResumeSummaryGenerateResponse)
async def generate_student_resume_summary(
    payload: ResumeSummaryGenerateRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Generate an authentic, high-impact executive summary based on the candidate's real skills & background."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return await ai_orchestrator.generate_resume_summary(
        user_id=user_id,
        target_role=payload.target_role,
        skills=payload.skills,
        experience_highlights=payload.experience_highlights,
        education_highlights=payload.education_highlights,
        tone=payload.tone or "impactful"
    )


@router.post("/student/resume-bullet-improve", response_model=ResumeBulletImproveResponse)
async def improve_student_resume_bullet(
    payload: ResumeBulletImproveRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Enhance a bullet point using strong action verbs, quantifiable metrics, and ATS keywords."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return await ai_orchestrator.improve_resume_bullet(
        user_id=user_id,
        bullet_text=payload.bullet_text,
        target_role=payload.target_role,
        context_type=payload.context_type or "experience"
    )

# -----------------------------------------------------------------------------
# 5. Video Tutor Endpoints
# -----------------------------------------------------------------------------

from fastapi import BackgroundTasks
from app.services.ai.video_tutor_service import VideoTutorService
from app.repositories.learning_video_repository import LearningVideoRepository

video_tutor_service = VideoTutorService()

@router.post("/student/video-tutor", response_model=VideoTutorResponse, status_code=202)
async def create_video_tutor_job(
    payload: VideoTutorRequest,
    background_tasks: BackgroundTasks,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Create a video tutor generation job.
    - Enforces one active job per student.
    - Returns job_id and initial status.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "guest"))
    repo = LearningVideoRepository()
    if repo.has_active_job(user_id):
        raise HTTPException(status_code=429, detail="A video generation job is already in progress for this user.")
    job = repo.create_job(user_id=user_id, topic=payload.topic, max_duration_seconds=payload.max_duration_seconds)
    # Enqueue background processing
    background_tasks.add_task(video_tutor_service.process_job, job.job_id)
    return VideoTutorResponse(job_id=job.job_id, status=job.status, video_url=None)

@router.get("/student/video-tutor/{job_id}", response_model=VideoTutorResponse)
async def get_video_tutor_job(
    job_id: str,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Retrieve status and signed video URL for a completed job.
    Generates a fresh 7‑day signed URL from Supabase.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "guest"))
    repo = LearningVideoRepository()
    job = repo.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")
    video_url = None
    if job.status == "completed" and job.video_path:
        # Generate signed URL (7 days = 604800 seconds)
        try:
            signed = db_manager.client.storage.from_("video-tutor").create_signed_url(
                path=job.video_path, expires_in=604800
            )
            video_url = signed.get("signedURL")
        except Exception:
            # If signed URL generation fails, keep None
            video_url = None
    return VideoTutorResponse(job_id=job.job_id, status=job.status, video_url=video_url)


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
