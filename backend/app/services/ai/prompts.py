from typing import Dict, Any, List, Optional

def sanitize_user_context(context: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitizes context dictionary by removing passwords, tokens, and private system attributes."""
    blocked_keys = {"password", "hashed_password", "token", "sb_secret_key", "secret", "refresh_token"}
    sanitized = {}
    for k, v in context.items():
        if k.lower() in blocked_keys:
            continue
        if isinstance(v, dict):
            sanitized[k] = sanitize_user_context(v)
        elif isinstance(v, list):
            sanitized[k] = [sanitize_user_context(i) if isinstance(i, dict) else i for i in v]
        else:
            sanitized[k] = v
    return sanitized


class PromptTemplates:
    """Standardized prompts for SkillBridge India AI Agents."""

    SYSTEM_BASE = (
        "You are the SkillBridge India AI Engine (SIH 2026 PS 26044). "
        "Your mission is to bridge academia and industry by mapping skills, guiding students, "
        "assisting faculty, and empowering corporate recruiters. "
        "Always respond in valid, parseable JSON strictly conforming to the requested schema. "
        "Do not include markdown code fence formatting or conversational preamble outside the JSON."
    )

    @staticmethod
    def student_skill_gap_prompt(student_name: str, skills: List[str], assessment_score: int, target_role: str) -> str:
        return f"""Analyze the student's profile for the target role '{target_role}'.
Student Name: {student_name}
Verified Skills: {', '.join(skills)}
Recent Diagnostic Assessment Score: {assessment_score}/100

Generate a JSON object with:
{{
  "target_role": "{target_role}",
  "readiness_percentage": <integer between 0 and 100>,
  "strengths": [<list of 3-5 confirmed strengths>],
  "identified_gaps": [
    {{
      "skill_name": "<skill>",
      "current_level": "beginner|intermediate|unverified",
      "target_level": "advanced|proficient",
      "gap_severity": "Critical|Moderate|Minor",
      "remediation_hint": "<practical advice to master this skill>"
    }}
  ],
  "action_plan_steps": [<3-4 actionable sequential steps to bridge the gap>]
}}"""

    @staticmethod
    def student_career_guidance_prompt(student_name: str, skills: List[str], cgpa: float, interests: List[str]) -> str:
        return f"""Provide career pathway recommendations for engineering student:
Name: {student_name}
Skills: {', '.join(skills)}
CGPA: {cgpa}
Interests: {', '.join(interests) if interests else 'Full Stack, Cloud, AI'}

Generate a JSON object with:
{{
  "primary_recommendations": [
    {{
      "role_title": "<Role title>",
      "match_percentage": <int 60-98>,
      "growth_outlook": "High Demand / 28% YoY Growth",
      "average_starting_salary": "₹8.0 - 14.0 LPA",
      "key_required_skills": [<3-4 skills>],
      "why_recommended": "<1 sentence reasoning>"
    }}
  ],
  "alternative_domains": [<2-3 adjacent domains>],
  "industry_sector_trends": "<Brief 1-2 sentence industry hiring outlook for India 2026>"
}}"""

    @staticmethod
    def resume_optimizer_prompt(
        name: str,
        current_summary: str,
        skills: List[str],
        target_role: str,
        job_description: Optional[str] = None,
        projects_summary: Optional[str] = "",
        experience_summary: Optional[str] = ""
    ) -> str:
        jd_context = f"\nTarget Job Description:\n{job_description}" if job_description else ""
        proj_context = f"\nKey Projects: {projects_summary}" if projects_summary else ""
        exp_context = f"\nExperience: {experience_summary}" if experience_summary else ""

        return f"""You are an expert AI Resume Reviewer and ATS Optimization Engine for SkillBridge India.
Analyze the candidate's resume against the target role and job description with strict ATS compliance rules (quantifiable impact, action verbs, keyword density, skills alignment).

Candidate: {name}
Target Role: {target_role}
Current Summary: {current_summary or 'None provided'}
Candidate Skills: {', '.join(skills) if skills else 'None listed'}{proj_context}{exp_context}{jd_context}

Generate a valid, parseable JSON object with the following schema:
{{
  "overall_ats_score": <realistic integer score 60-98 based on alignment>,
  "keyword_match_score": <integer percentage 50-98 representing keyword overlap>,
  "matched_keywords": [<list of 4-8 important technical/domain keywords present in both resume and JD>],
  "missing_keywords": [<list of 4-8 critical industry keywords present in JD or standard for role but absent in resume>],
  "matched_skills": [<list of candidate skills that align directly with role>],
  "missing_skills": [<list of 3-6 recommended high-demand skills to acquire or add>],
  "strengths": [<list of 2-4 specific strong points found in the resume>],
  "weaknesses": [<list of 2-4 areas where the resume falls short e.g. lack of metrics, missing tools>],
  "formatting_warnings": [<list of 1-3 ATS formatting/styling warnings e.g. avoid graphics, ensure standard section headers>],
  "actionable_improvements": [<list of 3-5 concrete step-by-step improvements to boost score>],
  "summary_critique": "<2-sentence constructive critique on impact, clarity, and keyword density>",
  "enhanced_summary_draft": "<high-impact ATS-optimized 2-3 sentence executive summary with active metrics and keywords tailored to role>",
  "bullet_point_improvements": [
    {{
      "original_example": "<a weak/generic bullet point from typical student resumes>",
      "improved_bullet": "<a powerful, quantified, impact-driven bullet point with metrics and tech stack>"
    }},
    {{
      "original_example": "<another generic project bullet point>",
      "improved_bullet": "<improved quantified bullet with action verb and result>"
    }}
  ],
  "recommended_keywords_to_add": [<list of top 6 recommended keywords for ATS search filters>]
}}"""

    @staticmethod
    def resume_bullet_improve_prompt(bullet_text: str, target_role: Optional[str] = None, context_type: str = "experience") -> str:
        role_ctx = f" for a candidate pursuing a {target_role} role" if target_role else ""
        return f"""You are an elite ATS resume coach{role_ctx}.
Rewrite the following resume bullet point to make it highly impactful, action-verb driven, quantified where possible, and ATS friendly.
DO NOT invent false company names or degrees. Preserve the candidate's core accomplishment and enhance the phrasing with industry best practices (Action Verb + Task/Tech + Quantified Result/Impact).

Input Bullet: "{bullet_text}"

Return a JSON object:
{{
  "original": "{bullet_text}",
  "improved": "<re-written impactful bullet point>",
  "action_verb_used": "<the primary strong action verb used>",
  "quantification_tip": "<a brief 1-sentence tip on what specific number or metric the student could customize here>",
  "keywords_added": [<list of 2-4 ATS technical or action keywords added>]
}}"""

    @staticmethod
    def resume_summary_generate_prompt(
        target_role: Optional[str],
        skills: List[str],
        experience_highlights: List[str],
        education_highlights: List[str],
        tone: str = "impactful"
    ) -> str:
        role = target_role or "Software & Systems Engineer"
        skills_str = ", ".join(skills) if skills else "Modern software engineering and problem-solving"
        exp_str = "; ".join(experience_highlights) if experience_highlights else "Academic and independent project experience"
        edu_str = "; ".join(education_highlights) if education_highlights else "Relevant technical coursework and foundational knowledge"

        return f"""You are an expert executive resume writer for SkillBridge India.
Write an authentic, highly professional 2-3 sentence resume executive summary tailored to the target role '{role}'.
Tone: {tone}.

Candidate Background:
- Key Skills: {skills_str}
- Projects & Experience Highlights: {exp_str}
- Education: {edu_str}

Ensure the summary highlights core strengths, demonstrated capabilities, and alignment with modern industry standards.

Return a JSON object:
{{
  "summary": "<2-3 sentence polished professional executive summary>",
  "keywords_included": [<list of 3-5 technical/role keywords seamlessly incorporated>],
  "estimated_word_count": <integer word count>
}}"""

    @staticmethod
    def candidate_matching_prompt(job_title: str, req_skills: List[str], candidates: List[Dict[str, Any]]) -> str:
        candidates_summary = "\n".join([
            f"- ID: {c.get('student_id')}, Name: {c.get('name')}, CGPA: {c.get('cgpa')}, Skills: {', '.join(c.get('skills', []))}"
            for c in candidates
        ])
        return f"""Evaluate and rank candidates for the position '{job_title}'.
Job Required Skills: {', '.join(req_skills)}

Candidate Pool:
{candidates_summary}

Generate a JSON object with:
{{
  "ranked_candidates": [
    {{
      "student_id": "<ID>",
      "candidate_name": "<Name>",
      "candidate_institution": "IIT Delhi",
      "match_score": <integer 0-100>,
      "compatibility_tier": "High Match|Moderate Match|Low Match",
      "matching_skills": [<matched skills>],
      "missing_critical_skills": [<missing skills>],
      "key_strengths": [<2 strengths>],
      "potential_risk_factors": [<1-2 notes on training needs>],
      "recruiter_summary_rationale": "<Recruiter-facing 1-2 sentence summary>",
      "suggested_next_step": "Fast-track to Interview|Send Technical Assessment|Suggest Pre-requisite"
    }}
  ]
}}"""

    @staticmethod
    def academician_cohort_prompt(dept_name: str, students: List[Dict[str, Any]]) -> str:
        return f"""Generate department-level pedagogical and skill intelligence for {dept_name}.
Analyzed Students: {len(students)}

Generate a JSON object with:
{{
  "department_name": "{dept_name}",
  "total_students_evaluated": {len(students)},
  "mean_readiness_score": 82,
  "strongest_cohort_competencies": ["React Web Engineering", "Python Fundamentals", "REST Architecture"],
  "critical_cohort_skill_gaps": [
    {{
      "skill": "Docker Containerization & Kubernetes",
      "affected_percentage": 58,
      "severity": "High"
    }},
    {{
      "skill": "PostgreSQL Query Optimization & Indexing",
      "affected_percentage": 42,
      "severity": "Medium"
    }}
  ],
  "pedagogical_interventions": [
    "Introduce a 2-week hands-on lab on Microservices and Docker CI/CD.",
    "Partner with industry for live database indexing hackathons."
  ]
}}"""
