import os
import sys
from pathlib import Path

# Ensure backend and root directories are on sys.path regardless of execution context
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ROOT_DIR = _BACKEND_DIR.parent
for _dir_path in (str(_BACKEND_DIR), str(_ROOT_DIR)):
    if _dir_path not in sys.path:
        sys.path.insert(0, _dir_path)

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

from app.core.config import settings
from app.api.v1.api import api_router
from app.middleware.tenant import TenantContextMiddleware
from app.utils.logger import setup_logger

logger = setup_logger("skillbridge.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0 (Phase 1 Foundation)",
    description="Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Schedule daily cleanup for video tutor jobs (optional background scheduler)
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from app.core.cleanup import run_daily_cleanup

    scheduler = BackgroundScheduler()
    # Run at 02:00 UTC daily
    scheduler.add_job(run_daily_cleanup, "cron", hour=2, minute=0)

    def start_scheduler():
        scheduler.start()

    @app.on_event("startup")
    async def startup_event():
        start_scheduler()
except ImportError:
    # apscheduler not installed in current environment
    pass


# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$|^https:\/\/[a-zA-Z0-9_\.\-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Tenant Context & Security Headers Middleware
app.add_middleware(TenantContextMiddleware)

# 3. Mount API v1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# 4. Root Health Check Endpoint (Required by Specification)
@app.get("/health", tags=["Health"])
async def root_health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to SkillBridge India API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact system administrator."},
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("ENVIRONMENT", "development").lower() not in ("production", "prod")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=reload)
