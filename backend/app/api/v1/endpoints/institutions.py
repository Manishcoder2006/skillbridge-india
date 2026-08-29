from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.institution import (
    PublicInstitutionResponse,
    PublicDepartmentResponse,
    InstitutionDetailResponse,
    DepartmentCreateRequest,
)
from app.services.institution_service import institution_service
from app.core.security import (
    get_current_user,
    require_roles,
    verify_tenant_isolation,
    AuthenticatedUser,
)
from app.models.enums import UserRole

router = APIRouter()

@router.get("/public", response_model=List[PublicInstitutionResponse], tags=["Institutions"])
async def list_public_institutions():
    """
    Security Rule 8: Returns only safe, public metadata of verified institutions
    and their active departments for onboarding/registration.
    """
    return institution_service.list_public_institutions()

@router.get("/{institution_id}/departments", response_model=List[PublicDepartmentResponse], tags=["Institutions"])
async def list_institution_departments(institution_id: str):
    """
    Returns public list of active departments for an institution.
    """
    return institution_service.get_public_departments(institution_id)

@router.get("/my-institution", response_model=InstitutionDetailResponse, tags=["Institutions"])
async def get_my_institution(
    current_user: AuthenticatedUser = Depends(
        require_roles([UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN])
    )
):
    """
    Protected endpoint: Returns full institution details scoped to the admin's institution.
    """
    if not current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No institution associated with this administrator account.",
        )
    return institution_service.get_institution_details(current_user.institution_id)

@router.post("/departments", response_model=PublicDepartmentResponse, status_code=status.HTTP_201_CREATED, tags=["Institutions"])
async def create_institution_department(
    payload: DepartmentCreateRequest,
    current_user: AuthenticatedUser = Depends(
        require_roles([UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN])
    )
):
    """
    Protected endpoint: Allows Institution Admin to add a new department
    strictly within their own institution (multi-tenant isolated).
    """
    if not current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add department without an associated institution.",
        )
    return institution_service.add_department(current_user.institution_id, payload)
