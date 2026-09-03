import logging
from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import require_roles
from app.models.enums import UserRole
from app.schemas.learning import (
    LearningPathRequest,
    LearningPathResponse,
    AskTutorRequest,
    AskTutorResponse,
    LessonProgressUpdateRequest,
)
from app.services.ai.micro_tutor_service import micro_tutor_service
from app.repositories.micro_learning_repository import micro_learning_repo

logger = logging.getLogger("skillbridge.endpoints.learning")

router = APIRouter(tags=["AI Micro-Learning Tutor"])

@router.post("/ai/path", response_model=LearningPathResponse, status_code=status.HTTP_201_CREATED)
async def generate_micro_learning_path(
    payload: LearningPathRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Generates a structured micro-learning path (6-8 short 30-120 second lessons)
    with spoken scripts, synchronized bullet points, code snippets, and diagrams.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    try:
        return await micro_tutor_service.generate_learning_path(user_id=user_id, payload=payload)
    except Exception as e:
        logger.error(f"Failed to generate learning path: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning path: {str(e)}"
        )


@router.get("/ai/paths", response_model=List[Dict[str, Any]])
async def get_user_learning_paths(
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Returns candidate's past and active AI micro-learning paths and completion progress."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return micro_learning_repo.get_user_paths(user_id)


@router.get("/ai/path/{path_id}", response_model=Dict[str, Any])
async def get_learning_path_by_id(
    path_id: str,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Retrieves full lesson details for a specific micro-learning path."""
    path = micro_learning_repo.get_path(path_id)
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Micro-learning path not found."
        )
    return path


@router.post("/ai/ask", response_model=AskTutorResponse)
async def ask_contextual_tutor(
    payload: AskTutorRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Answers a student's contextual question about the current lesson.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    try:
        return await micro_tutor_service.answer_contextual_question(user_id=user_id, payload=payload)
    except Exception as e:
        logger.error(f"Failed to answer contextual tutor question: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tutor Q&A failed: {str(e)}"
        )


@router.post("/ai/progress", response_model=Dict[str, Any])
async def update_lesson_progress(
    payload: LessonProgressUpdateRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Updates the completion status of a specific lesson in a learning path."""
    updated = micro_learning_repo.update_lesson_progress(
        path_id=payload.path_id,
        lesson_number=payload.lesson_number,
        is_completed=payload.is_completed
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Micro-learning path not found."
        )
    return {"status": "success", "lesson_number": payload.lesson_number, "is_completed": payload.is_completed}
