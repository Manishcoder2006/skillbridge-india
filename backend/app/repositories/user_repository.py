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
        user_id = str(user_data.get("id") or uuid.uuid4())
        profile_record = {
            "id": user_id,
            "email": str(user_data["email"]).lower(),
            "full_name": user_data.get("full_name") or "User",
            "phone": user_data.get("phone"),
            "avatar_url": user_data.get("avatar_url"),
            "role": user_data.get("role", "student"),
            "institution_id": user_data.get("institution_id"),
            "department_id": user_data.get("department_id"),
            "company_id": user_data.get("company_id"),
            "verification_status": user_data.get("verification_status", "pending"),
            "is_active": True,
        }

        if db_manager.is_live and db_manager.client:
            try:
                res = db_manager.client.table("profiles").upsert(profile_record).execute()
                if res and res.data:
                    profile_record = res.data[0]
            except Exception as e:
                logger.warning(f"Live Supabase upsert profile failed: {e}. Storing in memory store.")

        # Always keep in-memory store synchronized for instant multi-student lookups
        existing_idx = None
        for i, p in enumerate(MOCK_DATA_STORE["profiles"]):
            if str(p["id"]) == user_id or p["email"].lower() == profile_record["email"].lower():
                existing_idx = i
                break

        if existing_idx is not None:
            MOCK_DATA_STORE["profiles"][existing_idx] = profile_record
        else:
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
                    safe_update = res.data[0]
            except Exception as e:
                logger.warning(f"Live Supabase update failed: {e}. Updating memory store.")

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
