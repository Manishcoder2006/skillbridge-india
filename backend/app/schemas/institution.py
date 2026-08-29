from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.models.enums import InstitutionType, VerificationStatus

class PublicDepartmentResponse(BaseModel):
    id: str
    name: str
    code: str

class PublicInstitutionResponse(BaseModel):
    """
    Security Rule 8: Public institution endpoint exposes only safe metadata
    required for user registration. Private details are excluded.
    """
    id: str
    name: str
    code: str
    type: InstitutionType
    city: Optional[str] = None
    state: Optional[str] = None
    departments: List[PublicDepartmentResponse] = []

class InstitutionDetailResponse(BaseModel):
    id: str
    name: str
    code: str
    type: InstitutionType
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    verification_status: VerificationStatus
    is_active: bool

class DepartmentCreateRequest(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
