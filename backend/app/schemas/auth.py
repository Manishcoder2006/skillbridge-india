from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.enums import UserRole

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = Field(..., description="Role must be student, academician, or industry_hr")
    institution_id: Optional[str] = None
    department_id: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_public_registration_role(cls, v: UserRole) -> UserRole:
        # Security Rule 1 & 3: Super Admin and Institution Admin self-registration is strictly disallowed!
        if v in [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN]:
            raise ValueError(
                f"Self-registration for role '{v.value}' is strictly forbidden. Super Admin and Institution Admin accounts must be created through authorized administrator workflows."
            )
        return v

    @field_validator("institution_id")
    @classmethod
    def validate_institution_presence(cls, v: Optional[str], info) -> Optional[str]:
        role = info.data.get("role")
        if role in [UserRole.STUDENT, UserRole.ACADEMICIAN] and not v:
            raise ValueError(f"Institution ID is required for {role.value} registration.")
        if role == UserRole.INDUSTRY_HR and v:
            # Security Rule 7: Industry tenancy decoupled from institutions
            return None
        return v

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    message: str = "Authentication successful"

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    new_password: str = Field(..., min_length=6)
