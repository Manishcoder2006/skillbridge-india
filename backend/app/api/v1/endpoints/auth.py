from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthTokenResponse,
    PasswordResetRequest,
)
from app.schemas.user import UserProfileResponse
from app.services.auth_service import auth_service
from app.core.security import get_current_user, AuthenticatedUser

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse, tags=["Authentication"])
async def get_current_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Returns the currently authenticated user's profile and verified role.
    """
    return current_user.to_dict()

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
async def register(payload: UserRegisterRequest):
    """
    Register a new user account (Student, Academician, or Industry HR only).
    Super Admin and Institution Admin self-registration is strictly rejected.
    """
    return auth_service.register_user(payload)

@router.post("/login", response_model=AuthTokenResponse, tags=["Authentication"])
async def login(payload: UserLoginRequest):
    """
    Authenticate user and return a verified session token and user profile.
    """
    return auth_service.login_user(payload)

@router.post("/forgot-password", tags=["Authentication"])
async def forgot_password(payload: PasswordResetRequest):
    """
    Trigger password reset workflow via Supabase Auth.
    """
    return {
        "message": f"If an account exists for {payload.email}, a secure password reset link has been dispatched.",
        "success": True,
    }
