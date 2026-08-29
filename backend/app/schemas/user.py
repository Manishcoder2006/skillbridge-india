from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole, VerificationStatus

class UserProfileResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    institution_id: Optional[str] = None
    department_id: Optional[str] = None
    company_id: Optional[str] = None
    verification_status: VerificationStatus
    is_active: bool

class SafeProfileUpdateRequest(BaseModel):
    """
    Security Rule 2: Normal users cannot modify role, institution_id,
    department_id, or verification_status through profile updates.
    """
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    avatar_url: Optional[str] = None
