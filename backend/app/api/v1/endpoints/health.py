from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import db_manager

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint returning system status and service health.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "connected" if db_manager.is_live else "development_mode",
        "version": "1.0.0 (Phase 1 Foundation)",
    }
