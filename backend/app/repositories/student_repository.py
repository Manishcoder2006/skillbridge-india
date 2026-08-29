import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.core.database import db_manager, MOCK_DATA_STORE

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
    "student_resumes": {
        "u1000000-0000-0000-0000-000000000001": {
            "headline": "Aspiring Full Stack Engineer & Cloud Developer",
            "summary": "Passionate Computer Science undergraduate at IIT Delhi with solid foundations in React, FastAPI, PostgreSQL, and scalable API systems. Actively seeking a summer engineering internship.",
            "target_role": "Full Stack Developer",
            "education": [
                {
                    "institution": "Indian Institute of Technology Delhi",
                    "degree": "Bachelor of Technology (B.Tech)",
                    "field_of_study": "Computer Science and Engineering",
                    "start_year": 2023,
                    "end_year": 2027,
                    "grade_or_cgpa": "8.8 / 10"
                },
                {
                    "institution": "Delhi Public School, R.K. Puram",
                    "degree": "Higher Secondary (CBSE Class XII)",
                    "field_of_study": "Science (PCM + CS)",
                    "start_year": 2021,
                    "end_year": 2023,
                    "grade_or_cgpa": "96.4%"
                }
            ],
            "skills": ["React", "JavaScript (ES6+)", "Python", "FastAPI", "PostgreSQL", "REST APIs", "Git", "Docker", "Agile Collaboration"],
            "projects": [
                {
                    "title": "SkillBridge Multi-Tenant Academic Portal",
                    "description": "Engineered a production-ready role-based academic portal with strict Supabase Row Level Security, FastAPI backend, and React UI.",
                    "technologies": ["React", "FastAPI", "PostgreSQL", "RLS"],
                    "github_or_demo_url": "https://github.com/example/skillbridge"
                },
                {
                    "title": "Distributed Task Engine",
                    "description": "Implemented a lightweight asynchronous job processor with persistent task logs and health monitoring.",
                    "technologies": ["Python", "AsyncIO", "REST APIs"],
                    "github_or_demo_url": "https://github.com/example/task-engine"
                }
            ],
            "experience": [
                {
                    "company": "IITD Center for Computing Services",
                    "role": "Student Systems Assistant",
                    "start_date": "Jan 2025",
                    "end_date": "Present",
                    "description": "Assisted in maintaining departmental web servers and configuring role access controls for lab infrastructure."
                }
            ],
            "certifications": [
                {
                    "name": "NPTEL Certified Full Stack Web Specialist",
                    "issuer": "NPTEL / IIT Madras",
                    "issue_year": 2025,
                    "credential_url": "https://nptel.ac.in/verify"
                }
            ],
            "achievements": [
                {
                    "title": "Finalist - Smart India Hackathon 2026",
                    "organization": "Ministry of Education / AICTE",
                    "year": 2026,
                    "description": "Shortlisted for national finals for developing an intelligent Academia-Industry collaboration portal."
                }
            ],
            "links": {
                "github": "https://github.com/aarav-sharma",
                "linkedin": "https://linkedin.com/in/aarav-sharma-iitd",
                "portfolio": "https://aaravsharma.dev"
            }
        }
    },
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
        Fetches combined student profile, academic metrics, and extended portfolio.
        """
        # 1. Base profile
        base = None
        for p in MOCK_DATA_STORE["profiles"]:
            if str(p["id"]) == str(student_id):
                base = p
                break
        
        if not base:
            base = {
                "id": student_id,
                "email": "student@institute.ac.in",
                "full_name": "Student User",
                "phone": "+91 9876543210",
                "avatar_url": None,
                "role": "student",
                "institution_id": "a1000000-0000-0000-0000-000000000001",
                "department_id": "b1000000-0000-0000-0000-000000000001",
                "verification_status": "verified"
            }

        # 2. Institution & Department names
        inst_name = "Indian Institute of Technology Delhi"
        dept_name = "Computer Science and Engineering"
        for inst in MOCK_DATA_STORE["institutions"]:
            if str(inst["id"]) == str(base.get("institution_id")):
                inst_name = inst["name"]
                break
        for dept in MOCK_DATA_STORE["departments"]:
            if str(dept["id"]) == str(base.get("department_id")):
                dept_name = dept["name"]
                break

        # 3. Extended portfolio info
        ext = PHASE2_MOCK_STORE["student_extended_profiles"].get(student_id, {
            "program": "B.Tech Computer Science and Engineering",
            "current_semester": 6,
            "cgpa": 8.5,
            "location": "New Delhi, India",
            "career_interests": ["Full Stack Development", "Cloud Architecture"],
            "education": [],
            "projects": [],
            "certifications": [],
            "achievements": []
        })

        return {
            "id": base["id"],
            "email": base["email"],
            "full_name": base["full_name"],
            "phone": base.get("phone"),
            "avatar_url": base.get("avatar_url"),
            "role": base["role"],
            "institution_id": base.get("institution_id"),
            "department_id": base.get("department_id"),
            "institution_name": inst_name,
            "department_name": dept_name,
            "program": ext.get("program", "B.Tech Computer Science and Engineering"),
            "current_semester": ext.get("current_semester", 6),
            "cgpa": ext.get("cgpa", 8.5),
            "location": ext.get("location", "New Delhi, India"),
            "career_interests": ext.get("career_interests", []),
            "education": ext.get("education", []),
            "projects": ext.get("projects", []),
            "certifications": ext.get("certifications", []),
            "achievements": ext.get("achievements", []),
            "verification_status": base.get("verification_status", "verified")
        }

    def update_student_profile(self, student_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates allowed student profile fields while keeping role and institution_id protected.
        """
        # Update base profile safe fields
        base_updates = {k: v for k, v in update_data.items() if k in {"full_name", "phone", "avatar_url"} and v is not None}
        for p in MOCK_DATA_STORE["profiles"]:
            if str(p["id"]) == str(student_id):
                p.update(base_updates)
                break

        # Update extended fields
        if student_id not in PHASE2_MOCK_STORE["student_extended_profiles"]:
            PHASE2_MOCK_STORE["student_extended_profiles"][student_id] = {}
        
        ext = PHASE2_MOCK_STORE["student_extended_profiles"][student_id]
        for field in ["location", "program", "current_semester", "cgpa", "career_interests", "education", "projects", "certifications", "achievements"]:
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
        if student_id in PHASE2_MOCK_STORE["student_resumes"]:
            data = PHASE2_MOCK_STORE["student_resumes"][student_id]
        else:
            profile = self.get_full_student_profile(student_id)
            skills = [s["skill_name"] for s in self.get_student_skills(student_id)]
            data = {
                "headline": f"Aspiring Engineer & {profile.get('program', 'Developer')}",
                "summary": "Motivated technology student with a strong academic track record and verified full-stack skills.",
                "target_role": "Full Stack Developer",
                "education": profile.get("education", []),
                "skills": skills or ["React", "Python", "FastAPI", "PostgreSQL"],
                "projects": profile.get("projects", []),
                "experience": [],
                "certifications": profile.get("certifications", []),
                "achievements": profile.get("achievements", []),
                "links": {"github": "", "linkedin": "", "portfolio": ""}
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
