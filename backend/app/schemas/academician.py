from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr

# ------------------------------------------------------------------------------
# 1. Profile Schemas
# ------------------------------------------------------------------------------
class AcademicianFullProfileResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    institution_id: Optional[str] = None
    department_id: Optional[str] = None
    institution_name: Optional[str] = None
    department_name: Optional[str] = None
    designation: Optional[str] = "Professor & Head of Department"
    employee_id: Optional[str] = "IITD-FAC-409"
    specialization: Optional[str] = "Distributed Systems & Cloud Architecture"
    qualifications: Optional[str] = "Ph.D. in Computer Science (IIT Delhi), M.Tech (IISc Bangalore)"
    experience_years: Optional[int] = 14
    research_interests: List[str] = ["Multi-Tenant Cloud Security", "Distributed Systems", "Verifiable AI Workflows"]
    verification_status: str

class AcademicianProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    research_interests: Optional[List[str]] = None

# ------------------------------------------------------------------------------
# 2. Authorized Student Roster & Detail Schemas
# ------------------------------------------------------------------------------
class AuthorizedStudentSummary(BaseModel):
    id: str
    full_name: str
    email: str
    program: str
    current_semester: int
    cgpa: float
    verified_skills_count: int
    top_skills: List[str] = []
    assessment_status: str  # 'completed', 'pending', 'needs_attention'
    last_assessment_score: Optional[float] = None
    identified_gaps: List[str] = []
    applications_count: int
    profile_strength: int
    needs_attention: bool

class AuthorizedStudentDetailResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    program: str
    current_semester: int
    cgpa: float
    institution_name: str
    department_name: str
    location: str
    skills: List[Dict[str, Any]] = []
    assessment_history: List[Dict[str, Any]] = []
    learning_progress: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    achievements: List[Dict[str, Any]] = []
    applications: List[Dict[str, Any]] = []

# ------------------------------------------------------------------------------
# 3. Analytics Schemas
# ------------------------------------------------------------------------------
class SkillDistributionItem(BaseModel):
    skill_name: str
    student_count: int
    percentage: float

class SkillGapFrequencyItem(BaseModel):
    skill_name: str
    student_count: int
    percentage: float

class StudentAnalyticsResponse(BaseModel):
    total_authorized_students: int
    average_department_cgpa: float
    assessment_completion_rate: float
    learning_resource_engagement_rate: float
    opportunity_participation_rate: float
    students_needing_attention_count: int
    top_verified_skills: List[SkillDistributionItem]
    top_skill_gaps: List[SkillGapFrequencyItem]
    semester_wise_distribution: Dict[str, int]
    placement_readiness_breakdown: Dict[str, int]  # 'ready_70_plus', 'developing_40_69', 'early_under_40'

# ------------------------------------------------------------------------------
# 4. Learning Content Management Schemas
# ------------------------------------------------------------------------------
class FacultyContentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    category: str = Field("Backend Engineering", max_length=100)
    skill_tag: str = Field("FastAPI", max_length=100)
    resource_type: str = Field("tutorial", description="course, tutorial, video, pdf, workshop")
    url: str = Field(..., min_length=5)
    description: Optional[str] = None
    visibility: str = Field("department", description="department, institution, public")
    is_published: bool = True

class FacultyContentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    skill_tag: Optional[str] = None
    resource_type: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    is_published: Optional[bool] = None

class FacultyContentResponse(BaseModel):
    id: str
    academician_id: str
    academician_name: str
    institution_id: str
    department_id: str
    title: str
    category: str
    skill_tag: str
    resource_type: str
    url: str
    description: Optional[str] = None
    visibility: str
    is_published: bool
    created_at: str

# ------------------------------------------------------------------------------
# 5. Opportunity Discovery & Recommendation Schemas
# ------------------------------------------------------------------------------
class OpportunityRecommendationCreate(BaseModel):
    opportunity_id: str
    message: Optional[str] = "Recommended for department students by Faculty."

class OpportunityRecommendationResponse(BaseModel):
    id: str
    opportunity_id: str
    opportunity_title: str
    company_name: str
    academician_name: str
    department_id: str
    message: str
    created_at: str

# ------------------------------------------------------------------------------
# 6. Collaboration Schemas
# ------------------------------------------------------------------------------
class CollaborationInitiativeResponse(BaseModel):
    id: str
    title: str
    category: str
    company_name: str
    description: str
    mode: str
    duration: str
    deadline: str
    status: str
    is_participating: bool = False
    my_status: Optional[str] = None

class CollaborationParticipationCreate(BaseModel):
    interest_note: Optional[str] = "Faculty interest in joint R&D and mentorship collaboration."

class CollaborationParticipationResponse(BaseModel):
    id: str
    initiative_id: str
    initiative_title: str
    company_name: str
    interest_note: str
    status: str
    created_at: str

# ------------------------------------------------------------------------------
# 7. Notifications Schemas
# ------------------------------------------------------------------------------
class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    title: str
    message: str
    type: str
    is_read: bool
    link_url: Optional[str] = None
    created_at: str

# ------------------------------------------------------------------------------
# 8. Dashboard Overview Summary
# ------------------------------------------------------------------------------
class AcademicianDashboardSummaryResponse(BaseModel):
    total_authorized_students: int
    students_needing_attention_count: int
    assessment_completion_rate: float
    active_learning_resources_count: int
    active_recommendations_count: int
    open_collaborations_count: int
    unread_notifications_count: int
    students_needing_attention: List[AuthorizedStudentSummary]
    recent_student_activities: List[Dict[str, Any]]
    recent_notifications: List[NotificationResponse]
