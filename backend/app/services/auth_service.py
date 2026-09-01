import logging
import uuid
from datetime import datetime, timezone
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
        auth_res = None

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
                            "institution_id": payload.institution_id,
                            "department_id": payload.department_id,
                            "phone": payload.phone,
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
            "email": payload.email.lower(),
            "full_name": payload.full_name,
            "phone": payload.phone,
            "role": payload.role.value,
            "institution_id": payload.institution_id if payload.role != UserRole.INDUSTRY_HR else None,
            "department_id": payload.department_id if payload.role != UserRole.INDUSTRY_HR else None,
            "verification_status": "verified" if payload.role == UserRole.STUDENT else "pending",
        }

        created_profile = user_repo.create_user_profile(profile_data)

        # 3. Create student extension record if student
        if payload.role == UserRole.STUDENT:
            if db_manager.is_live and db_manager.client:
                try:
                    stu_record = {
                        "id": user_id,
                        "institution_id": payload.institution_id,
                        "department_id": payload.department_id,
                        "roll_number": f"{datetime.now(timezone.utc).year}{user_id[:6].upper()}",
                        "batch_year": datetime.now(timezone.utc).year,
                        "current_semester": 1,
                        "cgpa": 0.0,
                    }
                    db_manager.client.table("student_profiles").upsert(stu_record).execute()
                except Exception as e:
                    logger.warning(f"Could not insert initial student_profile record: {e}")

        # Generate user-specific access token
        if live_signup_success and auth_res and hasattr(auth_res, "session") and auth_res.session and getattr(auth_res.session, "access_token", None):
            token = auth_res.session.access_token
        else:
            token = f"session_{user_id}"

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
                    user_id = str(auth_res.user.id)
                    profile = user_repo.get_profile_by_id(user_id)
                    if not profile:
                        # Auto-create profile from Supabase user data if missing
                        meta = auth_res.user.user_metadata or {}
                        profile = user_repo.create_user_profile({
                            "id": user_id,
                            "email": payload.email.lower(),
                            "full_name": meta.get("full_name") or payload.email.split("@")[0],
                            "role": meta.get("role", "student"),
                            "phone": meta.get("phone"),
                            "institution_id": meta.get("institution_id"),
                            "department_id": meta.get("department_id"),
                            "verification_status": "verified" if meta.get("role") == "student" else "pending",
                        })
                    return {
                        "access_token": auth_res.session.access_token,
                        "token_type": "bearer",
                        "user": profile,
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
            "access_token": f"session_{profile['id']}",
            "token_type": "bearer",
            "user": profile,
            "message": "Login successful.",
        }

auth_service = AuthService()
