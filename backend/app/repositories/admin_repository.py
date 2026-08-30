from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import MOCK_DATA_STORE
from app.repositories.user_repository import user_repo
from app.repositories.institution_repository import institution_repo
from app.repositories.industry_repository import industry_repo, PHASE4_DATA_STORE
from app.repositories.student_repository import student_repo, PHASE2_MOCK_STORE
from app.repositories.academician_repository import academician_repo, PHASE3_DATA_STORE
from app.services.ai.orchestrator import AI_REQUEST_LOGS_STORE

ADMIN_AUDIT_LOGS_STORE: List[Dict[str, Any]] = [
    {
        "id": "log-001",
        "actor_name": "Dr. Vinod Mishra (Super Admin)",
        "action_type": "institution_verified",
        "target_name": "IIT Delhi (Indian Institute of Technology Delhi)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "success"
    },
    {
        "id": "log-002",
        "actor_name": "Dr. Vinod Mishra (Super Admin)",
        "action_type": "company_verified",
        "target_name": "Tata Consultancy Services (TCS)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "success"
    },
    {
        "id": "log-003",
        "actor_name": "System Security Service",
        "action_type": "multi_tenant_isolation_check",
        "target_name": "PostgreSQL RLS Multi-Tenant Policies",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "passed"
    }
]

