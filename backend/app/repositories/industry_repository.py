import uuid
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.core.database import MOCK_DATA_STORE
from app.repositories.student_repository import student_repo, PHASE2_MOCK_STORE

logger = logging.getLogger("skillbridge.industry_repository")

# In-memory Mock Data Store for Phase 4 Industry/HR Ecosystem
PHASE4_DATA_STORE: Dict[str, Any] = {
    "companies": [
        {
            "id": "c1000000-0000-0000-0000-000000000001",
            "name": "Tata Consultancy Services",
            "code": "TCS",
            "industry_type": "Information Technology & Cloud Services",
            "website": "https://www.tcs.com",
            "logo_url": "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128",
            "description": "Tata Consultancy Services is an IT services, consulting and business solutions organization partnering with enterprises globally in their digital transformation.",
            "company_size": "100000+",
            "founded_year": 1968,
            "company_type": "mnc",
            "headquarters_city": "Mumbai",
            "headquarters_state": "Maharashtra",
            "contact_email": "careers@tcs.com",
            "contact_phone": "+91 22 6778 9999",
            "tech_stack": ["React", "Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Kubernetes"],
            "social_links": {
                "linkedin": "https://linkedin.com/company/tata-consultancy-services",
                "twitter": "https://twitter.com/TCS"
            },
            "verification_status": "verified",
            "is_active": True,
            "created_at": "2026-01-10T09:00:00Z",
            "updated_at": "2026-01-10T09:00:00Z"
        },
        {
            "id": "c1000000-0000-0000-0000-000000000002",
            "name": "Infosys Limited",
            "code": "INFOSYS",
            "industry_type": "Digital Services & Enterprise Consulting",
            "website": "https://www.infosys.com",
            "logo_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128",
            "description": "Infosys is a global leader in next-generation digital services and consulting enabling clients across 50+ countries to navigate their digital journey.",
            "company_size": "100000+",
            "founded_year": 1981,
            "company_type": "mnc",
            "headquarters_city": "Bengaluru",
            "headquarters_state": "Karnataka",
            "contact_email": "campus@infosys.com",
            "contact_phone": "+91 80 2852 0261",
            "tech_stack": ["Python", "Java", "Spring Boot", "React", "Azure", "Data Structures"],
            "social_links": {
                "linkedin": "https://linkedin.com/company/infosys"
            },
            "verification_status": "verified",
            "is_active": True,
            "created_at": "2026-01-12T10:00:00Z",
            "updated_at": "2026-01-12T10:00:00Z"
        },
        {
            "id": "c1000000-0000-0000-0000-000000000003",
            "name": "L&T Technology Services",
            "code": "LTTS",
            "industry_type": "Engineering R&D & Embedded Systems",
            "website": "https://www.ltts.com",
            "logo_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=128",
            "description": "L&T Technology Services (LTTS) is a global leader in Engineering and R&D services partnering with Fortune 500 enterprises.",
            "company_size": "20000-50000",
            "founded_year": 2012,
            "company_type": "enterprise",
            "headquarters_city": "Vadodara",
            "headquarters_state": "Gujarat",
            "contact_email": "hr@ltts.com",
            "contact_phone": "+91 265 670 5000",
            "tech_stack": ["C++", "Python", "Embedded Systems", "IoT", "Linux", "ROS"],
            "social_links": {},
            "verification_status": "verified",
            "is_active": True,
            "created_at": "2026-01-15T11:00:00Z",
            "updated_at": "2026-01-15T11:00:00Z"
        }
    ],
    "company_members": [
        {
            "id": "cm100000-0000-0000-0000-000000000001",
            "company_id": "c1000000-0000-0000-0000-000000000001",
            "user_id": "u1000000-0000-0000-0000-000000000003", # Priya Nair
            "designation": "Lead Technical Talent Partner",
            "department": "Campus & Academic Relations",
            "is_primary_contact": True,
            "is_active": True
        }
    ],
    "collaboration_proposals": [
        {
            "id": "cp-001",
            "company_id": "c1000000-0000-0000-0000-000000000001",
            "created_by_user_id": "u1000000-0000-0000-0000-000000000003",
            "title": "TCS Enterprise Cloud Architect Masterclass 2026",
            "initiative_type": "workshop",
            "target_domain": "Cloud Infrastructure & High-Concurrency APIs",
            "description": "5-day immersive hands-on workshop on enterprise microservices with FastAPI and Kubernetes.",
            "target_audience": "B.Tech CSE/IT Students (Sem 6 & 8) and Faculty",
            "slots_available": 100,
            "timeline": "Nov 2026",
            "contact_email": "cloudlabs@tcs.com",
            "is_active": True,
            "created_at": "2026-08-20T10:00:00Z"
        }
    ],
    "activity_log": [
        {
            "id": "act-1",
            "company_id": "c1000000-0000-0000-0000-000000000001",
            "title": "Application Shortlisted",
            "description": "Aarav Sharma was shortlisted for Software Engineer Intern (Full Stack)",
            "timestamp": "2026-08-28T14:30:00Z"
        },
        {
            "id": "act-2",
            "company_id": "c1000000-0000-0000-0000-000000000001",
            "title": "Job Posting Published",
            "description": "Software Engineer Intern (Full Stack) published to national portal",
            "timestamp": "2026-08-25T11:00:00Z"
        }
    ]
}


