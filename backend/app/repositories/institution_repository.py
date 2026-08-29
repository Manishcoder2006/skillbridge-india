import logging
import uuid
from typing import List, Optional, Dict, Any
from app.core.database import db_manager, MOCK_DATA_STORE

logger = logging.getLogger("skillbridge.repositories.institution")

class InstitutionRepository:
    def get_public_institutions(self) -> List[Dict[str, Any]]:
        """
        Fetches verified institutions with safe public department information.
        Falls back to local development store if remote connection is unavailable.
        """
        if db_manager.is_live and db_manager.client:
            try:
                res = (
                    db_manager.client.table("institutions")
                    .select("id, name, code, type, city, state")
                    .eq("is_active", True)
                    .eq("verification_status", "verified")
                    .execute()
                )
                institutions = res.data or []
                for inst in institutions:
                    dept_res = (
                        db_manager.client.table("departments")
                        .select("id, name, code")
                        .eq("institution_id", inst["id"])
                        .eq("is_active", True)
                        .execute()
                    )
                    inst["departments"] = dept_res.data or []
                if institutions:
                    return institutions
            except Exception as e:
                logger.warning(f"Live Supabase query failed: {e}. Falling back to dev store.")

        # Fallback to dev store
        result = []
        for inst in MOCK_DATA_STORE["institutions"]:
            if inst.get("is_active") and inst.get("verification_status") == "verified":
                depts = [
                    {"id": d["id"], "name": d["name"], "code": d["code"]}
                    for d in MOCK_DATA_STORE["departments"]
                    if str(d.get("institution_id")) == str(inst.get("id")) and d.get("is_active")
                ]
                result.append({
                    "id": inst["id"],
                    "name": inst["name"],
                    "code": inst["code"],
                    "type": inst["type"],
                    "city": inst.get("city"),
                    "state": inst.get("state"),
                    "departments": depts,
                })
        return result

    def get_departments_for_institution(self, institution_id: str) -> List[Dict[str, Any]]:
        if db_manager.is_live and db_manager.client:
            try:
                res = (
                    db_manager.client.table("departments")
                    .select("id, name, code")
                    .eq("institution_id", institution_id)
                    .eq("is_active", True)
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Live Supabase query failed: {e}. Falling back to dev store.")

        return [
            {"id": d["id"], "name": d["name"], "code": d["code"]}
            for d in MOCK_DATA_STORE["departments"]
            if str(d.get("institution_id")) == str(institution_id) and d.get("is_active")
        ]

    def get_institution_by_id(self, institution_id: str) -> Optional[Dict[str, Any]]:
        if db_manager.is_live and db_manager.client:
            try:
                res = (
                    db_manager.client.table("institutions")
                    .select("*")
                    .eq("id", institution_id)
                    .single()
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Live Supabase query failed: {e}. Falling back to dev store.")

        for inst in MOCK_DATA_STORE["institutions"]:
            if str(inst["id"]) == str(institution_id):
                return inst
        return None

    def create_department(self, institution_id: str, dept_data: Dict[str, Any]) -> Dict[str, Any]:
        new_dept = {
            "id": str(uuid.uuid4()),
            "institution_id": str(institution_id),
            "name": dept_data["name"],
            "code": dept_data["code"],
            "description": dept_data.get("description", ""),
            "is_active": True,
        }
        if db_manager.is_live and db_manager.client:
            try:
                res = db_manager.client.table("departments").insert(new_dept).execute()
                return res.data[0] if res.data else new_dept
            except Exception as e:
                logger.warning(f"Live Supabase insert failed: {e}. Falling back to dev store.")

        MOCK_DATA_STORE["departments"].append(new_dept)
        return new_dept

institution_repo = InstitutionRepository()
