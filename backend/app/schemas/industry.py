from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# -----------------------------------------------------------------------------
# Company Profile Schemas
# -----------------------------------------------------------------------------
class CompanyProfileBase(BaseModel):
    name: str
    industry_type: str
    website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    company_size: Optional[str] = "1000-5000"
    founded_year: Optional[int] = 2000
    company_type: Optional[str] = "enterprise"
    headquarters_city: Optional[str] = "Mumbai"
    headquarters_state: Optional[str] = "Maharashtra"
    contact_email: str
    contact_phone: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)
    social_links: Dict[str, str] = Field(default_factory=dict)

class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = None
    industry_type: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[int] = None
    headquarters_city: Optional[str] = None
    headquarters_state: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    social_links: Optional[Dict[str, str]] = None

class CompanyProfileResponse(CompanyProfileBase):
    id: str
    code: str
    verification_status: str
    is_active: bool
    created_at: str
    updated_at: str
    hr_representative: Optional[Dict[str, Any]] = None

# -----------------------------------------------------------------------------
# Job & Internship Posting Schemas
# -----------------------------------------------------------------------------
class OpportunityCreate(BaseModel):
    title: str
    type: str = "job"  # "job" | "internship"
    description: str
    required_skills: List[str]
    preferred_skills: List[str] = Field(default_factory=list)
    eligibility: Optional[str] = "Open to all relevant engineering disciplines with CGPA >= 6.5"
    location: str = "Bengaluru / Hybrid"
    work_mode: str = "hybrid"  # "on_site" | "remote" | "hybrid"
    stipend_or_salary: str = "₹8.0 - 12.0 LPA"
    openings_count: int = 5
    application_deadline: str
    status: str = "active"  # "active" | "draft" | "closed"
    duration: Optional[str] = None  # for internships e.g. "6 months"
    start_date: Optional[str] = None
    responsibilities: List[str] = Field(default_factory=list)
    learning_outcomes: List[str] = Field(default_factory=list)
    benefits: List[str] = Field(default_factory=list)

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    eligibility: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    stipend_or_salary: Optional[str] = None
    openings_count: Optional[int] = None
    application_deadline: Optional[str] = None
    status: Optional[str] = None
    duration: Optional[str] = None
    start_date: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    learning_outcomes: Optional[List[str]] = None
    benefits: Optional[List[str]] = None

class OpportunityResponse(OpportunityCreate):
    id: str
    company_id: Optional[str] = "c1000000-0000-0000-0000-000000000001"
    company_name: Optional[str] = "Tata Consultancy Services"
    applications_count: int = 0
    created_at: Optional[str] = "2026-08-25T10:00:00Z"
    is_active: bool = True

# -----------------------------------------------------------------------------
# Application & Candidate Schemas
# -----------------------------------------------------------------------------
class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="applied, under_review, shortlisted, interview, selected, rejected")
    review_notes: Optional[str] = None
    interview_scheduled_at: Optional[str] = None
    interview_link: Optional[str] = None

class CandidateSearchFilters(BaseModel):
    search: Optional[str] = None
    skills: Optional[List[str]] = None
    institution: Optional[str] = None
    min_cgpa: Optional[float] = None
    semester: Optional[int] = None

class RecruiterCandidateView(BaseModel):
    student_id: str
    full_name: str
    email: str
    institution_name: str
    department_name: str
    program: str
    current_semester: int
    cgpa: float
    verified_skills: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]
    resume_summary: Optional[Dict[str, Any]] = None
    applied_roles: List[Dict[str, Any]] = Field(default_factory=list)

class CandidateApplicationItem(BaseModel):
    application_id: str
    student_id: str
    candidate_name: str
    candidate_email: str
    candidate_cgpa: float
    candidate_institution: str
    candidate_department: str
    candidate_semester: int
    opportunity_id: str
    opportunity_title: str
    opportunity_type: str
    status: str
    notes: Optional[str] = None
    applied_at: str
    verified_skills: List[str]
    skill_match_percent: int = 0

# -----------------------------------------------------------------------------
# AI Candidate Matching Foundation Schema (Phase 4 Foundation)
# -----------------------------------------------------------------------------
class CandidateMatchItem(BaseModel):
    student_id: str
    candidate_name: str
    candidate_email: str
    institution: str
    department: str
    cgpa: float
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    compatibility_tier: str  # "High Match" | "Moderate Match" | "Low Match"
    recommended_action: str

class AIMatchingResponse(BaseModel):
    opportunity_id: str
    opportunity_title: str
    required_skills: List[str]
    total_evaluated_candidates: int
    matched_candidates: List[CandidateMatchItem]
    ai_engine_status: str = "Phase 4 Rule-Based Foundation (Ready for Phase 5 Multi-Model LLM Engine)"

# -----------------------------------------------------------------------------
# Collaboration & Analytics Schemas
# -----------------------------------------------------------------------------
class IndustryCollaborationProposalCreate(BaseModel):
    title: str
    initiative_type: str = "workshop"  # "workshop" | "fdp" | "joint_research" | "mentorship" | "hackathon"
    target_domain: str
    description: str
    target_audience: str = "all_students_faculty"
    slots_available: int = 50
    timeline: str
    contact_email: str

class IndustryAnalyticsResponse(BaseModel):
    company_name: str
    total_job_postings: int
    total_internship_postings: int
    total_applications_received: int
    status_breakdown: Dict[str, int]
    top_in_demand_skills: List[Dict[str, Any]]
    recruitment_funnel: Dict[str, int]
    posting_performance: List[Dict[str, Any]]

class IndustryDashboardSummary(BaseModel):
    company: Dict[str, Any]
    active_jobs: int
    active_internships: int
    total_applications: int
    awaiting_review: int
    shortlisted_candidates: int
    interviews_scheduled: int
    selected_candidates: int
    recent_applications: List[CandidateApplicationItem]
    recent_postings: List[OpportunityResponse]
    recruitment_activity: List[Dict[str, Any]]
