from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.repositories.institution_repository import institution_repo
from app.schemas.institution import DepartmentCreateRequest

class InstitutionService:
    def list_public_institutions(self) -> List[Dict[str, Any]]:
        return institution_repo.get_public_institutions()

    def get_public_departments(self, institution_id: str) -> List[Dict[str, Any]]:
        return institution_repo.get_departments_for_institution(institution_id)

    def get_institution_details(self, institution_id: str) -> Dict[str, Any]:
        inst = institution_repo.get_institution_by_id(institution_id)
        if not inst:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found.",
            )
        return inst

    def add_department(self, institution_id: str, payload: DepartmentCreateRequest) -> Dict[str, Any]:
        inst = institution_repo.get_institution_by_id(institution_id)
        if not inst:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found.",
            )
        return institution_repo.create_department(institution_id, payload.model_dump())

institution_service = InstitutionService()
