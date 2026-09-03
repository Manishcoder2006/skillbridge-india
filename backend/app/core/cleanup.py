import logging
from datetime import datetime, timedelta

from app.services.ai.video_tutor_service import cleanup_expired_videos

logger = logging.getLogger("skillbridge.cleanup")

def run_daily_cleanup():
    """Execute daily cleanup of completed video tutor jobs older than 7 days.
    This function can be invoked via a scheduled cron job on Render or called
    during FastAPI startup for environments that support background tasks.
    """
    try:
        cleanup_expired_videos()
        logger.info("Video tutor cleanup completed successfully.")
    except Exception as e:
        logger.error(f"Error during video tutor cleanup: {e}", exc_info=True)
