import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.repositories.student_repository import student_repo
from app.core.database import MOCK_DATA_STORE

# Phase 3 In-Memory Store
PHASE3_DATA_STORE: Dict[str, Any] = {
    "faculty_profiles": {
        "u1000000-0000-0000-0000-000000000002": {
            "designation": "Professor & Head of Department",
            "employee_id": "IITD-FAC-409",
            "specialization": "Distributed Systems & Cloud Architecture",
            "qualifications": "Ph.D. in Computer Science (IIT Delhi), M.Tech (IISc Bangalore)",
            "experience_years": 14,
            "research_interests": ["Multi-Tenant Cloud Security", "Distributed Consensus", "Verifiable AI Workflows"]
        }
    },
    "cohort_students": [
        {
            "id": "u1000000-0000-0000-0000-000000000001",
            "full_name": "Aarav Sharma",
            "email": "student@iitd.ac.in",
            "phone": "+91 98765 43210",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "program": "B.Tech Computer Science & Engineering",
            "current_semester": 6,
            "cgpa": 8.75,
            "location": "New Delhi, India",
            "verified_skills_count": 6,
            "top_skills": ["React", "FastAPI", "PostgreSQL", "JavaScript"],
            "assessment_status": "completed",
            "last_assessment_score": 80.0,
            "identified_gaps": ["Kubernetes", "GraphQL"],
            "applications_count": 2,
            "profile_strength": 100,
            "needs_attention": False
        },
        {
            "id": "u1000000-0000-0000-0000-000000000011",
            "full_name": "Diya Patel",
            "email": "diya.patel@iitd.ac.in",
            "phone": "+91 98111 22334",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "program": "B.Tech Computer Science & Engineering",
            "current_semester": 6,
            "cgpa": 9.12,
            "location": "New Delhi, India",
            "verified_skills_count": 8,
            "top_skills": ["Python", "Machine Learning", "PyTorch", "Data Structures"],
            "assessment_status": "completed",
            "last_assessment_score": 92.0,
            "identified_gaps": ["Docker"],
            "applications_count": 3,
            "profile_strength": 95,
            "needs_attention": False
        },
        {
            "id": "u1000000-0000-0000-0000-000000000012",
            "full_name": "Rohan Verma",
            "email": "rohan.verma@iitd.ac.in",
            "phone": "+91 97222 33445",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "program": "B.Tech Computer Science & Engineering",
            "current_semester": 4,
            "cgpa": 6.80,
            "location": "New Delhi, India",
            "verified_skills_count": 2,
            "top_skills": ["C++", "HTML/CSS"],
            "assessment_status": "needs_attention",
            "last_assessment_score": 40.0,
            "identified_gaps": ["FastAPI", "React", "Git & CI/CD", "SQL Optimization"],
            "applications_count": 0,
            "profile_strength": 45,
            "needs_attention": True
        },
        {
            "id": "u1000000-0000-0000-0000-000000000013",
            "full_name": "Sneha Gupta",
            "email": "sneha.gupta@iitd.ac.in",
            "phone": "+91 96333 44556",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "program": "B.Tech Computer Science & Engineering",
            "current_semester": 6,
            "cgpa": 7.95,
            "location": "New Delhi, India",
            "verified_skills_count": 5,
            "top_skills": ["Java", "Spring Boot", "MySQL", "AWS"],
            "assessment_status": "pending",
            "last_assessment_score": None,
            "identified_gaps": ["System Architecture", "FastAPI"],
            "applications_count": 1,
            "profile_strength": 75,
            "needs_attention": False
        },
        # Other Institution student for isolation verification:
        {
            "id": "u2000000-0000-0000-0000-000000000099",
            "full_name": "Kavita Rao",
            "email": "kavita.rao@iitm.ac.in",
            "phone": "+91 99999 88888",
            "institution_id": "a2000000-0000-0000-0000-000000000002",  # IIT Madras
            "department_id": "b2000000-0000-0000-0000-000000000002",
            "program": "B.Tech CSE",
            "current_semester": 6,
            "cgpa": 9.0,
            "location": "Chennai, India",
            "verified_skills_count": 7,
            "top_skills": ["Rust", "Distributed Systems"],
            "assessment_status": "completed",
            "last_assessment_score": 95.0,
            "identified_gaps": [],
            "applications_count": 4,
            "profile_strength": 90,
            "needs_attention": False
        }
    ],
    "faculty_content": [
        {
            "id": "c1000000-0000-0000-0000-000000000001",
            "academician_id": "u1000000-0000-0000-0000-000000000002",
            "academician_name": "Dr. Rajesh Kumar",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "title": "High-Concurrency Database Architecture & RLS",
            "category": "Databases",
            "skill_tag": "PostgreSQL",
            "resource_type": "workshop",
            "url": "https://fastapi.tiangolo.com/",
            "description": "Faculty lecture notes and practical code patterns for PostgreSQL Row Level Security in multi-tenant cloud applications.",
            "visibility": "department",
            "is_published": True,
            "created_at": "2026-08-25T10:00:00Z"
        },
        {
            "id": "c1000000-0000-0000-0000-000000000002",
            "academician_id": "u1000000-0000-0000-0000-000000000002",
            "academician_name": "Dr. Rajesh Kumar",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "title": "FastAPI Microservices Design Principles",
            "category": "Backend Engineering",
            "skill_tag": "FastAPI",
            "resource_type": "tutorial",
            "url": "https://fastapi.tiangolo.com/",
            "description": "Design patterns for asynchronous Python microservices and Pydantic validation layers.",
            "visibility": "institution",
            "is_published": True,
            "created_at": "2026-08-26T14:30:00Z"
        }
    ],
    "opportunity_recommendations": [
        {
            "id": "r1000000-0000-0000-0000-000000000001",
            "academician_id": "u1000000-0000-0000-0000-000000000002",
            "academician_name": "Dr. Rajesh Kumar",
            "opportunity_id": "g1000000-0000-0000-0000-000000000001",
            "opportunity_title": "Full Stack Developer Intern",
            "company_name": "Tata Consultancy Services (TCS)",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "message": "Recommended for 3rd and 4th-year CSE students proficient in React and Python. TCS Innovation Labs internship.",
            "created_at": "2026-08-27T09:15:00Z"
        }
    ],
    "collaboration_initiatives": [
        {
            "id": "i1000000-0000-0000-0000-000000000001",
            "title": "TCS AI Innovation & Distributed Systems Joint R&D",
            "category": "joint_research",
            "company_name": "Tata Consultancy Services",
            "description": "Faculty research collaboration on distributed consensus algorithms and verifiable multi-tenant systems. Compute & grant allocations available.",
            "mode": "hybrid",
            "duration": "6 Months",
            "deadline": "2026-11-30",
            "status": "open"
        },
        {
            "id": "i1000000-0000-0000-0000-000000000002",
            "title": "Infosys National Cloud Architecture Faculty Development Program",
            "category": "faculty_development",
            "company_name": "Infosys Limited",
            "description": "Hands-on industrial training in container orchestration, microservices observability, and automated deployment pipelines.",
            "mode": "online",
            "duration": "2 Weeks",
            "deadline": "2026-10-15",
            "status": "open"
        },
        {
            "id": "i1000000-0000-0000-0000-000000000003",
            "title": "L&T Smart Infrastructure Industry Mentorship Initiative",
            "category": "mentorship",
            "company_name": "Larsen & Toubro",
            "description": "Engage as a faculty co-mentor for student engineering teams building smart city IoT and civil telemetry solutions.",
            "mode": "hybrid",
            "duration": "4 Weeks",
            "deadline": "2026-10-25",
            "status": "open"
        }
    ],
    "collaboration_participations": {},
    "notifications": [
        {
            "id": "n1000000-0000-0000-0000-000000000001",
            "recipient_id": "u1000000-0000-0000-0000-000000000002",
            "title": "Student Assessment Milestone",
            "message": "Aarav Sharma completed Full Stack Web Development Readiness with an 80% score.",
            "type": "student",
            "is_read": False,
            "link_url": "/dashboard/academician/students",
            "created_at": "2026-08-28T18:00:00Z"
        },
        {
            "id": "n1000000-0000-0000-0000-000000000002",
            "recipient_id": "u1000000-0000-0000-0000-000000000002",
            "title": "New Industry Collaboration Open",
            "message": "TCS AI Innovation Joint R&D program is now accepting faculty expressions of interest.",
            "type": "collaboration",
            "is_read": False,
            "link_url": "/dashboard/academician/collaboration",
            "created_at": "2026-08-28T15:30:00Z"
        },
        {
            "id": "n1000000-0000-0000-0000-000000000003",
            "recipient_id": "u1000000-0000-0000-0000-000000000002",
            "title": "Department Opportunity Posted",
            "message": "New Associate Software Engineer opportunity posted by Infosys matching 12 department students.",
            "type": "opportunity",
            "is_read": True,
            "link_url": "/dashboard/academician/opportunities",
            "created_at": "2026-08-27T11:00:00Z"
        }
    ]
}


