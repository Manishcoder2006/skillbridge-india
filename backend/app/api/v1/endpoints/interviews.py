from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import require_roles, get_current_user, AuthenticatedUser
from app.models.enums import UserRole
from app.services.ai.orchestrator import ai_orchestrator
from app.repositories.interview_repository import interview_repo
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewResponse,
    AnswerSubmitRequest,
    AnswerEvaluationResponse,
    FinalPerformanceReportResponse,
    InterviewHistoryItem,
)

router = APIRouter(tags=["AI Interview Simulator"])

@router.post("/start", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def start_interview(
    payload: InterviewStartRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Starts an AI Interview session (Technical, HR, or Custom).
    Generates tailored questions dynamically based on role, skills, and optional verified resume.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    try:
        return await ai_orchestrator.start_interview_session(user_id=user_id, payload=payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI interview: {str(e)}"
        )


@router.get("/history", response_model=List[InterviewHistoryItem])
async def get_interview_history(
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Returns candidate's past AI interview sessions and performance scores."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    return interview_repo.get_user_history(user_id)


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview_session(
    interview_id: str,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Retrieves an active or completed interview session."""
    session = interview_repo.get_session(interview_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )
    return session


@router.post("/{interview_id}/answer", response_model=AnswerEvaluationResponse)
async def submit_interview_answer(
    interview_id: str,
    payload: AnswerSubmitRequest,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Submits a candidate's response to an interview question.
    Returns real-time AI scoring, identified strengths, and constructive improvements.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    try:
        return await ai_orchestrator.evaluate_interview_answer(
            user_id=user_id,
            interview_id=interview_id,
            question_id=payload.question_id,
            answer_text=payload.answer_text
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Answer evaluation failed: {str(e)}"
        )


@router.post("/{interview_id}/complete", response_model=FinalPerformanceReportResponse)
async def complete_interview(
    interview_id: str,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Completes an interview session and synthesizes the full multi-dimensional performance report.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    try:
        return await ai_orchestrator.complete_interview_session(
            user_id=user_id,
            interview_id=interview_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate final interview performance report: {str(e)}"
        )


@router.get("/{interview_id}/report", response_model=FinalPerformanceReportResponse)
async def get_interview_report(
    interview_id: str,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Retrieves an existing final performance report for a completed session."""
    report = interview_repo.get_report(interview_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found for this interview session."
        )
    return report
