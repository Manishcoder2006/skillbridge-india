from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserProfileResponse, SafeProfileUpdateRequest
from app.repositories.user_repository import user_repo
from app.core.security import (
    get_current_user,
    require_roles,
    AuthenticatedUser,
)
from app.models.enums import UserRole

router = APIRouter()

@router.get("/profile", response_model=UserProfileResponse, tags=["Users"])
async def get_my_profile(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Returns the current authenticated user's private profile.
    """
    return current_user.to_dict()

@router.put("/profile", response_model=UserProfileResponse, tags=["Users"])
async def update_my_profile(
    payload: SafeProfileUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Security Rule 2: Safe profile update.
    Allows modifying personal info (full_name, phone, avatar_url).
    Role, institution_id, department_id, and verification_status are completely blocked.
    """
    updated = user_repo.update_profile_safe(current_user.id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for update.",
        )
    return updated

@router.get("/institution-members", response_model=List[Dict[str, Any]], tags=["Users"])
async def get_institution_members(
    current_user: AuthenticatedUser = Depends(
        require_roles([UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN])
    )
):
    """
    Institution Isolation: Returns member list strictly for the logged-in admin's institution.
    """
    if not current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No institution associated with this administrator account.",
        )
    return user_repo.get_institution_members(current_user.institution_id)