class AcademicianRepository:
    """Repository for Phase 3 Academician ecosystem data operations."""

    def get_full_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        profile = next((p for p in MOCK_DATA_STORE["profiles"] if p["id"] == user_id), None)
        if not profile:
            return None

        fac_meta = PHASE3_DATA_STORE["faculty_profiles"].get(user_id, {
            "designation": "Professor & Head of Department",
            "employee_id": "IITD-FAC-409",
            "specialization": "Distributed Systems & Cloud Architecture",
            "qualifications": "Ph.D. in Computer Science (IIT Delhi), M.Tech (IISc Bangalore)",
            "experience_years": 14,
            "research_interests": ["Multi-Tenant Cloud Security", "Distributed Systems", "Verifiable AI Workflows"]
        })

        inst = next((i for i in MOCK_DATA_STORE["institutions"] if i["id"] == profile.get("institution_id")), {})
        dept = next((d for d in MOCK_DATA_STORE["departments"] if d["id"] == profile.get("department_id")), {})

        merged = {**profile}
        merged["institution_name"] = inst.get("name", "IIT Delhi")
        merged["department_name"] = dept.get("name", "Computer Science & Engineering")
        merged.update(fac_meta)
        return merged

    def update_profile(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        profile = next((p for p in MOCK_DATA_STORE["profiles"] if p["id"] == user_id), None)
        if not profile:
            return None

        # Safe update
        allowed_profile_keys = ["full_name", "phone", "avatar_url"]
        for k in allowed_profile_keys:
            if k in update_data and update_data[k] is not None:
                profile[k] = update_data[k]

        if user_id not in PHASE3_DATA_STORE["faculty_profiles"]:
            PHASE3_DATA_STORE["faculty_profiles"][user_id] = {}

        fac_meta = PHASE3_DATA_STORE["faculty_profiles"][user_id]
        allowed_meta_keys = ["designation", "specialization", "qualifications", "experience_years", "research_interests"]
        for k in allowed_meta_keys:
            if k in update_data and update_data[k] is not None:
                fac_meta[k] = update_data[k]

        return self.get_full_profile(user_id)

    def get_authorized_students(
        self,
        institution_id: str,
        department_id: str,
        search: Optional[str] = None,
        semester: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Strict institution & department scoped student lookup."""
        students = [
            s for s in PHASE3_DATA_STORE["cohort_students"]
            if s["institution_id"] == institution_id and s["department_id"] == department_id
        ]

        # Apply search and filters
        filtered = []
        for s in students:
            if search:
                q = search.lower()
                if q not in s["full_name"].lower() and q not in s["email"].lower():
                    continue
            if semester is not None and semester > 0:
                if s["current_semester"] != semester:
                    continue
            if status:
                if status == "attention" and not s["needs_attention"]:
                    continue
                elif status in ["completed", "pending"] and s["assessment_status"] != status:
                    continue

            filtered.append(s)

        return filtered

    def get_student_detail(
        self,
        student_id: str,
        academician_institution_id: str,
        academician_department_id: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch student detail with strict multi-tenant and department validation."""
        student_summary = next(
            (s for s in PHASE3_DATA_STORE["cohort_students"] if s["id"] == student_id),
            None
        )
        if not student_summary:
            return None

        # Cross-institution / Cross-department security check!
        if (
            student_summary["institution_id"] != academician_institution_id
            or student_summary["department_id"] != academician_department_id
        ):
            return None  # Triggers 403 / Not Found

        # Enrich with detailed items
        skills = student_repo.get_student_skills(student_id)
        assessments = student_repo.get_student_assessment_results(student_id)
        learning = student_repo.get_learning_resources(student_id)
        profile_res = student_repo.get_full_student_profile(student_id)
        applications = student_repo.get_student_applications(student_id)

        inst = next((i for i in MOCK_DATA_STORE["institutions"] if i["id"] == student_summary["institution_id"]), {})
        dept = next((d for d in MOCK_DATA_STORE["departments"] if d["id"] == student_summary["department_id"]), {})

        projects = profile_res.get("projects", []) if isinstance(profile_res, dict) else getattr(profile_res, "projects", [])
        certifications = profile_res.get("certifications", []) if isinstance(profile_res, dict) else getattr(profile_res, "certifications", [])
        achievements = profile_res.get("achievements", []) if isinstance(profile_res, dict) else getattr(profile_res, "achievements", [])

        return {
            "id": student_id,
            "full_name": student_summary["full_name"],
            "email": student_summary["email"],
            "phone": student_summary.get("phone", "+91 98765 43210"),
            "program": student_summary["program"],
            "current_semester": student_summary["current_semester"],
            "cgpa": student_summary["cgpa"],
            "institution_name": inst.get("name", "IIT Delhi"),
            "department_name": dept.get("name", "Computer Science & Engineering"),
            "location": student_summary.get("location", "New Delhi, India"),
            "skills": skills,
            "assessment_history": assessments,
            "learning_progress": learning,
            "projects": projects,
            "certifications": certifications,
            "achievements": achievements,
            "applications": applications
        }

    def get_student_analytics(self, institution_id: str, department_id: str) -> Dict[str, Any]:
        """Compute aggregated department analytics without exposing unauthorized PII."""
        students = [
            s for s in PHASE3_DATA_STORE["cohort_students"]
            if s["institution_id"] == institution_id and s["department_id"] == department_id
        ]
        total = len(students)
        if total == 0:
            return {
                "total_authorized_students": 0,
                "average_department_cgpa": 0.0,
                "assessment_completion_rate": 0.0,
                "learning_resource_engagement_rate": 0.0,
                "opportunity_participation_rate": 0.0,
                "students_needing_attention_count": 0,
                "top_verified_skills": [],
                "top_skill_gaps": [],
                "semester_wise_distribution": {},
                "placement_readiness_breakdown": {"ready_70_plus": 0, "developing_40_69": 0, "early_under_40": 0}
            }

        avg_cgpa = round(sum(s["cgpa"] for s in students) / total, 2)
        completed_assessments = sum(1 for s in students if s["assessment_status"] == "completed")
        assessment_rate = round((completed_assessments / total) * 100, 1)
        attention_count = sum(1 for s in students if s["needs_attention"])
        applied_count = sum(1 for s in students if s["applications_count"] > 0)
        opp_rate = round((applied_count / total) * 100, 1)

        # Skill frequency
        skill_counts: Dict[str, int] = {}
        for s in students:
            for sk in s.get("top_skills", []):
                skill_counts[sk] = skill_counts.get(sk, 0) + 1

        top_skills = [
            {"skill_name": sk, "student_count": count, "percentage": round((count / total) * 100, 1)}
            for sk, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        # Skill gaps
        gap_counts: Dict[str, int] = {}
        for s in students:
            for g in s.get("identified_gaps", []):
                gap_counts[g] = gap_counts.get(g, 0) + 1

        top_gaps = [
            {"skill_name": g, "student_count": count, "percentage": round((count / total) * 100, 1)}
            for g, count in sorted(gap_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        # Semester distribution
        sem_dist: Dict[str, int] = {}
        for s in students:
            k = f"Semester {s['current_semester']}"
            sem_dist[k] = sem_dist.get(k, 0) + 1

        # Readiness breakdown
        readiness = {
            "ready_70_plus": sum(1 for s in students if s.get("last_assessment_score", 0) and s["last_assessment_score"] >= 70),
            "developing_40_69": sum(1 for s in students if s.get("last_assessment_score", 0) and 40 <= s["last_assessment_score"] < 70),
            "early_under_40": sum(1 for s in students if not s.get("last_assessment_score") or s["last_assessment_score"] < 40)
        }

        return {
            "total_authorized_students": total,
            "average_department_cgpa": avg_cgpa,
            "assessment_completion_rate": assessment_rate,
            "learning_resource_engagement_rate": 82.5,
            "opportunity_participation_rate": opp_rate,
            "students_needing_attention_count": attention_count,
            "top_verified_skills": top_skills,
            "top_skill_gaps": top_gaps,
            "semester_wise_distribution": sem_dist,
            "placement_readiness_breakdown": readiness
        }

    # --------------------------------------------------------------------------
    # Learning Content Operations
    # --------------------------------------------------------------------------
    def get_faculty_content(
        self,
        academician_id: str,
        institution_id: str,
        department_id: str
    ) -> List[Dict[str, Any]]:
        return [
            c for c in PHASE3_DATA_STORE["faculty_content"]
            if c["academician_id"] == academician_id or (
                c["is_published"] and (
                    c["institution_id"] == institution_id or c["department_id"] == department_id
                )
            )
        ]

    def create_faculty_content(
        self,
        academician_id: str,
        academician_name: str,
        institution_id: str,
        department_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        item = {
            "id": f"c{uuid.uuid4().hex[:31]}",
            "academician_id": academician_id,
            "academician_name": academician_name,
            "institution_id": institution_id,
            "department_id": department_id,
            "title": data["title"],
            "category": data.get("category", "Backend Engineering"),
            "skill_tag": data.get("skill_tag", "FastAPI"),
            "resource_type": data.get("resource_type", "tutorial"),
            "url": data["url"],
            "description": data.get("description", ""),
            "visibility": data.get("visibility", "department"),
            "is_published": data.get("is_published", True),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        PHASE3_DATA_STORE["faculty_content"].insert(0, item)
        return item

    def update_faculty_content(
        self,
        content_id: str,
        academician_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        for c in PHASE3_DATA_STORE["faculty_content"]:
            if c["id"] == content_id and c["academician_id"] == academician_id:
                for k, v in update_data.items():
                    if v is not None:
                        c[k] = v
                return c
        return None

    def delete_faculty_content(self, content_id: str, academician_id: str) -> bool:
        for i, c in enumerate(PHASE3_DATA_STORE["faculty_content"]):
            if c["id"] == content_id and c["academician_id"] == academician_id:
                PHASE3_DATA_STORE["faculty_content"].pop(i)
                return True
        return False

    # --------------------------------------------------------------------------
    # Opportunities & Recommendations
    # --------------------------------------------------------------------------
    def get_recommendations(self, department_id: str) -> List[Dict[str, Any]]:
        return [
            r for r in PHASE3_DATA_STORE["opportunity_recommendations"]
            if r["department_id"] == department_id
        ]

    def create_recommendation(
        self,
        academician_id: str,
        academician_name: str,
        opportunity_id: str,
        institution_id: str,
        department_id: str,
        message: str
    ) -> Optional[Dict[str, Any]]:
        opps = student_repo.get_opportunities()
        opp = next((o for o in opps if (o.get("id") if isinstance(o, dict) else getattr(o, "id", None)) == opportunity_id), None)
        if not opp:
            return None

        opp_title = opp.get("title") if isinstance(opp, dict) else getattr(opp, "title", "Industry Opportunity")
        company_name = opp.get("company_name") if isinstance(opp, dict) else getattr(opp, "company_name", "Partner Enterprise")

        rec = {
            "id": f"r{uuid.uuid4().hex[:31]}",
            "academician_id": academician_id,
            "academician_name": academician_name,
            "opportunity_id": opportunity_id,
            "opportunity_title": opp_title,
            "company_name": company_name,
            "department_id": department_id,
            "message": message or "Recommended by Faculty.",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        PHASE3_DATA_STORE["opportunity_recommendations"].insert(0, rec)
        return rec

    # --------------------------------------------------------------------------
    # Collaboration Operations
    # --------------------------------------------------------------------------
    def get_collaboration_initiatives(self, academician_id: str) -> List[Dict[str, Any]]:
        participations = PHASE3_DATA_STORE["collaboration_participations"].get(academician_id, {})
        results = []
        for init in PHASE3_DATA_STORE["collaboration_initiatives"]:
            item = {**init}
            if init["id"] in participations:
                item["is_participating"] = True
                item["my_status"] = participations[init["id"]]["status"]
            else:
                item["is_participating"] = False
                item["my_status"] = None
            results.append(item)
        return results

    def participate_in_collaboration(
        self,
        academician_id: str,
        initiative_id: str,
        interest_note: str
    ) -> Optional[Dict[str, Any]]:
        init = next((i for i in PHASE3_DATA_STORE["collaboration_initiatives"] if i["id"] == initiative_id), None)
        if not init:
            return None

        if academician_id not in PHASE3_DATA_STORE["collaboration_participations"]:
            PHASE3_DATA_STORE["collaboration_participations"][academician_id] = {}

        part = {
            "id": f"p{uuid.uuid4().hex[:31]}",
            "initiative_id": initiative_id,
            "initiative_title": init["title"],
            "company_name": init["company_name"],
            "interest_note": interest_note,
            "status": "expressed",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        PHASE3_DATA_STORE["collaboration_participations"][academician_id][initiative_id] = part
        return part

    # --------------------------------------------------------------------------
    # Notifications Operations
    # --------------------------------------------------------------------------
    def get_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        return [
            n for n in PHASE3_DATA_STORE["notifications"]
            if n["recipient_id"] == user_id
        ]

    def mark_notification_read(self, notification_id: str, user_id: str) -> bool:
        for n in PHASE3_DATA_STORE["notifications"]:
            if n["id"] == notification_id and n["recipient_id"] == user_id:
                n["is_read"] = True
                return True
        return False

    def mark_all_notifications_read(self, user_id: str) -> int:
        count = 0
        for n in PHASE3_DATA_STORE["notifications"]:
            if n["recipient_id"] == user_id and not n["is_read"]:
                n["is_read"] = True
                count += 1
        return count


academician_repo = AcademicianRepository()