class AdminRepository:
    """Super Admin Repository for platform-level multi-tenant management."""

    def get_platform_overview(self) -> Dict[str, Any]:
        users = MOCK_DATA_STORE["profiles"]
        students = [u for u in users if u.get("role") == "student"]
        academicians = [u for u in users if u.get("role") == "academician"]
        industry_hrs = [u for u in users if u.get("role") == "industry_hr"]
        institutions = institution_repo.get_public_institutions()
        companies = PHASE4_DATA_STORE.get("companies", [])
        postings = PHASE2_MOCK_STORE.get("opportunities", [])
        active_postings = [p for p in postings if p.get("status") == "active"]

        return {
            "total_users": len(users),
            "total_students": len(students),
            "total_academicians": len(academicians),
            "total_industry_hr": len(industry_hrs),
            "total_institutions": len(institutions),
            "total_companies": len(companies),
            "total_opportunities": len(postings),
            "active_opportunities": len(active_postings),
            "ai_requests_processed": len(AI_REQUEST_LOGS_STORE) + 142,
            "platform_health": "Operational",
            "rls_isolation_status": "Active (Enforced)",
            "ai_models_status": {
                "gemini": "active (gemini-1.5-flash)",
                "groq": "active (llama-3.3-70b-versatile)",
                "orchestrator": "active"
            }
        }

    def get_all_users(self, role: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        users = MOCK_DATA_STORE["profiles"]
        result = []
        for u in users:
            if role and role != "all" and u.get("role") != role:
                continue
            if search:
                s = search.lower()
                name = u.get("full_name", "").lower()
                email = u.get("email", "").lower()
                if s not in name and s not in email:
                    continue
            safe_user = {
                "id": u.get("id"),
                "email": u.get("email"),
                "full_name": u.get("full_name"),
                "role": u.get("role"),
                "institution_id": u.get("institution_id"),
                "institution_name": "IIT Delhi" if u.get("institution_id") == "a1000000-0000-0000-0000-000000000001" else "External",
                "verification_status": u.get("verification_status", "verified"),
                "created_at": u.get("created_at", datetime.now(timezone.utc).isoformat())
            }
            result.append(safe_user)
        return result

    def update_user_status(self, user_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        user = next((p for p in MOCK_DATA_STORE["profiles"] if str(p["id"]) == str(user_id)), None)
        if not user:
            return None
        user["verification_status"] = new_status
        ADMIN_AUDIT_LOGS_STORE.insert(0, {
            "id": f"log-{len(ADMIN_AUDIT_LOGS_STORE) + 1}",
            "actor_name": "Super Admin",
            "action_type": "user_status_update",
            "target_name": f"{user.get('full_name')} ({new_status})",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "success"
        })
        return user

    def get_all_institutions(self) -> List[Dict[str, Any]]:
        insts = institution_repo.get_public_institutions()
        return [
            {
                "id": i.get("id"),
                "name": i.get("name"),
                "code": i.get("code"),
                "type": i.get("type"),
                "state": i.get("state"),
                "status": "verified",
                "total_students": 1280 if i.get("code") == "IITD" else 950,
                "total_faculty": 94 if i.get("code") == "IITD" else 76
            }
            for i in insts
        ]

    def get_all_companies(self) -> List[Dict[str, Any]]:
        companies = PHASE4_DATA_STORE.get("companies", [])
        return companies

    def update_company_status(self, company_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        comp = next((c for c in PHASE4_DATA_STORE.get("companies", []) if c["id"] == company_id), None)
        if comp:
            comp["verification_status"] = new_status
            ADMIN_AUDIT_LOGS_STORE.insert(0, {
                "id": f"log-{len(ADMIN_AUDIT_LOGS_STORE) + 1}",
                "actor_name": "Super Admin",
                "action_type": "company_status_update",
                "target_name": f"{comp.get('name')} ({new_status})",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            })
            return comp
        return None

    def get_all_opportunities(self) -> List[Dict[str, Any]]:
        postings = PHASE2_MOCK_STORE.get("opportunities", [])
        return postings

    def update_opportunity_status(self, posting_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        posting = next((p for p in PHASE2_MOCK_STORE.get("opportunities", []) if p["id"] == posting_id), None)
        if posting:
            posting["status"] = new_status
            ADMIN_AUDIT_LOGS_STORE.insert(0, {
                "id": f"log-{len(ADMIN_AUDIT_LOGS_STORE) + 1}",
                "actor_name": "Super Admin",
                "action_type": "posting_moderation",
                "target_name": f"{posting.get('title')} ({new_status})",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            })
            return posting
        return None

    def get_ai_telemetry(self) -> Dict[str, Any]:
        logs = AI_REQUEST_LOGS_STORE
        total_requests = len(logs) + 142
        gemini_count = sum(1 for l in logs if "gemini" in l.get("primary_model", "").lower()) + 94
        groq_count = sum(1 for l in logs if "groq" in l.get("primary_model", "").lower() or "llama" in l.get("primary_model", "").lower()) + 48
        hybrid_count = sum(1 for l in logs if l.get("routing_strategy") == "hybrid_synthesis") + 28
        avg_latency = int(sum(l.get("latency_ms", 120) for l in logs) / max(len(logs), 1)) if logs else 115

        return {
            "total_requests": total_requests,
            "model_distribution": {
                "Google Gemini 1.5": gemini_count,
                "Groq LPU (Llama 3.3)": groq_count,
                "Multi-Model Hybrid Synthesis": hybrid_count
            },
            "average_latency_ms": avg_latency,
            "estimated_tokens_consumed": total_requests * 650,
            "recent_execution_logs": logs[:15],
            "providers_status": {
                "Google Gemini": "Healthy (REST API)",
                "Groq Cloud": "Healthy (OpenAI-compatible LPU)",
                "Orchestrator Fallback Engine": "Armed & Ready"
            }
        }

    def get_national_skill_analytics(self) -> Dict[str, Any]:
        return {
            "top_industry_demanded_skills": [
                {"skill": "React 18 & Frontend Architecture", "demand_score": 95, "student_proficiency": 78, "gap": "Moderate"},
                {"skill": "Python & FastAPI Microservices", "demand_score": 92, "student_proficiency": 72, "gap": "Moderate"},
                {"skill": "Docker & Container Orchestration", "demand_score": 88, "student_proficiency": 42, "gap": "Critical"},
                {"skill": "PostgreSQL Multi-Tenant RLS", "demand_score": 85, "student_proficiency": 54, "gap": "Moderate"},
                {"skill": "Google Gemini / LLM Integration", "demand_score": 90, "student_proficiency": 48, "gap": "Critical"},
                {"skill": "Cloud Infrastructure (AWS/Azure)", "demand_score": 86, "student_proficiency": 45, "gap": "Critical"}
            ],
            "macro_readiness_tiers": {
                "Tier 1 (High Match >= 75%)": "44%",
                "Tier 2 (Moderate Match 40-74%)": "42%",
                "Tier 3 (Emerging Match < 40%)": "14%"
            },
            "projected_campus_placement_rate": "86.4%",
            "audit_logs": ADMIN_AUDIT_LOGS_STORE
        }


admin_repo = AdminRepository()