class IndustryRepository:
    """Repository layer for Phase 4 Industry / HR operations."""

    def get_company_for_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Resolve company associated with an HR recruiter user."""
        membership = next(
            (cm for cm in PHASE4_DATA_STORE["company_members"] if cm["user_id"] == user_id and cm["is_active"]),
            None
        )
        if not membership:
            # Fallback to TCS for standard demo HR user
            return PHASE4_DATA_STORE["companies"][0]

        company = next(
            (c for c in PHASE4_DATA_STORE["companies"] if c["id"] == membership["company_id"]),
            None
        )
        return company

    def get_company_profile(self, company_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        company = next((c for c in PHASE4_DATA_STORE["companies"] if c["id"] == company_id), None)
        if not company:
            return None

        membership = next(
            (cm for cm in PHASE4_DATA_STORE["company_members"] if cm["company_id"] == company_id and cm["user_id"] == user_id),
            None
        )

        user_profile = next((p for p in MOCK_DATA_STORE["profiles"] if p["id"] == user_id), {})

        res = {**company}
        res["hr_representative"] = {
            "full_name": user_profile.get("full_name", "Priya Nair"),
            "email": user_profile.get("email", "hr@tcs.com"),
            "designation": membership["designation"] if membership else "Technical Talent Acquisition Partner",
            "department": membership["department"] if membership else "Human Resources"
        }
        return res

    def update_company_profile(self, company_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        company = next((c for c in PHASE4_DATA_STORE["companies"] if c["id"] == company_id), None)
        if not company:
            return None

        # Safe update: ignore protected system fields
        allowed_keys = [
            "name", "industry_type", "website", "logo_url", "description",
            "company_size", "founded_year", "headquarters_city", "headquarters_state",
            "contact_email", "contact_phone", "tech_stack", "social_links"
        ]
        for k in allowed_keys:
            if k in update_data and update_data[k] is not None:
                company[k] = update_data[k]

        company["updated_at"] = datetime.now(timezone.utc).isoformat()
        return company

    # --------------------------------------------------------------------------
    # Job & Internship Posting Operations
    # --------------------------------------------------------------------------
    def get_company_opportunities(self, company_id: str) -> List[Dict[str, Any]]:
        opps = student_repo.get_opportunities()
        results = []
        for o in opps:
            item = o if isinstance(o, dict) else o.dict()
            if item.get("company_id") == company_id or company_id == "c1000000-0000-0000-0000-000000000001":
                # Calculate applications count for this posting
                apps = [a for a in PHASE2_MOCK_STORE["applications"] if a.get("opportunity_id") == item.get("id")]
                item_copy = {**item}
                item_copy["applications_count"] = len(apps)
                results.append(item_copy)
        return results

    def create_opportunity(self, company_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        company = next((c for c in PHASE4_DATA_STORE["companies"] if c["id"] == company_id), {})
        opp_id = f"g{uuid.uuid4().hex[:31]}"
        new_opp = {
            "id": opp_id,
            "company_id": company_id,
            "company_name": company.get("name", "Tata Consultancy Services"),
            "created_by_user_id": user_id,
            "title": data.get("title"),
            "type": data.get("type", "job"),
            "description": data.get("description", ""),
            "required_skills": data.get("required_skills", []),
            "preferred_skills": data.get("preferred_skills", []),
            "eligibility": data.get("eligibility", "Open to all engineering graduates"),
            "location": data.get("location", "Bengaluru / Pune"),
            "work_mode": data.get("work_mode", "hybrid"),
            "stipend_or_salary": data.get("stipend_or_salary", "₹8.0 - 12.0 LPA"),
            "openings_count": data.get("openings_count", 5),
            "application_deadline": data.get("application_deadline", "2026-12-31"),
            "status": data.get("status", "active"),
            "duration": data.get("duration"),
            "start_date": data.get("start_date"),
            "responsibilities": data.get("responsibilities", []),
            "learning_outcomes": data.get("learning_outcomes", []),
            "benefits": data.get("benefits", []),
            "is_active": data.get("status") != "closed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        # Add to student-accessible opportunities list
        PHASE2_MOCK_STORE["opportunities"].insert(0, new_opp)

        # Log activity
        PHASE4_DATA_STORE["activity_log"].insert(0, {
            "id": f"act-{uuid.uuid4().hex[:6]}",
            "company_id": company_id,
            "title": f"New {new_opp['type'].capitalize()} Posted",
            "description": f"Published '{new_opp['title']}' with {new_opp['openings_count']} openings.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return new_opp

    def update_opportunity(self, opp_id: str, company_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        opp = next((o for o in PHASE2_MOCK_STORE["opportunities"] if o["id"] == opp_id), None)
        if not opp:
            return None

        # Cross-company security check
        if opp.get("company_id") and opp.get("company_id") != company_id:
            return None

        for k, v in data.items():
            if v is not None:
                opp[k] = v

        if "status" in data:
            opp["is_active"] = (data["status"] != "closed")

        return opp

    def delete_opportunity(self, opp_id: str, company_id: str) -> bool:
        opp = next((o for o in PHASE2_MOCK_STORE["opportunities"] if o["id"] == opp_id), None)
        if not opp:
            return False

        if opp.get("company_id") and opp.get("company_id") != company_id:
            return False

        PHASE2_MOCK_STORE["opportunities"] = [o for o in PHASE2_MOCK_STORE["opportunities"] if o["id"] != opp_id]
        return True

    # --------------------------------------------------------------------------
    # Candidate & Application Management
    # --------------------------------------------------------------------------
    def get_company_applications(
        self,
        company_id: str,
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch candidate applications for postings owned by this company."""
        company_opps = self.get_company_opportunities(company_id)
        opp_map = {o["id"]: o for o in company_opps}

        results = []
        for app in PHASE2_MOCK_STORE["applications"]:
            opp_id = app.get("opportunity_id")
            if opp_id in opp_map:
                opp = opp_map[opp_id]
                student_id = app.get("student_id")
                student_profile = next((p for p in MOCK_DATA_STORE["profiles"] if p["id"] == student_id), {})
                student_skills = [s["skill_name"] for s in student_repo.get_student_skills(student_id)]

                # Calculate skill match score
                req_skills = opp.get("required_skills", [])
                match_count = sum(1 for s in req_skills if any(sk.lower() == s.lower() for sk in student_skills))
                match_percent = int((match_count / max(1, len(req_skills))) * 100)

                inst = next((i for i in MOCK_DATA_STORE["institutions"] if i["id"] == student_profile.get("institution_id")), {})
                dept = next((d for d in MOCK_DATA_STORE["departments"] if d["id"] == student_profile.get("department_id")), {})

                cand_item = {
                    "application_id": app["id"],
                    "student_id": student_id,
                    "candidate_name": student_profile.get("full_name", "Aarav Sharma"),
                    "candidate_email": student_profile.get("email", "student@iitd.ac.in"),
                    "candidate_cgpa": 8.9,
                    "candidate_institution": inst.get("name", "IIT Delhi"),
                    "candidate_department": dept.get("name", "Computer Science & Engineering"),
                    "candidate_semester": 6,
                    "opportunity_id": opp_id,
                    "opportunity_title": opp.get("title", app.get("opportunity_title")),
                    "opportunity_type": opp.get("type", "internship"),
                    "status": app.get("status", "applied"),
                    "notes": app.get("notes", ""),
                    "applied_at": app.get("applied_at", "2026-08-25T12:00:00Z"),
                    "verified_skills": student_skills,
                    "skill_match_percent": match_percent
                }

                # Filtering
                if status_filter and cand_item["status"] != status_filter:
                    continue
                if search_query:
                    q = search_query.lower()
                    if (
                        q not in cand_item["candidate_name"].lower()
                        and q not in cand_item["opportunity_title"].lower()
                        and not any(q in s.lower() for s in cand_item["verified_skills"])
                    ):
                        continue

                results.append(cand_item)
        return results

    def update_application_status(
        self,
        application_id: str,
        company_id: str,
        hr_user_id: str,
        new_status: str,
        review_notes: Optional[str] = None,
        interview_date: Optional[str] = None,
        interview_link: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        app = next((a for a in PHASE2_MOCK_STORE["applications"] if a["id"] == application_id), None)
        if not app:
            return None

        opp = next((o for o in PHASE2_MOCK_STORE["opportunities"] if o["id"] == app["opportunity_id"]), None)
        if not opp or (opp.get("company_id") and opp.get("company_id") != company_id):
            return None  # Forbidden cross-company edit

        prev_status = app.get("status", "applied")
        app["status"] = new_status
        app["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        if review_notes:
            app["hr_review_notes"] = review_notes
        if interview_date:
            app["interview_scheduled_at"] = interview_date
        if interview_link:
            app["interview_link"] = interview_link

        # Log activity
        PHASE4_DATA_STORE["activity_log"].insert(0, {
            "id": f"act-{uuid.uuid4().hex[:6]}",
            "company_id": company_id,
            "title": f"Candidate Status -> {new_status.replace('_', ' ').title()}",
            "description": f"Application for '{opp['title']}' updated to '{new_status}'.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return app

    def get_candidate_recruiter_profile(self, student_id: str) -> Optional[Dict[str, Any]]:
        profile = next((p for p in MOCK_DATA_STORE["profiles"] if p["id"] == student_id), None)
        if not profile:
            return None

        skills = student_repo.get_student_skills(student_id)
        full_p = student_repo.get_full_student_profile(student_id)
        resume = student_repo.get_student_resume(student_id)
        applications = [a for a in PHASE2_MOCK_STORE["applications"] if a["student_id"] == student_id]

        inst = next((i for i in MOCK_DATA_STORE["institutions"] if i["id"] == profile.get("institution_id")), {})
        dept = next((d for d in MOCK_DATA_STORE["departments"] if d["id"] == profile.get("department_id")), {})

        return {
            "student_id": student_id,
            "full_name": profile.get("full_name", "Aarav Sharma"),
            "email": profile.get("email", "student@iitd.ac.in"),
            "institution_name": inst.get("name", "IIT Delhi"),
            "department_name": dept.get("name", "Computer Science & Engineering"),
            "program": "B.Tech Computer Science & Engineering",
            "current_semester": 6,
            "cgpa": 8.9,
            "verified_skills": skills,
            "projects": full_p.get("projects", []) if isinstance(full_p, dict) else getattr(full_p, "projects", []),
            "certifications": full_p.get("certifications", []) if isinstance(full_p, dict) else getattr(full_p, "certifications", []),
            "resume_summary": resume,
            "applied_roles": applications
        }

    # --------------------------------------------------------------------------
    # AI Matching Engine Foundation (Rule-Based for Phase 4)
    # --------------------------------------------------------------------------
    def get_ai_candidate_matches(self, opportunity_id: str, company_id: str) -> Optional[Dict[str, Any]]:
        opp = next((o for o in PHASE2_MOCK_STORE["opportunities"] if o["id"] == opportunity_id), None)
        if not opp:
            return None

        required_skills = opp.get("required_skills", [])
        
        # Candidate pool: All student profiles
        student_profiles = [
            {
                "student_id": "u1000000-0000-0000-0000-000000000001",
                "name": "Aarav Sharma",
                "email": "aarav.sharma@iitd.ac.in",
                "institution": "IIT Delhi",
                "department": "Computer Science & Engineering",
                "cgpa": 8.9,
                "skills": ["React", "Python", "PostgreSQL", "FastAPI", "Docker"]
            },
            {
                "student_id": "u1000000-0000-0000-0000-000000000004",
                "name": "Diya Patel",
                "email": "diya.patel@iitd.ac.in",
                "institution": "IIT Delhi",
                "department": "Computer Science & Engineering",
                "cgpa": 9.2,
                "skills": ["Python", "Machine Learning", "FastAPI", "Data Structures"]
            },
            {
                "student_id": "u1000000-0000-0000-0000-000000000005",
                "name": "Rohan Gupta",
                "email": "rohan.gupta@iitd.ac.in",
                "institution": "IIT Delhi",
                "department": "Computer Science & Engineering",
                "cgpa": 7.8,
                "skills": ["React", "JavaScript", "HTML/CSS"]
            },
            {
                "student_id": "u1000000-0000-0000-0000-000000000006",
                "name": "Sneha Reddy",
                "email": "sneha.reddy@iitd.ac.in",
                "institution": "IIT Delhi",
                "department": "Computer Science & Engineering",
                "cgpa": 8.4,
                "skills": ["Java", "Spring Boot", "PostgreSQL", "Linux"]
            }
        ]

        matched_list = []
        for cand in student_profiles:
            cand_skills_lower = [s.lower() for s in cand["skills"]]
            matched_skills = [s for s in required_skills if s.lower() in cand_skills_lower]
            missing_skills = [s for s in required_skills if s.lower() not in cand_skills_lower]

            score = int((len(matched_skills) / max(1, len(required_skills))) * 100)

            tier = "High Match" if score >= 75 else "Moderate Match" if score >= 40 else "Low Match"
            action = "Fast-track to Interview" if score >= 75 else "Recommended for Skill Assessment" if score >= 40 else "Suggest Foundation Course"

            matched_list.append({
                "student_id": cand["student_id"],
                "candidate_name": cand["name"],
                "candidate_email": cand["email"],
                "institution": cand["institution"],
                "department": cand["department"],
                "cgpa": cand["cgpa"],
                "match_score": score,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "compatibility_tier": tier,
                "recommended_action": action
            })

        matched_list.sort(key=lambda x: x["match_score"], reverse=True)

        return {
            "opportunity_id": opportunity_id,
            "opportunity_title": opp.get("title", "Role"),
            "required_skills": required_skills,
            "total_evaluated_candidates": len(matched_list),
            "matched_candidates": matched_list,
            "ai_engine_status": "Phase 4 Rule-Based Foundation (Ready for Phase 5 Multi-Model LLM Engine)"
        }

    # --------------------------------------------------------------------------
    # Collaboration Proposals
    # --------------------------------------------------------------------------
    def get_collaboration_proposals(self, company_id: str) -> List[Dict[str, Any]]:
        return [cp for cp in PHASE4_DATA_STORE["collaboration_proposals"] if cp["company_id"] == company_id]

    def create_collaboration_proposal(self, company_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        prop = {
            "id": f"cp-{uuid.uuid4().hex[:6]}",
            "company_id": company_id,
            "created_by_user_id": user_id,
            "title": data["title"],
            "initiative_type": data.get("initiative_type", "workshop"),
            "target_domain": data["target_domain"],
            "description": data["description"],
            "target_audience": data.get("target_audience", "all_students_faculty"),
            "slots_available": data.get("slots_available", 50),
            "timeline": data.get("timeline", "Q4 2026"),
            "contact_email": data["contact_email"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        PHASE4_DATA_STORE["collaboration_proposals"].insert(0, prop)
        return prop

    # --------------------------------------------------------------------------
    # Analytics & Dashboard Summary
    # --------------------------------------------------------------------------
    def get_industry_analytics(self, company_id: str) -> Dict[str, Any]:
        company = next((c for c in PHASE4_DATA_STORE["companies"] if c["id"] == company_id), {})
        opps = self.get_company_opportunities(company_id)
        apps = self.get_company_applications(company_id)

        jobs_count = sum(1 for o in opps if o.get("type") == "job")
        internships_count = sum(1 for o in opps if o.get("type") == "internship")

        status_breakdown = {
            "applied": 0,
            "under_review": 0,
            "shortlisted": 0,
            "interview": 0,
            "selected": 0,
            "rejected": 0
        }
        for a in apps:
            st = a.get("status", "applied")
            if st in status_breakdown:
                status_breakdown[st] += 1

        skill_freq = {}
        for o in opps:
            for s in o.get("required_skills", []):
                skill_freq[s] = skill_freq.get(s, 0) + 1

        top_skills = [{"skill": k, "postings_requiring": v} for k, v in sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:5]]

        posting_performance = [
            {
                "title": o.get("title"),
                "type": o.get("type"),
                "applications_count": o.get("applications_count", 0),
                "openings": o.get("openings_count", 5),
                "status": o.get("status", "active")
            }
            for o in opps
        ]

        return {
            "company_name": company.get("name", "Tata Consultancy Services"),
            "total_job_postings": jobs_count,
            "total_internship_postings": internships_count,
            "total_applications_received": len(apps),
            "status_breakdown": status_breakdown,
            "top_in_demand_skills": top_skills,
            "recruitment_funnel": {
                "total_applied": len(apps),
                "under_review": status_breakdown["under_review"],
                "shortlisted": status_breakdown["shortlisted"],
                "interviewed": status_breakdown["interview"],
                "offered_or_selected": status_breakdown["selected"]
            },
            "posting_performance": posting_performance
        }

    def get_dashboard_summary(self, company_id: str, user_id: str) -> Dict[str, Any]:
        company_profile = self.get_company_profile(company_id, user_id)
        opps = self.get_company_opportunities(company_id)
        apps = self.get_company_applications(company_id)

        active_jobs = sum(1 for o in opps if o.get("type") == "job" and o.get("status") == "active")
        active_internships = sum(1 for o in opps if o.get("type") == "internship" and o.get("status") == "active")

        awaiting = sum(1 for a in apps if a.get("status") in ["applied", "under_review"])
        shortlisted = sum(1 for a in apps if a.get("status") == "shortlisted")
        interviews = sum(1 for a in apps if a.get("status") == "interview")
        selected = sum(1 for a in apps if a.get("status") == "selected")

        return {
            "company": company_profile,
            "active_jobs": active_jobs,
            "active_internships": active_internships,
            "total_applications": len(apps),
            "awaiting_review": awaiting,
            "shortlisted_candidates": shortlisted,
            "interviews_scheduled": interviews,
            "selected_candidates": selected,
            "recent_applications": apps[:5],
            "recent_postings": opps[:5],
            "recruitment_activity": PHASE4_DATA_STORE["activity_log"][:5]
        }


industry_repo = IndustryRepository()
