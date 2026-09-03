from sqlmodel import Session, select
from app.models.learning_video_job import LearningVideoJob
from typing import List, Optional
from datetime import datetime

class LearningVideoRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_job(self, user_id: str, topic: str, max_duration_seconds: int) -> LearningVideoJob:
        job = LearningVideoJob(user_id=user_id, topic=topic, max_duration_seconds=max_duration_seconds)
        self.session.add(job)
        self.session.commit()
        self.session.refresh(job)
        return job

    def has_active_job(self, user_id: str) -> bool:
        stmt = select(LearningVideoJob).where(
            LearningVideoJob.user_id == user_id,
            LearningVideoJob.status.in_(['queued', 'generating'])
        )
        return self.session.exec(stmt).first() is not None

    def list_completed_before(self, cutoff: datetime) -> List[LearningVideoJob]:
        stmt = select(LearningVideoJob).where(
            LearningVideoJob.status == 'completed',
            LearningVideoJob.created_at < cutoff
        )
        return self.session.exec(stmt).all()

    def delete_job(self, job_id: str) -> None:
        job = self.session.get(LearningVideoJob, job_id)
        if job:
            self.session.delete(job)
            self.session.commit()

    def get_job(self, job_id: str) -> Optional[LearningVideoJob]:
        return self.session.get(LearningVideoJob, job_id)

    def update_status(self, job_id: str, status: str, video_path: Optional[str] = None, error_message: Optional[str] = None) -> None:
        job = self.session.get(LearningVideoJob, job_id)
        if not job:
            return
        job.status = status
        if video_path:
            job.video_path = video_path
        if error_message:
            job.error_message = error_message
        job.updated_at = datetime.utcnow()
        self.session.add(job)
        self.session.commit()

    def update_completion(self, job_id: str, video_url: str) -> None:
        """Mark job as completed and store signed video URL."""
        job = self.session.get(LearningVideoJob, job_id)
        if not job:
            return
        job.status = "completed"
        job.video_path = video_url
        job.updated_at = datetime.utcnow()
        self.session.add(job)
        self.session.commit()
