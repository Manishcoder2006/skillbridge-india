from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel

from app.core.security import require_roles, AuthenticatedUser
from app.models.enums import UserRole
from app.services.admin_service import admin_service

router = APIRouter(tags=["Super Admin Governance"])

class StatusUpdateRequest(BaseModel):
    status: str

# -----------------------------------------------------------------------------
# 1. Platform Overview Telemetry
# -----------------------------------------------------------------------------
@router.get("/overview", response_model=Dict[str, Any])
async def get_platform_overview(
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Returns platform-wide macro statistics and system metrics."""
    return admin_service.get_overview()

# -----------------------------------------------------------------------------
# 2. User Management
# -----------------------------------------------------------------------------
@router.get("/users", response_model=List[Dict[str, Any]])
async def list_all_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Returns full user registry with role and verification filter."""
    return admin_service.list_users(role=role, search=search)

@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: StatusUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Super Admin status toggle (verified, pending, suspended)."""
    updated = admin_service.set_user_status(user_id, payload.status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User status updated successfully", "user": updated}

# -----------------------------------------------------------------------------
# 3. Institution Multi-Tenant Governance
# -----------------------------------------------------------------------------
@router.get("/institutions", response_model=List[Dict[str, Any]])
async def list_all_institutions(
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Returns all registered academic institutions."""
    return admin_service.list_institutions()

# -----------------------------------------------------------------------------
# 4. Corporate & Industry Partners
# -----------------------------------------------------------------------------
@router.get("/companies", response_model=List[Dict[str, Any]])
async def list_all_companies(
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Returns all registered corporate partners."""
    return admin_service.list_companies()

@router.patch("/companies/{company_id}/status")
async def update_company_status(
    company_id: str,
    payload: StatusUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Super Admin company verification status toggle."""
    updated = admin_service.set_company_status(company_id, payload.status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return {"message": "Company status updated successfully", "company": updated}

# -----------------------------------------------------------------------------
# 5. Opportunity & Postings Oversight
# -----------------------------------------------------------------------------
@router.get("/opportunities", response_model=List[Dict[str, Any]])
async def list_all_opportunities(
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Returns all job & internship postings across all companies."""
    return admin_service.list_opportunities()

@router.patch("/opportunities/{opportunity_id}/status")
async def update_opportunity_status(
    opportunity_id: str,
    payload: StatusUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Super Admin opportunity moderation (active, paused, closed)."""
    updated = admin_service.set_opportunity_status(opportunity_id, payload.status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return {"message": "Opportunity status updated successfully", "opportunity": updated}

# -----------------------------------------------------------------------------
# 6. AI Multi-Model Telemetry & System Logs
# -----------------------------------------------------------------------------
@router.get("/ai-telemetry", response_model=Dict[str, Any])
async def get_ai_telemetry(
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Returns AI multi-model execution logs, latency averages, and model distributions."""
    return admin_service.get_ai_telemetry()

# -----------------------------------------------------------------------------
# 7. National Skill Mapping & Macro Analytics
# -----------------------------------------------------------------------------
@router.get("/national-skills", response_model=Dict[str, Any])
async def get_national_skill_analytics(
    current_user: AuthenticatedUser = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Returns national skill demand benchmarks and placement forecast."""
    return admin_service.get_national_skills()
