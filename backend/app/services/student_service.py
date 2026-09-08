import re
import logging
from typing import Dict, Any, List
from fastapi import HTTPException, status
from app.repositories.student_repository import student_repo, PHASE2_MOCK_STORE

logger = logging.getLogger("skillbridge.services.student")

def normalize_skill(name: str) -> str:
    """
    Normalizes a skill name for robust, case-insensitive, formatting-agnostic matching.
    Handles aliases: 'Java Script' / 'JS' -> 'javascript', 'Frontend' -> 'frontend', etc.
    """
    if not name:
        return ""
    clean = re.sub(r"[^\w\s/+.-]", "", str(name)).lower().strip()
    clean = re.sub(r"\s+", " ", clean)

    aliases = {
        "js": "javascript",
        "java script": "javascript",
        "javascript": "javascript",
        "vanilla js": "javascript",
        "es6": "javascript",
        "ecmascript": "javascript",

        "ts": "typescript",
        "type script": "typescript",

        "react": "react",
        "reactjs": "react",
        "react.js": "react",
        "react 18": "react",
        "react native": "react",

        "frontend": "frontend",
        "front-end": "frontend",
        "front end": "frontend",
        "frontend development": "frontend",
        "web frontend": "frontend",

        "py": "python",
        "python": "python",
        "python3": "python",

        "fastapi": "fastapi",
        "fast api": "fastapi",

        "postgres": "postgresql",
        "postgresql": "postgresql",
        "psql": "postgresql",
        "postgres sql": "postgresql",

        "rest": "rest apis",
        "rest api": "rest apis",
        "rest apis": "rest apis",
        "restful": "rest apis",
        "restful api": "rest apis",
        "restful apis": "rest apis",

        "git": "git",
        "github": "git",
        "version control": "git",

        "docker": "docker",
        "docker containerization": "docker",
        "containers": "docker",

        "ci/cd": "ci/cd",
        "cicd": "ci/cd",
        "ci cd": "ci/cd",
        "continuous integration": "ci/cd",

        "cloud": "cloud fundamentals",
        "cloud computing": "cloud fundamentals",
        "cloud fundamentals": "cloud fundamentals",
        "aws": "cloud fundamentals",
        "azure": "cloud fundamentals",
        "gcp": "cloud fundamentals",

        "linux": "linux",
        "unix": "linux",
        "bash": "linux",
        "shell": "linux",

        "dsa": "data structures",
        "data structures": "data structures",
        "algorithms": "algorithms",
    }
    return aliases.get(clean, clean)

def skills_match(req_skill: str, student_skill: str) -> bool:
    """
    Checks if a student's skill satisfies a benchmark required skill.
    Considers normalized equivalence, substring inclusion, and domain mappings (e.g. Frontend <-> React).
    """
    r_norm = normalize_skill(req_skill)
    s_norm = normalize_skill(student_skill)
    if not r_norm or not s_norm:
        return False
    if r_norm == s_norm:
        return True
    if r_norm in s_norm or s_norm in r_norm:
        return True
    # Frontend <-> React mapping: React is the primary frontend UI framework in Full Stack
    if (r_norm == "react" and s_norm == "frontend") or (r_norm == "frontend" and s_norm == "react"):
        return True
    # FastAPI <-> REST APIs mapping: FastAPI directly provides RESTful API architecture
    if (r_norm == "rest apis" and s_norm == "fastapi") or (r_norm == "fastapi" and s_norm == "rest apis"):
        return True
    return False

CAREER_PATH_BENCHMARKS = [
    {
        "role_name": "Full Stack Developer",
        "required_skills": ["React", "JavaScript", "Python", "FastAPI", "PostgreSQL", "Git"]
    },
    {
        "role_name": "Cloud & DevOps Engineer",
        "required_skills": ["Docker", "Linux", "Python", "Cloud Fundamentals", "CI/CD", "PostgreSQL"]
    },
    {
        "role_name": "Data Systems & AI Developer",
        "required_skills": ["Python", "Data Structures", "Algorithms", "PostgreSQL", "FastAPI"]
    }
]

