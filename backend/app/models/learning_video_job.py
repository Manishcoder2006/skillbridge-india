from datetime import datetime
from uuid import uuid4
from typing import Optional
from sqlmodel import Field, SQLModel
from ..core.config import settings

class LearningVideoJob(SQLModel, table=True):
    job_id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    topic: str
    max_duration_seconds: int = Field(default=settings.VIDEO_MAX_DURATION_SECONDS)
    status: str = Field(default="queued")  # queued|generating|completed|failed
    video_path: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
