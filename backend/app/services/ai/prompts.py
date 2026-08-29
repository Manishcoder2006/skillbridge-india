from typing import Dict, Any, List

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
    def resume_optimizer_prompt(name: str, current_summary: str, skills: List[str], target_role: str) -> str:
        return f"""Analyze and optimize this engineering resume summary for ATS compliance.
Candidate: {name}
Target Role: {target_role}
Current Summary: {current_summary}
Skills: {', '.join(skills)}

Generate a JSON object with:
{{
  "overall_ats_score": <int between 70 and 95>,
  "summary_critique": "<constructive feedback on impact and metrics>",
  "enhanced_summary_draft": "<high-impact ATS-optimized 2-sentence summary with action verbs>",
  "bullet_point_improvements": [
    {{
      "original_example": "<sample weak bullet>",
      "improved_bullet": "<quantified, impact-driven bullet>"
    }}
  ],
  "recommended_keywords_to_add": [<4-6 industry keywords>]
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
