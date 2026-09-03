from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, institutions, users, student, academician, industry, ai, admin, interviews, learning

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(institutions.router, prefix="/institutions")
api_router.include_router(users.router, prefix="/users")
api_router.include_router(student.router, prefix="/student")
api_router.include_router(academician.router, prefix="/academician")
api_router.include_router(industry.router, prefix="/industry")
api_router.include_router(ai.router, prefix="/ai")
api_router.include_router(admin.router, prefix="/admin")
api_router.include_router(interviews.router, prefix="/interviews")
api_router.include_router(learning.router, prefix="/learning")
