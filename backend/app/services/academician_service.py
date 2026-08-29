from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.repositories.academician_repository import academician_repo
from app.repositories.student_repository import student_repo

def _extract_user_fields(user: Any):
    user_id = getattr(user, "id", None) or (user.get("id") if isinstance(user, dict) else str(user))
    inst_id = getattr(user, "institution_id", None) or (user.get("institution_id") if isinstance(user, dict) else "a1000000-0000-0000-0000-000000000001")
    dept_id = getattr(user, "department_id", None) or (user.get("department_id") if isinstance(user, dict) else "b1000000-0000-0000-0000-000000000001")
    full_name = getattr(user, "full_name", None) or (user.get("full_name") if isinstance(user, dict) else "Dr. Rajesh Kumar")
    return user_id, inst_id, dept_id, full_name

class AcademicianService:
    """Service layer for Academician / Faculty operations."""

    def get_dashboard_summary(self, user: Any) -> Dict[str, Any]:
        user_id, inst_id, dept_id, full_name = _extract_user_fields(user)

        students = academician_repo.get_authorized_students(inst_id, dept_id)
        total_students = len(students)
        attention_students = [s for s in students if s["needs_attention"]]

        completed_assessments = sum(1 for s in students if s["assessment_status"] == "completed")
        rate = round((completed_assessments / total_students * 100), 1) if total_students > 0 else 0.0

        content = academician_repo.get_faculty_content(user_id, inst_id, dept_id)
        recs = academician_repo.get_recommendations(dept_id)
        collabs = academician_repo.get_collaboration_initiatives(user_id)
        notifs = academician_repo.get_notifications(user_id)
        unread_notifs = sum(1 for n in notifs if not n["is_read"])

        activities = [
            {"title": "Assessment Submitted", "desc": "Aarav Sharma completed Web Dev Readiness with 80% score.", "time": "2 hours ago", "type": "assessment"},
            {"title": "Resource Created", "desc": "You published 'High-Concurrency Database Architecture & RLS'.", "time": "1 day ago", "type": "content"},
            {"title": "Opportunity Shared", "desc": "Recommended 'TCS Full Stack Developer Intern' to CSE cohort.", "time": "2 days ago", "type": "opportunity"}
        ]

        return {
            "total_authorized_students": total_students,
            "students_needing_attention_count": len(attention_students),
            "assessment_completion_rate": rate,
            "active_learning_resources_count": len(content),
            "active_recommendations_count": len(recs),
            "open_collaborations_count": len([c for c in collabs if c["status"] == "open"]),
            "unread_notifications_count": unread_notifs,
            "students_needing_attention": attention_students,
            "recent_student_activities": activities,
            "recent_notifications": notifs[:4]
        }

    def get_profile(self, user: Any) -> Dict[str, Any]:
        user_id, _, _, _ = _extract_user_fields(user)
        profile = academician_repo.get_full_profile(user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Academician profile not found.")
        return profile

    def update_profile(self, user: Any, update_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id, _, _, _ = _extract_user_fields(user)
        profile = academician_repo.update_profile(user_id, update_data)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update profile.")
        return profile

    def get_students(
        self,
        user: Any,
        search: Optional[str] = None,
        semester: Optional[int] = None,
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        _, inst_id, dept_id, _ = _extract_user_fields(user)
        return academician_repo.get_authorized_students(inst_id, dept_id, search, semester, status_filter)

    def get_student_detail(self, user: Any, student_id: str) -> Dict[str, Any]:
        _, inst_id, dept_id, _ = _extract_user_fields(user)

        detail = academician_repo.get_student_detail(student_id, inst_id, dept_id)
        if not detail:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You are not authorized to view this student's profile across institution or department boundaries."
            )
        return detail

    def get_analytics(self, user: Any) -> Dict[str, Any]:
        _, inst_id, dept_id, _ = _extract_user_fields(user)
        return academician_repo.get_student_analytics(inst_id, dept_id)

    def get_content(self, user: Any) -> List[Dict[str, Any]]:
        user_id, inst_id, dept_id, _ = _extract_user_fields(user)
        return academician_repo.get_faculty_content(user_id, inst_id, dept_id)

    def create_content(self, user: Any, data: Dict[str, Any]) -> Dict[str, Any]:
        user_id, inst_id, dept_id, full_name = _extract_user_fields(user)
        return academician_repo.create_faculty_content(
            user_id,
            full_name,
            inst_id,
            dept_id,
            data
        )

    def update_content(self, user: Any, content_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        user_id, _, _, _ = _extract_user_fields(user)
        updated = academician_repo.update_faculty_content(content_id, user_id, data)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found or unauthorized to edit.")
        return updated

    def delete_content(self, user: Any, content_id: str) -> Dict[str, bool]:
        user_id, _, _, _ = _extract_user_fields(user)
        success = academician_repo.delete_faculty_content(content_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found or unauthorized to delete.")
        return {"success": True}

    def get_opportunities(self, user: Any) -> List[Dict[str, Any]]:
        opps = student_repo.get_opportunities()
        _, _, dept_id, _ = _extract_user_fields(user)
        recs = academician_repo.get_recommendations(dept_id)
        recommended_ids = {r["opportunity_id"]: r["message"] for r in recs}

        results = []
        for o in opps:
            item = o if isinstance(o, dict) else o.dict()
            opp_id = item.get("id")
            item["is_recommended"] = opp_id in recommended_ids
            item["recommendation_message"] = recommended_ids.get(opp_id)
            results.append(item)
        return results

    def recommend_opportunity(self, user: Any, opportunity_id: str, message: str) -> Dict[str, Any]:
        user_id, inst_id, dept_id, full_name = _extract_user_fields(user)
        rec = academician_repo.create_recommendation(
            user_id,
            full_name,
            opportunity_id,
            inst_id,
            dept_id,
            message
        )
        if not rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")
        return rec

    def get_collaborations(self, user: Any) -> List[Dict[str, Any]]:
        user_id, _, _, _ = _extract_user_fields(user)
        return academician_repo.get_collaboration_initiatives(user_id)

    def participate_collaboration(self, user: Any, initiative_id: str, interest_note: str) -> Dict[str, Any]:
        user_id, _, _, _ = _extract_user_fields(user)
        part = academician_repo.participate_in_collaboration(user_id, initiative_id, interest_note)
        if not part:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration initiative not found.")
        return part

    def get_notifications(self, user: Any) -> List[Dict[str, Any]]:
        user_id, _, _, _ = _extract_user_fields(user)
        return academician_repo.get_notifications(user_id)

    def mark_notification_read(self, user: Any, notification_id: str) -> Dict[str, bool]:
        user_id, _, _, _ = _extract_user_fields(user)
        success = academician_repo.mark_notification_read(notification_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
        return {"success": True}

    def mark_all_notifications_read(self, user: Any) -> Dict[str, int]:
        user_id, _, _, _ = _extract_user_fields(user)
        count = academician_repo.mark_all_notifications_read(user_id)
        return {"marked_count": count}


academician_service = AcademicianService()
