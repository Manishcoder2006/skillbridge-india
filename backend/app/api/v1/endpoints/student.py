import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import require_roles, AuthenticatedUser
from app.models.enums import UserRole
from app.repositories.student_repository import student_repo
from app.services.student_service import student_service
from app.schemas.student import (
    StudentDashboardSummaryResponse,
    StudentFullProfileResponse,
    StudentProfileUpdateRequest,
    StudentSkillCreate,
    StudentSkillResponse,
    AssessmentListResponse,
    AssessmentDetailResponse,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
    LearningResourceResponse,
    LearningProgressUpdateRequest,
    OpportunityResponse,
    ApplicationSubmitRequest,
    ApplicationResponse,
    ResumeDataSchema,
    ResumeResponse,
)

logger = logging.getLogger("skillbridge.api.student")
router = APIRouter()

student_guard = require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN])

# ------------------------------------------------------------------------------
# 1. Dashboard Overview
# ------------------------------------------------------------------------------
@router.get("/dashboard-summary", response_model=StudentDashboardSummaryResponse)
def get_student_dashboard_summary(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_service.get_dashboard_summary(current_user.id)

# ------------------------------------------------------------------------------
# 2. My Profile
# ------------------------------------------------------------------------------
@router.get("/profile", response_model=StudentFullProfileResponse)
def get_student_profile(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_full_student_profile(current_user.id)

@router.put("/profile", response_model=StudentFullProfileResponse)
def update_student_profile(
    payload: StudentProfileUpdateRequest,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    update_data = payload.model_dump(exclude_unset=True)
    return student_repo.update_student_profile(current_user.id, update_data)

# ------------------------------------------------------------------------------
# 3. Student Skills
# ------------------------------------------------------------------------------
@router.get("/skills", response_model=List[StudentSkillResponse])
def get_student_skills(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_student_skills(current_user.id)

@router.post("/skills", response_model=StudentSkillResponse)
def add_student_skill(
    payload: StudentSkillCreate,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.add_student_skill(current_user.id, payload.model_dump())

@router.delete("/skills/{skill_id}")
def delete_student_skill(
    skill_id: str,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    success = student_repo.delete_student_skill(current_user.id, skill_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")
    return {"message": "Skill removed successfully."}

# ------------------------------------------------------------------------------
# 4. Skill Assessments
# ------------------------------------------------------------------------------
@router.get("/assessments", response_model=List[AssessmentListResponse])
def list_assessments(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_assessments()

@router.get("/assessments/{assessment_id}", response_model=AssessmentDetailResponse)
def get_assessment_detail(
    assessment_id: str,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    assessment = student_repo.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")
    return assessment

@router.post("/assessments/{assessment_id}/submit", response_model=AssessmentResultResponse)
def submit_assessment(
    assessment_id: str,
    payload: AssessmentSubmitRequest,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_service.evaluate_assessment(current_user.id, assessment_id, payload.answers)

@router.get("/assessment-results", response_model=List[AssessmentResultResponse])
def get_assessment_results(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_student_assessment_results(current_user.id)

# ------------------------------------------------------------------------------
# 5. Learning Resources
# ------------------------------------------------------------------------------
@router.get("/learning-resources", response_model=List[LearningResourceResponse])
def list_learning_resources(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_learning_resources(current_user.id)

@router.post("/learning-progress")
def update_learning_progress(
    payload: LearningProgressUpdateRequest,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.update_learning_progress(
        current_user.id,
        payload.resource_id,
        payload.status,
        payload.progress_percent
    )

# ------------------------------------------------------------------------------
# 6. Opportunities (Jobs & Internships)
# ------------------------------------------------------------------------------
@router.get("/opportunities", response_model=List[OpportunityResponse])
def list_opportunities(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_opportunities(current_user.id)

@router.get("/opportunities/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity_details(
    opportunity_id: str,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    opp = student_repo.get_opportunity_by_id(opportunity_id, current_user.id)
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")
    return opp

@router.post("/opportunities/{opportunity_id}/apply", response_model=ApplicationResponse)
def apply_opportunity(
    opportunity_id: str,
    payload: ApplicationSubmitRequest,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    try:
        return student_repo.apply_for_opportunity(current_user.id, opportunity_id, payload.notes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# ------------------------------------------------------------------------------
# 7. Applications Tracker
# ------------------------------------------------------------------------------
@router.get("/applications", response_model=List[ApplicationResponse])
def list_student_applications(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_student_applications(current_user.id)

# ------------------------------------------------------------------------------
# 8. Resume Builder
# ------------------------------------------------------------------------------
@router.get("/resume", response_model=ResumeResponse)
def get_student_resume(
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.get_student_resume(current_user.id)

@router.put("/resume", response_model=ResumeResponse)
def update_student_resume(
    payload: ResumeDataSchema,
    current_user: AuthenticatedUser = Depends(student_guard)
):
    return student_repo.update_student_resume(current_user.id, payload.model_dump())
