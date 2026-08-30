from typing import Dict, Any, List, Optional
from app.repositories.admin_repository import admin_repo

class AdminService:
    """Super Admin business logic service."""

    def get_overview(self) -> Dict[str, Any]:
        return admin_repo.get_platform_overview()

    def list_users(self, role: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        return admin_repo.get_all_users(role=role, search=search)

    def set_user_status(self, user_id: str, status: str) -> Optional[Dict[str, Any]]:
        return admin_repo.update_user_status(user_id, status)

    def list_institutions(self) -> List[Dict[str, Any]]:
        return admin_repo.get_all_institutions()

    def list_companies(self) -> List[Dict[str, Any]]:
        return admin_repo.get_all_companies()

    def set_company_status(self, company_id: str, status: str) -> Optional[Dict[str, Any]]:
        return admin_repo.update_company_status(company_id, status)

    def list_opportunities(self) -> List[Dict[str, Any]]:
        return admin_repo.get_all_opportunities()

    def set_opportunity_status(self, opportunity_id: str, status: str) -> Optional[Dict[str, Any]]:
        return admin_repo.update_opportunity_status(opportunity_id, status)

    def get_ai_telemetry(self) -> Dict[str, Any]:
        return admin_repo.get_ai_telemetry()

    def get_national_skills(self) -> Dict[str, Any]:
        return admin_repo.get_national_skill_analytics()


admin_service = AdminService()
