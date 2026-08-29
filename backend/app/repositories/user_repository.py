import logging
import uuid
from typing import List, Optional, Dict, Any
from app.core.database import db_manager, MOCK_DATA_STORE

logger = logging.getLogger("skillbridge.repositories.user")

class UserRepository:
    def get_profile_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if db_manager.is_live and db_manager.client:
            try:
                res = (
                    db_manager.client.table("profiles")
                    .select("*")
                    .eq("id", user_id)
                    .single()
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Live Supabase get_profile_by_id failed: {e}. Falling back to dev store.")

        for p in MOCK_DATA_STORE["profiles"]:
            if str(p["id"]) == str(user_id):
                return p
        return None

    def get_profile_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if db_manager.is_live and db_manager.client:
            try:
                res = (
                    db_manager.client.table("profiles")
                    .select("*")
                    .eq("email", email.lower())
                    .single()
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Live Supabase get_profile_by_email failed: {e}. Falling back to dev store.")

        for p in MOCK_DATA_STORE["profiles"]:
            if p["email"].lower() == email.lower():
                return p
        return None

    def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = user_data.get("id") or str(uuid.uuid4())
        profile_record = {
            "id": user_id,
            "email": user_data["email"].lower(),
            "full_name": user_data["full_name"],
            "phone": user_data.get("phone"),
            "avatar_url": user_data.get("avatar_url"),
            "role": user_data["role"],
            "institution_id": user_data.get("institution_id"),
            "department_id": user_data.get("department_id"),
            "company_id": user_data.get("company_id"),
            "verification_status": user_data.get("verification_status", "pending"),
            "is_active": True,
        }

        if db_manager.is_live and db_manager.client:
            try:
                res = db_manager.client.table("profiles").insert(profile_record).execute()
                return res.data[0] if res.data else profile_record
            except Exception as e:
                logger.warning(f"Live Supabase insert profile failed: {e}. Falling back to dev store.")

        MOCK_DATA_STORE["profiles"].append(profile_record)
        return profile_record

    def update_profile_safe(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Security Rule 2: Strictly updates only safe fields.
        Role, institution_id, department_id, and verification_status are excluded.
        """
        allowed_keys = {"full_name", "phone", "avatar_url"}
        safe_update = {k: v for k, v in update_data.items() if k in allowed_keys and v is not None}

        if db_manager.is_live and db_manager.client:
            try:
                res = (
                    db_manager.client.table("profiles")
                    .update(safe_update)
                    .eq("id", user_id)
                    .execute()
                )
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Live Supabase update failed: {e}. Falling back to dev store.")

        for p in MOCK_DATA_STORE["profiles"]:
            if str(p["id"]) == str(user_id):
                p.update(safe_update)
                return p
        return None

    def get_institution_members(self, institution_id: str) -> List[Dict[str, Any]]:
        if db_manager.is_live and db_manager.client:
            try:
                res = (
                    db_manager.client.table("profiles")
                    .select("id, full_name, email, role, department_id, verification_status, is_active")
                    .eq("institution_id", institution_id)
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Live Supabase get_members failed: {e}. Falling back to dev store.")

        return [
            {
                "id": p["id"],
                "full_name": p["full_name"],
                "email": p["email"],
                "role": p["role"],
                "department_id": p.get("department_id"),
                "verification_status": p.get("verification_status"),
                "is_active": p.get("is_active"),
            }
            for p in MOCK_DATA_STORE["profiles"]
            if str(p.get("institution_id")) == str(institution_id)
        ]

user_repo = UserRepository()
