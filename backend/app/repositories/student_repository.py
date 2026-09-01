import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.core.database import db_manager, MOCK_DATA_STORE
from app.repositories.user_repository import user_repo

logger = logging.getLogger("skillbridge.repositories.student")

# Phase 2 In-Memory Mock Store for Offline Dev & Testing
PHASE2_MOCK_STORE = {
    "student_skills": [
        {"id": "sk-1", "student_id": "u1000000-0000-0000-0000-000000000001", "skill_name": "React", "category": "technical", "proficiency_level": "advanced", "is_verified": True, "created_at": "2026-08-01T10:00:00Z"},
        {"id": "sk-2", "student_id": "u1000000-0000-0000-0000-000000000001", "skill_name": "Python", "category": "technical", "proficiency_level": "intermediate", "is_verified": True, "created_at": "2026-08-02T10:00:00Z"},
        {"id": "sk-3", "student_id": "u1000000-0000-0000-0000-000000000001", "skill_name": "FastAPI", "category": "technical", "proficiency_level": "intermediate", "is_verified": False, "created_at": "2026-08-03T10:00:00Z"},
        {"id": "sk-4", "student_id": "u1000000-0000-0000-0000-000000000001", "skill_name": "PostgreSQL", "category": "technical", "proficiency_level": "intermediate", "is_verified": True, "created_at": "2026-08-04T10:00:00Z"},
        {"id": "sk-5", "student_id": "u1000000-0000-0000-0000-000000000001", "skill_name": "Team Leadership", "category": "soft", "proficiency_level": "advanced", "is_verified": False, "created_at": "2026-08-05T10:00:00Z"},
        {"id": "sk-6", "student_id": "u1000000-0000-0000-0000-000000000001", "skill_name": "Technical Communication", "category": "soft", "proficiency_level": "advanced", "is_verified": True, "created_at": "2026-08-06T10:00:00Z"},
    ],
    "assessments": [
        {
            "id": "d1000000-0000-0000-0000-000000000001",
            "title": "Full Stack Web Development Readiness",
            "category": "Web Development",
            "description": "Assess core proficiency in modern React, RESTful APIs, state management, and responsive frontend architecture.",
            "duration_minutes": 15,
            "total_questions": 5,
            "passing_percentage": 60,
            "difficulty": "intermediate",
            "is_active": True,
        },
        {
            "id": "d1000000-0000-0000-0000-000000000002",
            "title": "Data Structures & Algorithms in Python",
            "category": "Software Engineering",
            "description": "Evaluate core algorithmic thinking, data structure operations, and computational complexity analysis.",
            "duration_minutes": 20,
            "total_questions": 5,
            "passing_percentage": 70,
            "difficulty": "advanced",
            "is_active": True,
        },
        {
            "id": "d1000000-0000-0000-0000-000000000003",
            "title": "Cloud Fundamentals & DevOps Principles",
            "category": "Cloud & Infrastructure",
            "description": "Assess understanding of containerization, CI/CD pipelines, cloud deployment models, and microservices.",
            "duration_minutes": 15,
            "total_questions": 5,
            "passing_percentage": 60,
            "difficulty": "intermediate",
            "is_active": True,
        },
        {
            "id": "d1000000-0000-0000-0000-000000000004",
            "title": "Workplace Communication & Professional Skills",
            "category": "Soft Skills",
            "description": "Evaluate industry collaboration standards, technical communication, and agile teamwork principles.",
            "duration_minutes": 10,
            "total_questions": 4,
            "passing_percentage": 75,
            "difficulty": "beginner",
            "is_active": True,
        }
    ],
    "assessment_questions": [
        {"id": "q-1", "assessment_id": "d1000000-0000-0000-0000-000000000001", "question_text": "What hook is used in React to manage asynchronous side-effects such as data fetching or subscriptions?", "options": ["useState", "useEffect", "useMemo", "useReducer"], "correct_option_index": 1, "skill_tag": "React"},
        {"id": "q-2", "assessment_id": "d1000000-0000-0000-0000-000000000001", "question_text": "Which HTTP status code signifies that a client is unauthenticated (missing or invalid credentials)?", "options": ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"], "correct_option_index": 1, "skill_tag": "REST APIs"},
        {"id": "q-3", "assessment_id": "d1000000-0000-0000-0000-000000000001", "question_text": "In responsive CSS layouts, which property enables flexible container distribution across dynamic screen widths?", "options": ["float", "display: flex", "position: absolute", "clear: both"], "correct_option_index": 1, "skill_tag": "Responsive CSS"},
        {"id": "q-4", "assessment_id": "d1000000-0000-0000-0000-000000000001", "question_text": "What is the purpose of Row Level Security (RLS) in PostgreSQL databases?", "options": ["Encrypt database disk storage", "Restrict which table rows users can access based on security policies", "Automatically back up database logs", "Speed up database index creation"], "correct_option_index": 1, "skill_tag": "Database Security"},
        {"id": "q-5", "assessment_id": "d1000000-0000-0000-0000-000000000001", "question_text": "In FastAPI, what Pydantic feature provides automatic request payload validation and parsing?", "options": ["BaseSettings", "BaseModel", "FieldValidator", "Depends"], "correct_option_index": 1, "skill_tag": "FastAPI"},

        {"id": "q-6", "assessment_id": "d1000000-0000-0000-0000-000000000002", "question_text": "What is the average time complexity of searching for a key in a Python dictionary (hash map)?", "options": ["O(n)", "O(log n)", "O(1)", "O(n^2)"], "correct_option_index": 2, "skill_tag": "Python"},
        {"id": "q-7", "assessment_id": "d1000000-0000-0000-0000-000000000002", "question_text": "Which data structure follows the First-In, First-Out (FIFO) access principle?", "options": ["Stack", "Queue", "Binary Search Tree", "Max Heap"], "correct_option_index": 1, "skill_tag": "Data Structures"},
        {"id": "q-8", "assessment_id": "d1000000-0000-0000-0000-000000000002", "question_text": "In Python, what is the key difference between a list and a tuple?", "options": ["Lists are immutable, tuples are mutable", "Lists are mutable, tuples are immutable", "Tuples cannot hold integers", "Lists cannot be sorted"], "correct_option_index": 1, "skill_tag": "Python"},
        {"id": "q-9", "assessment_id": "d1000000-0000-0000-0000-000000000002", "question_text": "Which sorting algorithm has a worst-case time complexity of O(n log n)?", "options": ["Bubble Sort", "Insertion Sort", "Merge Sort", "Quick Sort"], "correct_option_index": 2, "skill_tag": "Algorithms"},
        {"id": "q-10", "assessment_id": "d1000000-0000-0000-0000-000000000002", "question_text": "What algorithm paradigm is used in Dijkstra shortest path computation?", "options": ["Greedy Method", "Brute Force", "Backtracking", "Divide and Conquer"], "correct_option_index": 0, "skill_tag": "Algorithms"},

        {"id": "q-11", "assessment_id": "d1000000-0000-0000-0000-000000000003", "question_text": "What is Docker primarily used for in modern DevOps workflows?", "options": ["Compiling C++ code", "Containerizing applications and dependencies", "Managing database migrations only", "Creating graphic UI mockups"], "correct_option_index": 1, "skill_tag": "Docker"},
        {"id": "q-12", "assessment_id": "d1000000-0000-0000-0000-000000000003", "question_text": "What does CI/CD stand for in software delivery?", "options": ["Continuous Integration & Continuous Deployment", "Code Inspection & Code Debugging", "Central Interface & Control Distribution", "Client Isolation & Container Delivery"], "correct_option_index": 0, "skill_tag": "DevOps"},

        {"id": "q-13", "assessment_id": "d1000000-0000-0000-0000-000000000004", "question_text": "When communicating technical blockers in an agile daily standup, what should be highlighted?", "options": ["What was done, what is planned, and what impediment is blocking progress", "Only personal grievances", "A full 2-hour code walkthrough", "Nothing until the sprint completes"], "correct_option_index": 0, "skill_tag": "Agile Collaboration"},
        {"id": "q-14", "assessment_id": "d1000000-0000-0000-0000-000000000004", "question_text": "What is an effective practice when receiving technical code review feedback?", "options": ["Defend every line aggressively", "Review the feedback constructively, ask clarifying questions, and make necessary improvements", "Ignore the review and merge directly", "Delete the pull request"], "correct_option_index": 1, "skill_tag": "Teamwork"}
    ],
    "assessment_attempts": [
        {
            "id": "att-1",
            "student_id": "u1000000-0000-0000-0000-000000000001",
            "assessment_id": "d1000000-0000-0000-0000-000000000001",
            "assessment_title": "Full Stack Web Development Readiness",
            "score": 4,
            "total_marks": 5,
            "percentage": 80.0,
            "passed": True,
            "status": "completed",
            "strengths": ["React", "REST APIs", "Responsive CSS", "FastAPI"],
            "skill_gaps": ["Database Security (RLS)"],
            "completed_at": "2026-08-20T14:30:00Z"
        }
    ],
    "learning_resources": [
        {"id": "f1", "title": "Modern React 18 & State Architecture", "category": "Web Development", "skill_tag": "React", "resource_type": "course", "provider": "SWAYAM / NPTEL", "duration": "4 weeks", "url": "https://swayam.gov.in", "level": "intermediate", "is_free": True, "rating": 4.9},
        {"id": "f2", "title": "FastAPI High-Performance Backend Engineering", "category": "Backend Engineering", "skill_tag": "FastAPI", "resource_type": "tutorial", "provider": "SkillBridge Labs", "duration": "6 hours", "url": "https://fastapi.tiangolo.com", "level": "intermediate", "is_free": True, "rating": 4.8},
        {"id": "f3", "title": "Database Modeling & PostgreSQL Row Level Security", "category": "Databases", "skill_tag": "PostgreSQL", "resource_type": "workshop", "provider": "IIT Delhi Open Courseware", "duration": "3 hours", "url": "https://www.postgresql.org/docs/", "level": "advanced", "is_free": True, "rating": 4.9},
        {"id": "f4", "title": "Python for Algorithmic Problem Solving", "category": "Software Engineering", "skill_tag": "Python", "resource_type": "course", "provider": "AICTE / NEAT Portal", "duration": "8 weeks", "url": "https://neat.aicte-india.org", "level": "intermediate", "is_free": True, "rating": 4.7},
        {"id": "f5", "title": "Cloud Infrastructure & Docker Containerization", "category": "DevOps", "skill_tag": "Docker", "resource_type": "video", "provider": "NPTEL Cloud Series", "duration": "5 hours", "url": "https://nptel.ac.in", "level": "intermediate", "is_free": True, "rating": 4.8},
        {"id": "f6", "title": "Executive Technical Writing & Professional Communication", "category": "Soft Skills", "skill_tag": "Communication", "resource_type": "pdf", "provider": "National Skill Development Corp", "duration": "2 hours", "url": "https://nsdcindia.org", "level": "beginner", "is_free": True, "rating": 4.6}
    ],
    "student_learning_progress": [
        {"id": "lp-1", "student_id": "u1000000-0000-0000-0000-000000000001", "resource_id": "f1", "status": "completed", "progress_percent": 100},
        {"id": "lp-2", "student_id": "u1000000-0000-0000-0000-000000000001", "resource_id": "f2", "status": "in_progress", "progress_percent": 60}
    ],
    "opportunities": [
        {
            "id": "g1000000-0000-0000-0000-000000000001",
            "company_id": "c1000000-0000-0000-0000-000000000001",
            "company_name": "Tata Consultancy Services",
            "title": "Software Engineer Intern (Full Stack)",
            "type": "internship",
            "location": "Bengaluru / Pune",
            "work_mode": "hybrid",
            "stipend_or_salary": "₹25,000 / month",
            "required_skills": ["React", "Python", "REST APIs", "PostgreSQL"],
            "eligibility": "Open to 3rd & 4th Year B.Tech / BE CSE & IT students with CGPA >= 7.0",
            "description": "Join TCS Innovation Labs to develop scalable full stack enterprise cloud applications. Work alongside principal architects.",
            "application_deadline": "2026-10-31",
            "is_active": True,
            "created_at": "2026-08-20T10:00:00Z"
        },
        {
            "id": "g1000000-0000-0000-0000-000000000002",
            "company_id": "c1000000-0000-0000-0000-000000000002",
            "company_name": "Infosys Limited",
            "title": "Associate Software Engineer - Cloud & Systems",
            "type": "job",
            "location": "Hyderabad / Chennai",
            "work_mode": "on_site",
            "stipend_or_salary": "₹7.5 LPA",
            "required_skills": ["Python", "Data Structures", "Docker", "Linux"],
            "eligibility": "Final Year B.Tech / MCA graduates (2026 Batch)",
            "description": "Exciting opportunity for entry-level software engineers to build robust microservices and distributed cloud infrastructure.",
            "application_deadline": "2026-11-15",
            "is_active": True,
            "created_at": "2026-08-21T11:00:00Z"
        },
        {
            "id": "g1000000-0000-0000-0000-000000000003",
            "company_id": "c1000000-0000-0000-0000-000000000003",
            "company_name": "Larsen & Toubro",
            "title": "Smart Technology R&D Intern",
            "type": "internship",
            "location": "Mumbai",
            "work_mode": "hybrid",
            "stipend_or_salary": "₹30,000 / month",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Git"],
            "eligibility": "Pre-final & Final year students in Engineering / Technology",
            "description": "Participate in industrial automation and digital transformation platforms built for nation-scale infrastructure projects.",
            "application_deadline": "2026-10-20",
            "is_active": True,
            "created_at": "2026-08-22T09:00:00Z"
        },
        {
            "id": "g1000000-0000-0000-0000-000000000004",
            "company_id": "c1000000-0000-0000-0000-000000000001",
            "company_name": "Tata Consultancy Services",
            "title": "Frontend Developer Trainee",
            "type": "job",
            "location": "New Delhi / Gurugram",
            "work_mode": "hybrid",
            "stipend_or_salary": "₹8.0 LPA",
            "required_skills": ["React", "JavaScript", "Responsive CSS", "UI/UX"],
            "eligibility": "Graduating engineering students with strong frontend portfolio",
            "description": "Create high-accessibility user experiences for government digital services and modern web applications.",
            "application_deadline": "2026-12-01",
            "is_active": True,
            "created_at": "2026-08-23T14:00:00Z"
        }
    ],
    "applications": [
        {
            "id": "app-1",
            "student_id": "u1000000-0000-0000-0000-000000000001",
            "opportunity_id": "g1000000-0000-0000-0000-000000000001",
            "company_name": "Tata Consultancy Services",
            "title": "Software Engineer Intern (Full Stack)",
            "type": "internship",
            "location": "Bengaluru / Pune",
            "status": "under_review",
            "notes": "Resume and Skill Assessment score verified.",
            "applied_at": "2026-08-25T11:20:00Z",
            "updated_at": "2026-08-26T09:15:00Z"
        }
    ],
    "student_resumes": {},
    "student_extended_profiles": {
        "u1000000-0000-0000-0000-000000000001": {
            "program": "B.Tech Computer Science and Engineering",
            "current_semester": 6,
            "cgpa": 8.8,
            "location": "New Delhi, India",
            "career_interests": ["Full Stack Web Development", "Cloud Architecture", "Applied AI Systems"],
            "education": [
                {
                    "institution": "Indian Institute of Technology Delhi",
                    "degree": "Bachelor of Technology",
                    "field_of_study": "Computer Science & Engineering",
                    "start_year": 2023,
                    "end_year": 2027,
                    "grade_or_cgpa": "8.8 / 10"
                }
            ],
            "projects": [
                {
                    "title": "SkillBridge Multi-Tenant Academic Portal",
                    "description": "Engineered an enterprise academia-industry collaboration platform with RLS and FastAPI.",
                    "technologies": ["React", "FastAPI", "PostgreSQL", "RLS"],
                    "github_or_demo_url": "https://github.com/example/skillbridge"
                }
            ],
            "certifications": [
                {
                    "name": "NPTEL Certified Full Stack Specialist",
                    "issuer": "NPTEL / IIT Madras",
                    "issue_year": 2025,
                    "credential_url": "https://nptel.ac.in/verify"
                }
            ],
            "achievements": [
                {
                    "title": "Finalist - Smart India Hackathon 2026",
                    "organization": "AICTE / MoE",
                    "year": 2026,
                    "description": "Shortlisted for National Grand Finale"
                }
            ]
        }
    }
}

class StudentRepository:
    def get_full_student_profile(self, student_id: str) -> Dict[str, Any]:
        """
        Fetches combined student profile, academic metrics, and extended portfolio
        for the currently authenticated student ID.
        """
        # 1. Base profile lookup
        base = user_repo.get_profile_by_id(student_id)
        if not base:
            for p in MOCK_DATA_STORE["profiles"]:
                if str(p["id"]) == str(student_id):
                    base = p
                    break

        if not base:
            base = {
                "id": student_id,
                "email": "student@skillbridge.in",
                "full_name": "Student User",
                "phone": None,
                "avatar_url": None,
                "role": "student",
                "institution_id": None,
                "department_id": None,
                "verification_status": "verified",
                "is_active": True,
            }

        # 2. Student specific extension from student_profiles table (Live Supabase)
        stu_data = {}
        if db_manager.is_live and db_manager.client:
            try:
                stu_res = (
                    db_manager.client.table("student_profiles")
                    .select("*")
                    .eq("id", student_id)
                    .maybe_single()
                    .execute()
                )
                if stu_res and stu_res.data:
                    stu_data = stu_res.data
            except Exception as e:
                logger.warning(f"Failed to query live student_profiles: {e}")

        # 3. Institution & Department names
        inst_name = None
        dept_name = None
        inst_id = base.get("institution_id") or stu_data.get("institution_id")
        dept_id = base.get("department_id") or stu_data.get("department_id")

        if inst_id:
            if db_manager.is_live and db_manager.client:
                try:
                    inst_res = (
                        db_manager.client.table("institutions")
                        .select("name")
                        .eq("id", inst_id)
                        .maybe_single()
                        .execute()
                    )
                    if inst_res and inst_res.data:
                        inst_name = inst_res.data.get("name")
                except Exception as e:
                    logger.warning(f"Failed to fetch institution name: {e}")
            if not inst_name:
                for inst in MOCK_DATA_STORE["institutions"]:
                    if str(inst["id"]) == str(inst_id):
                        inst_name = inst["name"]
                        break

        if dept_id:
            if db_manager.is_live and db_manager.client:
                try:
                    dept_res = (
                        db_manager.client.table("departments")
                        .select("name")
                        .eq("id", dept_id)
                        .maybe_single()
                        .execute()
                    )
                    if dept_res and dept_res.data:
                        dept_name = dept_res.data.get("name")
                except Exception as e:
                    logger.warning(f"Failed to fetch department name: {e}")
            if not dept_name:
                for dept in MOCK_DATA_STORE["departments"]:
                    if str(dept["id"]) == str(dept_id):
                        dept_name = dept["name"]
                        break

        # 4. Extended portfolio info
        ext = PHASE2_MOCK_STORE["student_extended_profiles"].get(student_id, {})

        if db_manager.is_live and db_manager.client:
            try:
                res_check = (
                    db_manager.client.table("student_resumes")
                    .select("*")
                    .eq("student_id", student_id)
                    .maybe_single()
                    .execute()
                )
                if res_check and res_check.data:
                    r_data = res_check.data
                    if not ext.get("education") and r_data.get("education"):
                        ext["education"] = r_data["education"]
                    if not ext.get("projects") and r_data.get("projects"):
                        ext["projects"] = r_data["projects"]
                    if not ext.get("certifications") and r_data.get("certifications"):
                        ext["certifications"] = r_data["certifications"]
                    if not ext.get("achievements") and r_data.get("achievements"):
                        ext["achievements"] = r_data["achievements"]
            except Exception as e:
                logger.warning(f"Failed to fetch student_resumes: {e}")

        # Derive semester & study year
        current_sem = stu_data.get("current_semester") or ext.get("current_semester")
        cgpa_val = stu_data.get("cgpa") if stu_data.get("cgpa") is not None else ext.get("cgpa")
        roll_no = (
            stu_data.get("roll_number")
            or ext.get("enrollment_number")
            or (f"2026{str(base['id'])[:6].upper()}" if base.get("id") else None)
        )

        year_str = None
        if current_sem:
            try:
                sem_num = int(current_sem)
                year_num = max(1, (sem_num + 1) // 2)
                suffix = "st" if year_num == 1 else "nd" if year_num == 2 else "rd" if year_num == 3 else "th"
                year_str = f"{year_num}{suffix} Year"
            except Exception:
                year_str = f"Semester {current_sem}"

        return {
            "id": str(base["id"]),
            "email": base["email"],
            "full_name": base["full_name"],
            "phone": base.get("phone") or ext.get("phone"),
            "avatar_url": base.get("avatar_url"),
            "role": base["role"],
            "institution_id": inst_id,
            "department_id": dept_id,
            "institution_name": inst_name or "Educational Institution",
            "department_name": dept_name or "Academic Department",
            "program": ext.get("program") or (f"B.Tech {dept_name}" if dept_name else "Bachelor of Technology"),
            "current_semester": current_sem,
            "year_of_study": ext.get("year_of_study") or year_str,
            "enrollment_number": roll_no,
            "date_of_birth": ext.get("date_of_birth"),
            "gender": ext.get("gender"),
            "nationality": ext.get("nationality") or "Indian",
            "section_batch": ext.get("section_batch"),
            "expected_graduation": ext.get("expected_graduation"),
            "cgpa": float(cgpa_val) if cgpa_val is not None else None,
            "location": ext.get("location"),
            "career_interests": ext.get("career_interests", []),
            "education": ext.get("education", []),
            "projects": ext.get("projects", []),
            "certifications": ext.get("certifications", []),
            "achievements": ext.get("achievements", []),
            "verification_status": base.get("verification_status", "verified"),
        }

    def update_student_profile(self, student_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates allowed student profile fields while keeping role and institution_id protected.
        """
        # 1. Update base profile safe fields in profiles table
        base_updates = {
            k: v for k, v in update_data.items()
            if k in {"full_name", "phone", "avatar_url"} and v is not None
        }
        if base_updates:
            user_repo.update_profile_safe(student_id, base_updates)

        # 2. Update student_profiles if live
        if db_manager.is_live and db_manager.client:
            try:
                stu_updates = {"id": student_id}
                if "enrollment_number" in update_data and update_data["enrollment_number"] is not None:
                    stu_updates["roll_number"] = update_data["enrollment_number"]
                if "current_semester" in update_data and update_data["current_semester"] is not None:
                    stu_updates["current_semester"] = update_data["current_semester"]
                if "cgpa" in update_data and update_data["cgpa"] is not None:
                    stu_updates["cgpa"] = update_data["cgpa"]
                if len(stu_updates) > 1:
                    db_manager.client.table("student_profiles").upsert(stu_updates).execute()
            except Exception as e:
                logger.warning(f"Live Supabase student_profiles upsert failed: {e}")

        # 3. Update extended fields in memory store
        if student_id not in PHASE2_MOCK_STORE["student_extended_profiles"]:
            PHASE2_MOCK_STORE["student_extended_profiles"][student_id] = {}

        ext = PHASE2_MOCK_STORE["student_extended_profiles"][student_id]
        for field in [
            "location", "program", "current_semester", "cgpa", "career_interests",
            "education", "projects", "certifications", "achievements",
            "date_of_birth", "gender", "nationality", "section_batch",
            "expected_graduation", "year_of_study", "enrollment_number", "phone"
        ]:
            if field in update_data and update_data[field] is not None:
                ext[field] = update_data[field]

        return self.get_full_student_profile(student_id)

    def get_student_skills(self, student_id: str) -> List[Dict[str, Any]]:
        return [s for s in PHASE2_MOCK_STORE["student_skills"] if str(s["student_id"]) == str(student_id)]

    def add_student_skill(self, student_id: str, skill_data: Dict[str, Any]) -> Dict[str, Any]:
        # Check duplicate
        for s in PHASE2_MOCK_STORE["student_skills"]:
            if str(s["student_id"]) == str(student_id) and s["skill_name"].lower() == skill_data["skill_name"].lower():
                s["proficiency_level"] = skill_data.get("proficiency_level", s["proficiency_level"])
                return s

        new_skill = {
            "id": f"sk-{uuid.uuid4().hex[:6]}",
            "student_id": student_id,
            "skill_name": skill_data["skill_name"],
            "category": skill_data.get("category", "technical"),
            "proficiency_level": skill_data.get("proficiency_level", "intermediate"),
            "is_verified": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        PHASE2_MOCK_STORE["student_skills"].append(new_skill)
        return new_skill

    def delete_student_skill(self, student_id: str, skill_id: str) -> bool:
        initial_len = len(PHASE2_MOCK_STORE["student_skills"])
        PHASE2_MOCK_STORE["student_skills"] = [
            s for s in PHASE2_MOCK_STORE["student_skills"]
            if not (str(s["id"]) == str(skill_id) and str(s["student_id"]) == str(student_id))
        ]
        return len(PHASE2_MOCK_STORE["student_skills"]) < initial_len

    def get_assessments(self) -> List[Dict[str, Any]]:
        return [a for a in PHASE2_MOCK_STORE["assessments"] if a.get("is_active")]

    def get_assessment_by_id(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        for a in PHASE2_MOCK_STORE["assessments"]:
            if str(a["id"]) == str(assessment_id):
                questions = [
                    {"id": q["id"], "question_text": q["question_text"], "options": q["options"], "skill_tag": q["skill_tag"]}
                    for q in PHASE2_MOCK_STORE["assessment_questions"]
                    if str(q["assessment_id"]) == str(assessment_id)
                ]
                return {**a, "questions": questions}
        return None

    def create_assessment_attempt(
        self,
        student_id: str,
        assessment_id: str,
        score: int,
        total_marks: int,
        percentage: float,
        passed: bool,
        strengths: List[str],
        skill_gaps: List[str],
        answers: Dict[str, int]
    ) -> Dict[str, Any]:
        assessment_title = "Skill Assessment"
        for a in PHASE2_MOCK_STORE["assessments"]:
            if str(a["id"]) == str(assessment_id):
                assessment_title = a["title"]
                break

        attempt = {
            "id": f"att-{uuid.uuid4().hex[:6]}",
            "student_id": student_id,
            "assessment_id": assessment_id,
            "assessment_title": assessment_title,
            "score": score,
            "total_marks": total_marks,
            "percentage": percentage,
            "passed": passed,
            "status": "completed",
            "strengths": strengths,
            "skill_gaps": skill_gaps,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        PHASE2_MOCK_STORE["assessment_attempts"].append(attempt)
        return attempt

    def get_student_assessment_results(self, student_id: str) -> List[Dict[str, Any]]:
        return [att for att in PHASE2_MOCK_STORE["assessment_attempts"] if str(att["student_id"]) == str(student_id)]

    def get_learning_resources(self, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
        progress_map = {}
        if student_id:
            for p in PHASE2_MOCK_STORE["student_learning_progress"]:
                if str(p["student_id"]) == str(student_id):
                    progress_map[str(p["resource_id"])] = p["status"]

        result = []
        for r in PHASE2_MOCK_STORE["learning_resources"]:
            status = progress_map.get(str(r["id"]), "not_started")
            result.append({**r, "progress_status": status})
        return result

    def update_learning_progress(self, student_id: str, resource_id: str, status: str, progress_percent: int) -> Dict[str, Any]:
        for p in PHASE2_MOCK_STORE["student_learning_progress"]:
            if str(p["student_id"]) == str(student_id) and str(p["resource_id"]) == str(resource_id):
                p["status"] = status
                p["progress_percent"] = progress_percent
                return p

        new_progress = {
            "id": f"lp-{uuid.uuid4().hex[:6]}",
            "student_id": student_id,
            "resource_id": resource_id,
            "status": status,
            "progress_percent": progress_percent
        }
        PHASE2_MOCK_STORE["student_learning_progress"].append(new_progress)
        return new_progress

    def get_opportunities(self, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
        applied_ids = set()
        if student_id:
            for a in PHASE2_MOCK_STORE["applications"]:
                if str(a["student_id"]) == str(student_id):
                    applied_ids.add(str(a["opportunity_id"]))

        return [{**opp, "is_applied": str(opp["id"]) in applied_ids} for opp in PHASE2_MOCK_STORE["opportunities"] if opp.get("is_active")]

    def get_opportunity_by_id(self, opportunity_id: str, student_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        for opp in PHASE2_MOCK_STORE["opportunities"]:
            if str(opp["id"]) == str(opportunity_id):
                is_applied = False
                if student_id:
                    is_applied = any(str(a["opportunity_id"]) == str(opportunity_id) and str(a["student_id"]) == str(student_id) for a in PHASE2_MOCK_STORE["applications"])
                return {**opp, "is_applied": is_applied}
        return None

    def apply_for_opportunity(self, student_id: str, opportunity_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        # Check existing application
        for a in PHASE2_MOCK_STORE["applications"]:
            if str(a["student_id"]) == str(student_id) and str(a["opportunity_id"]) == str(opportunity_id):
                return a

        opp = self.get_opportunity_by_id(opportunity_id)
        if not opp:
            raise ValueError("Opportunity not found.")

        now_str = datetime.now(timezone.utc).isoformat()
        new_app = {
            "id": f"app-{uuid.uuid4().hex[:6]}",
            "student_id": student_id,
            "opportunity_id": opportunity_id,
            "company_name": opp["company_name"],
            "title": opp["title"],
            "type": opp["type"],
            "location": opp["location"],
            "status": "applied",
            "notes": notes or "Application submitted via SkillBridge Portal.",
            "applied_at": now_str,
            "updated_at": now_str
        }
        PHASE2_MOCK_STORE["applications"].append(new_app)
        return new_app

    def get_student_applications(self, student_id: str) -> List[Dict[str, Any]]:
        return [a for a in PHASE2_MOCK_STORE["applications"] if str(a["student_id"]) == str(student_id)]

    def get_student_resume(self, student_id: str) -> Dict[str, Any]:
        profile = self.get_full_student_profile(student_id)
        if student_id in PHASE2_MOCK_STORE["student_resumes"]:
            data = PHASE2_MOCK_STORE["student_resumes"][student_id]
            # Ensure personal fields are present
            if not data.get("full_name") and profile.get("full_name"):
                data["full_name"] = profile.get("full_name")
            if not data.get("email") and profile.get("email"):
                data["email"] = profile.get("email")
            if not data.get("phone") and profile.get("phone"):
                data["phone"] = profile.get("phone")
            if not data.get("location") and profile.get("location"):
                data["location"] = profile.get("location")
            if "coursework" not in data:
                data["coursework"] = []
        else:
            data = {
                "full_name": profile.get("full_name", ""),
                "email": profile.get("email", ""),
                "phone": profile.get("phone", ""),
                "location": profile.get("location", ""),
                "headline": "",
                "summary": "",
                "target_role": "Full Stack Developer",
                "education": [],
                "skills": [],
                "skills_by_category": {
                    "Programming Languages": [],
                    "Frameworks & Libraries": [],
                    "Databases": [],
                    "Cloud & DevOps": [],
                    "Tools": [],
                    "Soft Skills": []
                },
                "projects": [],
                "experience": [],
                "certifications": [],
                "achievements": [],
                "positions_of_responsibility": [],
                "extracurricular_activities": [],
                "coursework": [],
                "links": {"github": "", "linkedin": "", "portfolio": ""},
                "formatting": {
                    "template": "classic",
                    "font_family": "Inter, sans-serif",
                    "font_size": "normal",
                    "line_spacing": "normal",
                    "section_spacing": "normal",
                    "margins": "normal"
                }
            }
            PHASE2_MOCK_STORE["student_resumes"][student_id] = data

        return {
            "id": f"res-{student_id[:8]}",
            "student_id": student_id,
            "data": data,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

    def update_student_resume(self, student_id: str, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        PHASE2_MOCK_STORE["student_resumes"][student_id] = resume_data
        return {
            "id": f"res-{student_id[:8]}",
            "student_id": student_id,
            "data": resume_data,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

student_repo = StudentRepository()
