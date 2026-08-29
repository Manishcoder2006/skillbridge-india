from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from app.repositories.industry_repository import industry_repo

def _extract_hr_user(user: Any) -> tuple[str, str, str]:
    """Helper to safely extract user_id, email, and resolved company_id."""
    user_id = str(getattr(user, "id", None) or getattr(user, "sub", "") or "u1000000-0000-0000-0000-000000000003")
    email = str(getattr(user, "email", "hr@tcs.com"))
    company = industry_repo.get_company_for_user(user_id)
    company_id = company["id"] if company else "c1000000-0000-0000-0000-000000000001"
    return user_id, email, company_id


class IndustryService:
    """Service layer for Phase 4 Industry / HR operations."""

    def get_dashboard_summary(self, user: Any) -> Dict[str, Any]:
        user_id, _, company_id = _extract_hr_user(user)
        return industry_repo.get_dashboard_summary(company_id, user_id)

    def get_company_profile(self, user: Any) -> Dict[str, Any]:
        user_id, _, company_id = _extract_hr_user(user)
        profile = industry_repo.get_company_profile(company_id, user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found.")
        return profile

    def update_company_profile(self, user: Any, update_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id, _, company_id = _extract_hr_user(user)
        updated = industry_repo.update_company_profile(company_id, update_data)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found.")
        return industry_repo.get_company_profile(company_id, user_id)

    # --------------------------------------------------------------------------
    # Job & Internship Postings
    # --------------------------------------------------------------------------
    def get_postings(self, user: Any) -> List[Dict[str, Any]]:
        _, _, company_id = _extract_hr_user(user)
        return industry_repo.get_company_opportunities(company_id)

    def create_posting(self, user: Any, posting_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id, _, company_id = _extract_hr_user(user)
        return industry_repo.create_opportunity(company_id, user_id, posting_data)

    def update_posting(self, user: Any, posting_id: str, posting_data: Dict[str, Any]) -> Dict[str, Any]:
        _, _, company_id = _extract_hr_user(user)
        updated = industry_repo.update_opportunity(posting_id, company_id, posting_data)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Posting not found or unauthorized to edit.")
        return updated

    def delete_posting(self, user: Any, posting_id: str) -> Dict[str, bool]:
        _, _, company_id = _extract_hr_user(user)
        success = industry_repo.delete_opportunity(posting_id, company_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Posting not found or unauthorized to delete.")
        return {"success": True}

    # --------------------------------------------------------------------------
    # Candidates & Applications Management
    # --------------------------------------------------------------------------
    def get_applications(
        self,
        user: Any,
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        _, _, company_id = _extract_hr_user(user)
        return industry_repo.get_company_applications(company_id, status_filter, search_query)

    def update_application_status(
        self,
        user: Any,
        application_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        user_id, _, company_id = _extract_hr_user(user)
        updated = industry_repo.update_application_status(
            application_id=application_id,
            company_id=company_id,
            hr_user_id=user_id,
            new_status=update_data["status"],
            review_notes=update_data.get("review_notes"),
            interview_date=update_data.get("interview_scheduled_at"),
            interview_link=update_data.get("interview_link")
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or unauthorized.")
        return updated

    def get_candidate_profile(self, user: Any, student_id: str) -> Dict[str, Any]:
        _extract_hr_user(user)
        candidate = industry_repo.get_candidate_recruiter_profile(student_id)
        if not candidate:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate record not found.")
        return candidate

    # --------------------------------------------------------------------------
    # AI Candidate Matching Foundation
    # --------------------------------------------------------------------------
    def get_ai_candidate_matches(self, user: Any, opportunity_id: str) -> Dict[str, Any]:
        _, _, company_id = _extract_hr_user(user)
        matches = industry_repo.get_ai_candidate_matches(opportunity_id, company_id)
        if not matches:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target opportunity not found.")
        return matches

    # --------------------------------------------------------------------------
    # Collaboration & Analytics
    # --------------------------------------------------------------------------
    def get_collaboration_proposals(self, user: Any) -> List[Dict[str, Any]]:
        _, _, company_id = _extract_hr_user(user)
        return industry_repo.get_collaboration_proposals(company_id)

    def create_collaboration_proposal(self, user: Any, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id, _, company_id = _extract_hr_user(user)
        return industry_repo.create_collaboration_proposal(company_id, user_id, proposal_data)

    def get_analytics(self, user: Any) -> Dict[str, Any]:
        _, _, company_id = _extract_hr_user(user)
        return industry_repo.get_industry_analytics(company_id)


industry_service = IndustryService()
