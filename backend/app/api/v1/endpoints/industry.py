from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.core.security import require_roles
from app.models.enums import UserRole
from app.schemas.industry import (
    CompanyProfileResponse,
    CompanyProfileUpdate,
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    ApplicationStatusUpdate,
    CandidateApplicationItem,
    RecruiterCandidateView,
    AIMatchingResponse,
    IndustryCollaborationProposalCreate,
    IndustryAnalyticsResponse,
    IndustryDashboardSummary,
)
from app.services.industry_service import industry_service

router = APIRouter(tags=["Industry & HR"])


# -----------------------------------------------------------------------------
# 1. Dashboard Summary
# -----------------------------------------------------------------------------
@router.get("/dashboard-summary", response_model=IndustryDashboardSummary)
def get_industry_dashboard_summary(
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Retrieve recruitment metrics overview for Industry / HR dashboard."""
    return industry_service.get_dashboard_summary(current_user)


# -----------------------------------------------------------------------------
# 2. Company Profile
# -----------------------------------------------------------------------------
@router.get("/company-profile", response_model=CompanyProfileResponse)
def get_company_profile(
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Retrieve corporate profile details and verified credentials."""
    return industry_service.get_company_profile(current_user)


@router.put("/company-profile", response_model=CompanyProfileResponse)
def update_company_profile(
    payload: CompanyProfileUpdate,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Update company details (protected fields like verification status and ownership are immutable)."""
    return industry_service.update_company_profile(
        current_user,
        payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else payload.dict(exclude_unset=True)
    )


# -----------------------------------------------------------------------------
# 3. Job & Internship Postings Management
# -----------------------------------------------------------------------------
@router.get("/postings", response_model=List[OpportunityResponse])
def get_company_postings(
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """List all job and internship opportunities posted by the authenticated company."""
    return industry_service.get_postings(current_user)


@router.post("/postings", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_posting(
    payload: OpportunityCreate,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Publish a new job or internship opportunity."""
    data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    return industry_service.create_posting(current_user, data)


@router.put("/postings/{posting_id}", response_model=OpportunityResponse)
def update_posting(
    posting_id: str,
    payload: OpportunityUpdate,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Edit or update status of an existing company posting."""
    data = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else payload.dict(exclude_unset=True)
    return industry_service.update_posting(current_user, posting_id, data)


@router.delete("/postings/{posting_id}")
def delete_posting(
    posting_id: str,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Remove a posting belonging to the authenticated company."""
    return industry_service.delete_posting(current_user, posting_id)


# -----------------------------------------------------------------------------
# 4. Candidates & Applications Pipeline
# -----------------------------------------------------------------------------
@router.get("/applications", response_model=List[CandidateApplicationItem])
def get_company_applications(
    status: Optional[str] = Query(None, description="Filter by status: applied, under_review, shortlisted, interview, selected, rejected"),
    search: Optional[str] = Query(None, description="Search candidate name, job title, or skill"),
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """List received candidate applications for company postings."""
    return industry_service.get_applications(current_user, status_filter=status, search_query=search)


@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Update candidate recruitment status (Applied, Under Review, Shortlisted, Interview, Selected, Rejected)."""
    data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    return industry_service.update_application_status(current_user, application_id, data)


@router.get("/candidates/{student_id}", response_model=RecruiterCandidateView)
def get_candidate_profile(
    student_id: str,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Inspect recruiter-facing candidate profile including verified skills, projects, and resume."""
    return industry_service.get_candidate_profile(current_user, student_id)


# -----------------------------------------------------------------------------
# 5. AI Candidate Matching Foundation (Phase 4 UI / Service Foundation)
# -----------------------------------------------------------------------------
@router.get("/matching/{opportunity_id}", response_model=AIMatchingResponse)
def get_ai_candidate_matches(
    opportunity_id: str,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Rule-based candidate ranking and skill gap compatibility foundation for Phase 4."""
    return industry_service.get_ai_candidate_matches(current_user, opportunity_id)


# -----------------------------------------------------------------------------
# 6. Learning & Collaboration Proposals
# -----------------------------------------------------------------------------
@router.get("/collaboration", response_model=List[Dict[str, Any]])
def get_collaboration_proposals(
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """List corporate sponsored workshops, FDPs, and research initiatives."""
    return industry_service.get_collaboration_proposals(current_user)


@router.post("/collaboration", status_code=status.HTTP_201_CREATED)
def create_collaboration_proposal(
    payload: IndustryCollaborationProposalCreate,
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Propose an academic-industry workshop, FDP, or mentorship program."""
    data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    return industry_service.create_collaboration_proposal(current_user, data)


# -----------------------------------------------------------------------------
# 7. Recruitment Analytics
# -----------------------------------------------------------------------------
@router.get("/analytics", response_model=IndustryAnalyticsResponse)
def get_industry_analytics(
    current_user: Any = Depends(require_roles([UserRole.INDUSTRY_HR, UserRole.SUPER_ADMIN]))
):
    """Retrieve recruitment pipeline analytics, status distribution, and posting performance."""
    return industry_service.get_analytics(current_user)
