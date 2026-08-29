import logging
import uuid
from typing import Dict, Any
from fastapi import HTTPException, status
from app.core.database import db_manager, MOCK_DATA_STORE
from app.repositories.user_repository import user_repo
from app.models.enums import UserRole
from app.schemas.auth import UserRegisterRequest, UserLoginRequest

logger = logging.getLogger("skillbridge.services.auth")

class AuthService:
    def register_user(self, payload: UserRegisterRequest) -> Dict[str, Any]:
        """
        Public self-registration handler.
        Super Admin and Institution Admin are strictly rejected.
        """
        if payload.role in [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Direct registration as Administrator is not permitted.",
            )

        existing = user_repo.get_profile_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

        user_id = str(uuid.uuid4())
        live_signup_success = False

        # 1. Supabase live registration attempt if live client configured
        if db_manager.is_live and db_manager.client:
            try:
                auth_res = db_manager.client.auth.sign_up({
                    "email": payload.email,
                    "password": payload.password,
                    "options": {
                        "data": {
                            "full_name": payload.full_name,
                            "role": payload.role.value,
                        }
                    }
                })
                if auth_res and auth_res.user:
                    user_id = str(auth_res.user.id)
                    live_signup_success = True
            except Exception as e:
                logger.warning(f"Live Supabase sign_up exception: {e}. Registering in local store.")

        # 2. Persist Profile
        profile_data = {
            "id": user_id,
            "email": payload.email,
            "full_name": payload.full_name,
            "phone": payload.phone,
            "role": payload.role.value,
            "institution_id": payload.institution_id if payload.role != UserRole.INDUSTRY_HR else None,
            "department_id": payload.department_id if payload.role != UserRole.INDUSTRY_HR else None,
            "verification_status": "verified" if payload.role == UserRole.STUDENT else "pending",
        }

        created_profile = user_repo.create_user_profile(profile_data)

        # Generate access token
        token = f"session_{user_id}" if live_signup_success else f"demo_token_{payload.role.value}"

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": created_profile,
            "message": "Registration completed successfully.",
        }

    def login_user(self, payload: UserLoginRequest) -> Dict[str, Any]:
        if db_manager.is_live and db_manager.client:
            try:
                auth_res = db_manager.client.auth.sign_in_with_password({
                    "email": payload.email,
                    "password": payload.password,
                })
                if auth_res and auth_res.session:
                    profile = user_repo.get_profile_by_id(str(auth_res.user.id))
                    return {
                        "access_token": auth_res.session.access_token,
                        "token_type": "bearer",
                        "user": profile or {"id": auth_res.user.id, "email": auth_res.user.email},
                        "message": "Login successful (Supabase Auth).",
                    }
            except Exception as e:
                logger.warning(f"Live Supabase login failed: {e}. Falling back to dev check.")

        # Dev mode mock login lookup
        profile = user_repo.get_profile_by_email(payload.email)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password credentials.",
            )

        return {
            "access_token": f"demo_token_{profile['role']}",
            "token_type": "bearer",
            "user": profile,
            "message": "Login successful.",
        }

auth_service = AuthService()
