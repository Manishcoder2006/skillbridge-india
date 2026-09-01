from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, EmailStr

# ------------------------------------------------------------------------------
# 1. Profile Schemas
# ------------------------------------------------------------------------------
class EducationItem(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = ""
    start_year: Optional[Union[int, str]] = None
    end_year: Optional[Union[int, str]] = None
    grade_or_cgpa: Optional[str] = None

class ExperienceItem(BaseModel):
    company: str
    job_title: str
    employment_type: Optional[str] = "Internship"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class ProjectItem(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    github_or_demo_url: Optional[str] = None

class CertificationItem(BaseModel):
    name: str
    issuer: str
    issue_year: Optional[Union[int, str]] = None
    credential_url: Optional[str] = None

class AchievementItem(BaseModel):
    title: str
    organization: Optional[str] = None
    year: Optional[Union[int, str]] = None
    description: Optional[str] = None

class StudentFullProfileResponse(BaseModel):
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
    program: Optional[str] = None
    current_semester: Optional[int] = None
    year_of_study: Optional[str] = None
    enrollment_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    section_batch: Optional[str] = None
    expected_graduation: Optional[str] = None
    cgpa: Optional[float] = None
    location: Optional[str] = None
    career_interests: List[str] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    achievements: List[AchievementItem] = []
    verification_status: str

class StudentProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    program: Optional[str] = None
    current_semester: Optional[int] = None
    year_of_study: Optional[str] = None
    enrollment_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    section_batch: Optional[str] = None
    expected_graduation: Optional[str] = None
    cgpa: Optional[float] = None
    career_interests: Optional[List[str]] = None
    education: Optional[List[EducationItem]] = None
    projects: Optional[List[ProjectItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    achievements: Optional[List[AchievementItem]] = None

# ------------------------------------------------------------------------------
# 2. Skills Schemas
# ------------------------------------------------------------------------------
class StudentSkillCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    category: str = Field("technical", description="technical or soft")
    proficiency_level: str = Field("intermediate", description="beginner, intermediate, advanced, expert")

class StudentSkillResponse(BaseModel):
    id: str
    skill_name: str
    category: str
    proficiency_level: str
    is_verified: bool
    created_at: str

# ------------------------------------------------------------------------------
# 3. Assessment Schemas
# ------------------------------------------------------------------------------
class AssessmentQuestionResponse(BaseModel):
    id: str
    question_text: str
    options: List[str]
    skill_tag: str

class AssessmentListResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    duration_minutes: int
    total_questions: int
    passing_percentage: int
    difficulty: str

class AssessmentDetailResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    duration_minutes: int
    total_questions: int
    passing_percentage: int
    difficulty: str
    questions: List[AssessmentQuestionResponse] = []

class AssessmentSubmitRequest(BaseModel):
    answers: Dict[str, int] = Field(..., description="Mapping of question_id to selected_option_index")

class AssessmentResultResponse(BaseModel):
    id: str
    assessment_id: str
    assessment_title: str
    score: int
    total_marks: int
    percentage: float
    passed: bool
    status: str
    strengths: List[str] = []
    skill_gaps: List[str] = []
    completed_at: str

# ------------------------------------------------------------------------------
# 4. Learning Resources Schemas
# ------------------------------------------------------------------------------
class LearningResourceResponse(BaseModel):
    id: str
    title: str
    category: str
    skill_tag: str
    resource_type: str
    provider: str
    duration: str
    url: str
    level: str
    is_free: bool
    rating: float
    progress_status: Optional[str] = "not_started"  # 'not_started', 'in_progress', 'completed'

class LearningProgressUpdateRequest(BaseModel):
    resource_id: str
    status: str = Field(..., description="in_progress or completed")
    progress_percent: int = Field(100, ge=0, le=100)

# ------------------------------------------------------------------------------
# 5. Opportunity & Application Schemas
# ------------------------------------------------------------------------------
class OpportunityResponse(BaseModel):
    id: str
    company_name: str
    title: str
    type: str
    location: str
    work_mode: str
    stipend_or_salary: str
    required_skills: List[str] = []
    eligibility: str
    description: str
    application_deadline: str
    is_applied: bool = False

class ApplicationSubmitRequest(BaseModel):
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    opportunity_id: str
    company_name: str
    title: str
    type: str
    location: str
    status: str
    notes: Optional[str] = None
    applied_at: str
    updated_at: str

# ------------------------------------------------------------------------------
# 6. Resume Schemas
# ------------------------------------------------------------------------------
class ResumeDataSchema(BaseModel):
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    headline: Optional[str] = ""
    summary: Optional[str] = ""
    target_role: Optional[str] = "Full Stack Developer"
    avatar_url: Optional[str] = ""
    education: List[Dict[str, Any]] = []
    skills: List[str] = []
    skills_by_category: Dict[str, List[str]] = {}
    projects: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    achievements: List[Dict[str, Any]] = []
    positions_of_responsibility: List[Dict[str, Any]] = []
    extracurricular_activities: List[Dict[str, Any]] = []
    coursework: List[str] = []
    links: Dict[str, str] = {}
    formatting: Dict[str, Any] = {}

class ResumeResponse(BaseModel):
    id: str
    student_id: str
    data: ResumeDataSchema
    updated_at: str

# ------------------------------------------------------------------------------
# 7. Dashboard Overview Summary
# ------------------------------------------------------------------------------
class TargetCareerPath(BaseModel):
    role_name: str
    match_percentage: int
    required_skills: List[str]
    acquired_skills: List[str]
    missing_skills: List[str]

class StudentDashboardSummaryResponse(BaseModel):
    profile_completion_percent: int
    total_skills_count: int
    assessments_completed: int
    applications_count: int
    resume_status: str
    top_strengths: List[str]
    identified_gaps: List[str]
    career_paths: List[TargetCareerPath]
    recommended_opportunities: List[OpportunityResponse]
    recommended_learning: List[LearningResourceResponse]
    recent_applications: List[ApplicationResponse]
