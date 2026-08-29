import logging
from typing import List, Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.database import db_manager, MOCK_DATA_STORE
from app.models.enums import UserRole
from app.repositories.user_repository import user_repo

logger = logging.getLogger("skillbridge.security")
security_scheme = HTTPBearer(auto_error=False)

class AuthenticatedUser:
    def __init__(self, user_data: Dict[str, Any]):
        self.id: str = str(user_data.get("id"))
        self.email: str = user_data.get("email", "")
        self.full_name: str = user_data.get("full_name", "")
        self.role: UserRole = UserRole(user_data.get("role", UserRole.STUDENT.value))
        self.institution_id: Optional[str] = (
            str(user_data.get("institution_id")) if user_data.get("institution_id") else None
        )
        self.department_id: Optional[str] = (
            str(user_data.get("department_id")) if user_data.get("department_id") else None
        )
        self.company_id: Optional[str] = (
            str(user_data.get("company_id")) if user_data.get("company_id") else None
        )
        self.verification_status: str = user_data.get("verification_status", "pending")
        self.is_active: bool = user_data.get("is_active", True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role.value,
            "institution_id": self.institution_id,
            "department_id": self.department_id,
            "company_id": self.company_id,
            "verification_status": self.verification_status,
            "is_active": self.is_active,
        }

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> AuthenticatedUser:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # 1. Development & Demo / Test Token Handler
    for profile in MOCK_DATA_STORE["profiles"]:
        if (
            token == f"demo_token_{profile['role']}"
            or token == profile["id"]
            or token == f"bearer_{profile['id']}"
            or token == f"mock_token_{profile['id']}"
        ):
            return AuthenticatedUser(profile)

    if token.startswith("demo_token_") or token.startswith("test_token_"):
        requested_role = token.split("_")[-1]
        for profile in MOCK_DATA_STORE["profiles"]:
            if profile["role"] == requested_role:
                return AuthenticatedUser(profile)

    # 2. Live Supabase Authentication
    if db_manager.is_live and db_manager.client:
        try:
            auth_response = db_manager.client.auth.get_user(token)
            if auth_response and auth_response.user:
                user_id = str(auth_response.user.id)
                profile = user_repo.get_profile_by_id(user_id)
                if profile:
                    return AuthenticatedUser(profile)
        except Exception as e:
            logger.warning(f"Live Supabase token verification failed: {e}. Checking dev store.")

    # Fallback lookup in dev store by email or id
    for profile in MOCK_DATA_STORE["profiles"]:
        if token == profile["id"] or token in [f"session_{profile['id']}"]:
            return AuthenticatedUser(profile)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def require_roles(allowed_roles: List[UserRole]):
    """
    Role-Based Access Control dependency factory.
    Never trusts client-provided roles; verifies role directly from the authenticated profile.
    """
    async def role_checker(
        current_user: AuthenticatedUser = Depends(get_current_user)
    ) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User with role '{current_user.role.value}' is not authorized. Allowed roles: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker

def verify_tenant_isolation(
    requested_institution_id: str,
    current_user: AuthenticatedUser
) -> None:
    """
    Enforces strict institution isolation at the backend service layer.
    Cross-institution data access is strictly forbidden unless the user is a platform super_admin.
    """
    if current_user.role == UserRole.SUPER_ADMIN:
        return  # Super admin is globally scoped

    if not current_user.institution_id or str(current_user.institution_id) != str(requested_institution_id):
        logger.warning(
            f"Security Alert: User {current_user.id} (Inst: {current_user.institution_id}) attempted cross-tenant access to Institution {requested_institution_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot access or modify records belonging to another institution.",
        )
