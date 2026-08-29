from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, status, Query, Body
from app.core.security import require_roles
from app.models.enums import UserRole
from app.schemas.academician import (
    AcademicianFullProfileResponse,
    AcademicianProfileUpdateRequest,
    AcademicianDashboardSummaryResponse,
    AuthorizedStudentSummary,
    AuthorizedStudentDetailResponse,
    StudentAnalyticsResponse,
    FacultyContentCreate,
    FacultyContentUpdate,
    FacultyContentResponse,
    OpportunityRecommendationCreate,
    OpportunityRecommendationResponse,
    CollaborationInitiativeResponse,
    CollaborationParticipationCreate,
    CollaborationParticipationResponse,
    NotificationResponse
)
from app.services.academician_service import academician_service

router = APIRouter()

# ------------------------------------------------------------------------------
# 1. Dashboard Overview Summary
# ------------------------------------------------------------------------------
@router.get(
    "/dashboard-summary",
    response_model=AcademicianDashboardSummaryResponse,
    summary="Get academician dashboard overview metrics"
)
async def get_dashboard_summary(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_dashboard_summary(current_user)

# ------------------------------------------------------------------------------
# 2. Profile Management
# ------------------------------------------------------------------------------
@router.get(
    "/profile",
    response_model=AcademicianFullProfileResponse,
    summary="Get full academician profile"
)
async def get_profile(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_profile(current_user)

@router.put(
    "/profile",
    response_model=AcademicianFullProfileResponse,
    summary="Update allowed academician profile fields"
)
async def update_profile(
    payload: AcademicianProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.update_profile(current_user, payload.dict(exclude_unset=True))

# ------------------------------------------------------------------------------
# 3. Authorized Students & Detail View
# ------------------------------------------------------------------------------
@router.get(
    "/students",
    response_model=List[AuthorizedStudentSummary],
    summary="Get authorized students list scoped to academician's department & institution"
)
async def get_authorized_students(
    search: Optional[str] = Query(None, description="Search by name or email"),
    semester: Optional[int] = Query(None, ge=1, le=8, description="Filter by semester"),
    status: Optional[str] = Query(None, description="Filter by status (all, completed, pending, attention)"),
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_students(current_user, search, semester, status)

@router.get(
    "/students/{student_id}",
    response_model=AuthorizedStudentDetailResponse,
    summary="Get detailed academic and skill record for an authorized student"
)
async def get_student_detail(
    student_id: str,
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_student_detail(current_user, student_id)

# ------------------------------------------------------------------------------
# 4. Student Analytics
# ------------------------------------------------------------------------------
@router.get(
    "/analytics",
    response_model=StudentAnalyticsResponse,
    summary="Get aggregated department analytics"
)
async def get_analytics(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_analytics(current_user)

# ------------------------------------------------------------------------------
# 5. Learning Content Management
# ------------------------------------------------------------------------------
@router.get(
    "/content",
    response_model=List[FacultyContentResponse],
    summary="Get learning content created or visible to faculty"
)
async def get_content(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_content(current_user)

@router.post(
    "/content",
    response_model=FacultyContentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new learning resource"
)
async def create_content(
    payload: FacultyContentCreate,
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.create_content(current_user, payload.dict())

@router.put(
    "/content/{content_id}",
    response_model=FacultyContentResponse,
    summary="Update a learning resource authored by the faculty"
)
async def update_content(
    content_id: str,
    payload: FacultyContentUpdate,
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.update_content(current_user, content_id, payload.dict(exclude_unset=True))

@router.delete(
    "/content/{content_id}",
    summary="Delete a learning resource authored by the faculty"
)
async def delete_content(
    content_id: str,
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.delete_content(current_user, content_id)

# ------------------------------------------------------------------------------
# 6. Opportunities Discovery & Recommendation
# ------------------------------------------------------------------------------
@router.get(
    "/opportunities",
    summary="Discover industry openings and view recommendation status"
)
async def get_opportunities(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_opportunities(current_user)

@router.post(
    "/opportunities/{opportunity_id}/recommend",
    response_model=OpportunityRecommendationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Share/recommend an opportunity to authorized department students"
)
async def recommend_opportunity(
    opportunity_id: str,
    payload: OpportunityRecommendationCreate = Body(...),
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.recommend_opportunity(current_user, opportunity_id, payload.message)

# ------------------------------------------------------------------------------
# 7. Industry Collaboration Initiatives
# ------------------------------------------------------------------------------
@router.get(
    "/collaboration",
    response_model=List[CollaborationInitiativeResponse],
    summary="List industry collaboration opportunities (workshops, FDPs, joint research)"
)
async def get_collaborations(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_collaborations(current_user)

@router.post(
    "/collaboration/{initiative_id}/participate",
    response_model=CollaborationParticipationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Express interest / RSVP for a collaboration initiative"
)
async def participate_collaboration(
    initiative_id: str,
    payload: CollaborationParticipationCreate = Body(...),
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.participate_collaboration(current_user, initiative_id, payload.interest_note)

# ------------------------------------------------------------------------------
# 8. Notifications
# ------------------------------------------------------------------------------
@router.get(
    "/notifications",
    response_model=List[NotificationResponse],
    summary="Get faculty notifications"
)
async def get_notifications(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.get_notifications(current_user)

@router.put(
    "/notifications/{notification_id}/read",
    summary="Mark a notification as read"
)
async def mark_notification_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.mark_notification_read(current_user, notification_id)

@router.put(
    "/notifications/read-all",
    summary="Mark all notifications as read"
)
async def mark_all_notifications_read(
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.ACADEMICIAN, UserRole.SUPER_ADMIN]))
):
    return academician_service.mark_all_notifications_read(current_user)