class StudentService:
    def get_dashboard_summary(self, student_id: str) -> Dict[str, Any]:
        profile = student_repo.get_full_student_profile(student_id)
        skills = student_repo.get_student_skills(student_id)
        student_skill_names = [
            s.get("skill_name", "") for s in skills
            if isinstance(s, dict) and s.get("skill_name")
        ]
        
        # Calculate profile completion percentage
        completion_score = 0
        total_checks = 7
        if profile.get("full_name"): completion_score += 1
        if profile.get("phone"): completion_score += 1
        if profile.get("location"): completion_score += 1
        if len(profile.get("education", [])) > 0: completion_score += 1
        if len(profile.get("projects", [])) > 0: completion_score += 1
        if len(profile.get("certifications", [])) > 0: completion_score += 1
        if len(skills) >= 3: completion_score += 1
        
        profile_completion = int((completion_score / total_checks) * 100)

        # Assessment results
        attempts = student_repo.get_student_assessment_results(student_id)
        top_strengths = []
        identified_gaps = []
        for att in attempts:
            for s in att.get("strengths", []):
                if s not in top_strengths:
                    top_strengths.append(s)
            for g in att.get("skill_gaps", []):
                if g not in identified_gaps:
                    identified_gaps.append(g)

        if not top_strengths:
            top_strengths = [s for s in student_skill_names[:3]] if student_skill_names else ["React", "Python"]
        if not identified_gaps:
            identified_gaps = ["Cloud Security", "Docker Containerization"]

        # Career Paths Progress - dynamically benchmark against current student competencies
        career_paths = []
        for benchmark in CAREER_PATH_BENCHMARKS:
            required = benchmark["required_skills"]
            acquired = [
                req for req in required
                if any(skills_match(req, sk) for sk in student_skill_names)
            ]
            missing = [req for req in required if req not in acquired]
            match_pct = int((len(acquired) / len(required)) * 100) if required else 0
            career_paths.append({
                "role_name": benchmark["role_name"],
                "match_percentage": match_pct,
                "required_skills": required,
                "acquired_skills": acquired,
                "missing_skills": missing
            })

        opportunities = student_repo.get_opportunities(student_id)
        learning_resources = student_repo.get_learning_resources(student_id)
        applications = student_repo.get_student_applications(student_id)

        resume = student_repo.get_student_resume(student_id)
        resume_status = "Ready & Tailored" if resume.get("data", {}).get("headline") else "Draft"

        return {
            "profile_completion_percent": profile_completion,
            "total_skills_count": len(skills),
            "assessments_completed": len(attempts),
            "applications_count": len(applications),
            "resume_status": resume_status,
            "top_strengths": top_strengths[:5],
            "identified_gaps": identified_gaps[:4],
            "career_paths": career_paths,
            "recommended_opportunities": opportunities[:3],
            "recommended_learning": learning_resources[:3],
            "recent_applications": applications[:5]
        }

    def evaluate_assessment(self, student_id: str, assessment_id: str, answers: Dict[str, int]) -> Dict[str, Any]:
        assessment = student_repo.get_assessment_by_id(assessment_id)
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

        questions = [q for q in PHASE2_MOCK_STORE["assessment_questions"] if str(q["assessment_id"]) == str(assessment_id)]
        if not questions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No questions configured for this assessment.")

        total_marks = len(questions)
        score = 0
        strengths = []
        skill_gaps = []

        for q in questions:
            q_id = str(q["id"])
            selected_idx = answers.get(q_id)
            correct_idx = q.get("correct_option_index")
            skill_tag = q.get("skill_tag", "General")

            if selected_idx is not None and selected_idx == correct_idx:
                score += 1
                if skill_tag not in strengths:
                    strengths.append(skill_tag)
            else:
                if skill_tag not in skill_gaps:
                    skill_gaps.append(skill_tag)

        percentage = round((score / total_marks) * 100.0, 2)
        passing_pct = assessment.get("passing_percentage", 60)
        passed = percentage >= passing_pct

        attempt = student_repo.create_assessment_attempt(
            student_id=student_id,
            assessment_id=assessment_id,
            score=score,
            total_marks=total_marks,
            percentage=percentage,
            passed=passed,
            strengths=strengths,
            skill_gaps=skill_gaps,
            answers=answers
        )

        return attempt

student_service = StudentService()
