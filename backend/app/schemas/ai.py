from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# Common AI Response Metadata
# -----------------------------------------------------------------------------
class AIMeta(BaseModel):
    model_used: str = "gemini-1.5-flash"
    routing_strategy: str = "auto"
    latency_ms: int = 0
    synthesized_models: Optional[List[str]] = None
    confidence_score: float = 0.95
    is_simulated_fallback: bool = False

# -----------------------------------------------------------------------------
# 1. Student AI Schemas
# -----------------------------------------------------------------------------
class SkillGapAnalysisRequest(BaseModel):
    target_role: Optional[str] = "Full Stack Engineer"
    custom_skills: Optional[List[str]] = None

class SkillGapItem(BaseModel):
    skill_name: str
    current_level: str
    target_level: str
    gap_severity: str  # "Critical", "Moderate", "Minor"
    remediation_hint: str

class SkillGapAnalysisResponse(BaseModel):
    target_role: str
    readiness_percentage: int
    strengths: List[str]
    identified_gaps: List[SkillGapItem]
    action_plan_steps: List[str]
    ai_meta: AIMeta

class CareerRecommendationsRequest(BaseModel):
    interests: Optional[List[str]] = None

class CareerPathItem(BaseModel):
    role_title: str
    match_percentage: int
    growth_outlook: str
    average_starting_salary: str
    key_required_skills: List[str]
    why_recommended: str

class CareerRecommendationsResponse(BaseModel):
    primary_recommendations: List[CareerPathItem]
    alternative_domains: List[str]
    industry_sector_trends: str
    ai_meta: AIMeta

class LearningRecommendationsRequest(BaseModel):
    focus_skills: Optional[List[str]] = None

class RecommendedCourseItem(BaseModel):
    title: str
    provider: str
    url: str
    skill_tag: str
    level: str
    duration: str
    is_platform_resource: bool = True
    match_reason: str

class LearningRecommendationsResponse(BaseModel):
    learning_path_title: str
    recommended_courses: List[RecommendedCourseItem]
    estimated_completion_weeks: int
    ai_meta: AIMeta

class ResumeSuggestionsRequest(BaseModel):
    target_job_title: Optional[str] = None
    target_job_description: Optional[str] = None
    custom_summary: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None

class ResumeSuggestionsResponse(BaseModel):
    overall_ats_score: int
    keyword_match_score: int = 75
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    formatting_warnings: List[str] = []
    actionable_improvements: List[str] = []
    summary_critique: str
    enhanced_summary_draft: str
    bullet_point_improvements: List[Dict[str, str]]
    recommended_keywords_to_add: List[str]
    ai_meta: AIMeta

class ResumeBulletImproveRequest(BaseModel):
    bullet_text: str
    target_role: Optional[str] = None
    context_type: Optional[str] = "experience"  # "experience" | "project"

class ResumeBulletImproveResponse(BaseModel):
    original: str
    improved: str
    action_verb_used: str
    quantification_tip: str
    keywords_added: List[str] = []
    ai_meta: AIMeta

class ResumeSummaryGenerateRequest(BaseModel):
    target_role: Optional[str] = None
    skills: List[str] = []
    experience_highlights: List[str] = []
    education_highlights: List[str] = []
    tone: Optional[str] = "impactful"  # "impactful" | "executive" | "concise"

class ResumeSummaryGenerateResponse(BaseModel):
    summary: str
    keywords_included: List[str] = []
    estimated_word_count: int
    ai_meta: AIMeta

# -----------------------------------------------------------------------------
# 2. Industry / HR AI Schemas
# -----------------------------------------------------------------------------
class CandidateMatchRequest(BaseModel):
    opportunity_id: str
    model_mode: Optional[str] = "hybrid"  # "gemini" | "grok" | "hybrid"

class EvaluatedCandidateMatch(BaseModel):
    student_id: str
    candidate_name: str
    candidate_institution: str
    match_score: int
    compatibility_tier: str
    matching_skills: List[str]
    missing_critical_skills: List[str]
    key_strengths: List[str]
    potential_risk_factors: List[str]
    recruiter_summary_rationale: str
    suggested_next_step: str

class CandidateMatchResponse(BaseModel):
    opportunity_id: str
    opportunity_title: str
    required_skills: List[str]
    total_candidates_analyzed: int
    ranked_candidates: List[EvaluatedCandidateMatch]
    recruiter_disclaimer: str = "AI candidate scores are advisory recommendations. All hiring decisions remain strictly with the human recruiter."
    ai_meta: AIMeta

class CandidateAnalysisRequest(BaseModel):
    student_id: str
    opportunity_id: Optional[str] = None

class CandidateAnalysisResponse(BaseModel):
    student_id: str
    candidate_name: str
    deep_fit_assessment: str
    verified_strengths: List[str]
    skill_deficiencies: List[str]
    recommended_interview_questions: List[str]
    growth_potential_rating: str  # "High", "Exceptional", "Moderate"
    ai_meta: AIMeta

# -----------------------------------------------------------------------------
# 3. Academician / Faculty AI Schemas
# -----------------------------------------------------------------------------
class CohortInsightsRequest(BaseModel):
    department_id: Optional[str] = None

class CohortInsightsResponse(BaseModel):
    department_name: str
    total_students_evaluated: int
    mean_readiness_score: int
    strongest_cohort_competencies: List[str]
    critical_cohort_skill_gaps: List[Dict[str, Any]]
    pedagogical_interventions: List[str]
    ai_meta: AIMeta

class CurriculumTrendsRequest(BaseModel):
    focus_domain: Optional[str] = "Computer Science & Engineering"

class CurriculumTrendsResponse(BaseModel):
    focus_domain: str
    market_demand_analysis: str
    trending_industry_skills: List[str]
    recommended_syllabus_additions: List[str]
    suggested_industry_partnerships: List[str]
    ai_meta: AIMeta

# -----------------------------------------------------------------------------
# 4. Multi-Role AI Assistant Chat
# -----------------------------------------------------------------------------
class AIAssistantChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class AIAssistantChatResponse(BaseModel):
    reply: str
    role_context: str
    quick_suggestions: List[str] = Field(default_factory=list)
    relevant_links: List[Dict[str, str]] = Field(default_factory=list)
    ai_meta: AIMeta
