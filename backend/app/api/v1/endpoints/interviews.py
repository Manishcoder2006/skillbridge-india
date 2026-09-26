from typing import Any, List, Dict, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.core.security import require_roles, get_current_user, AuthenticatedUser
from app.models.enums import UserRole
from app.services.ai.orchestrator import ai_orchestrator
from app.repositories.interview_repository import interview_repo
from app.repositories.student_repository import student_repo
from app.services.ai.resume_parser_service import resume_parser_service
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewResponse,
    InterviewQuestion,
    AnswerSubmitRequest,
    AnswerEvaluationResponse,
    FinalPerformanceReportResponse,
    InterviewHistoryItem,
    ResumeUploadResponse,
)

router = APIRouter(tags=["AI Interview Simulator"])

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_interview_resume(
    file: UploadFile = File(...),
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Uploads and parses a PDF or DOCX resume for personalized AI interview generation.
    Validates file integrity, extracts text, skills, projects, and work experience,
    associating them strictly with the authenticated student's profile.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    file_bytes = await file.read()
    filename = file.filename or "resume.pdf"

    parsed = resume_parser_service.parse_resume_bytes(file_bytes=file_bytes, filename=filename)

    existing = student_repo.get_student_resume(user_id)
    existing_data = existing.get("data", {}) if isinstance(existing, dict) else {}

    # Merge extracted skills with existing profile skills (avoid duplicates)
    merged_skills = list(dict.fromkeys(existing_data.get("skills", []) + parsed.get("skills", [])))

    updated_resume_data = {
        **existing_data,
        "headline": parsed.get("headline") or existing_data.get("headline", ""),
        "summary": parsed.get("summary") or existing_data.get("summary", ""),
        "skills": merged_skills,
        "projects": parsed.get("projects") or existing_data.get("projects", []),
        "experience": parsed.get("experience") or existing_data.get("experience", []),
        "raw_text": parsed.get("raw_text", ""),
        "uploaded_file": {
            "filename": parsed["filename"],
            "file_type": parsed["file_type"],
            "file_size": parsed["file_size"],
            "file_size_formatted": parsed["file_size_formatted"],
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
    }
    student_repo.update_student_resume(user_id, updated_resume_data)

    return ResumeUploadResponse(
        success=True,
        filename=parsed["filename"],
        file_type=parsed["file_type"],
        file_size=parsed["file_size"],
        file_size_formatted=parsed["file_size_formatted"],
        headline=parsed["headline"],
        summary=parsed["summary"],
        extracted_skills=parsed["skills"],
        projects_count=len(parsed["projects"]),
        experience_count=len(parsed["experience"]),
        raw_text_preview=parsed["raw_text"][:250],
        message="Resume uploaded and analyzed successfully."
    )


@router.get("/resume-status")
async def get_interview_resume_status(
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Returns the currently active uploaded resume or profile resume status for the student.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    resume = student_repo.get_student_resume(user_id)
    data = (resume.get("data") or {}) if isinstance(resume, dict) else {}
    uploaded = data.get("uploaded_file")
    has_resume = bool(uploaded or data.get("raw_text") or (data.get("skills") and len(data["skills"]) > 0))
    return {
        "has_resume": has_resume,
        "uploaded_file": uploaded,
        "headline": data.get("headline", ""),
        "skills": data.get("skills", []),
        "projects": data.get("projects", []),
        "skills_count": len(data.get("skills", [])),
        "projects_count": len(data.get("projects", [])),
        "experience_count": len(data.get("experience", []))
    }


@router.delete("/resume")
async def remove_interview_resume(
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """Removes the uploaded resume from the student session."""
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    resume = student_repo.get_student_resume(user_id)
    if isinstance(resume, dict) and "data" in resume:
        resume["data"]["uploaded_file"] = None
        resume["data"]["raw_text"] = ""
        student_repo.update_student_resume(user_id, resume["data"])
    return {"success": True, "message": "Uploaded resume removed."}


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
    except HTTPException as http_exc:
        # Preserve original status code (e.g., 503 when both providers fail)
        raise http_exc
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
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    session = interview_repo.get_session(interview_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )
    if session.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access to interview session."
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
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Answer evaluation failed: {str(e)}"
        )


@router.post("/{interview_id}/next-question", response_model=Optional[InterviewQuestion])
async def get_adaptive_next_question(
    interview_id: str,
    current_user: Any = Depends(require_roles([UserRole.STUDENT, UserRole.SUPER_ADMIN]))
):
    """
    Generates the next adaptive question based on the candidate's previous verbal responses and scores.
    """
    user_id = str(getattr(current_user, "id", None) or getattr(current_user, "sub", "u1000000-0000-0000-0000-000000000001"))
    try:
        return await ai_orchestrator.generate_adaptive_next_question(
            user_id=user_id,
            interview_id=interview_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate next adaptive question: {str(e)}"
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
