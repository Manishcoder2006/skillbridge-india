import os
import uuid
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import List

import pyttsx3
from PIL import Image, ImageDraw, ImageFont

from fastapi import HTTPException

from app.models.learning_video_job import LearningVideoJob
from app.repositories.learning_video_repository import LearningVideoRepository
from app.services.ai.orchestrator import ai_orchestrator
from app.core.config import settings
from app.core.database import db_manager

# Helper to verify required binaries are available
def _binary_exists(name: str) -> bool:
    return any(os.access(os.path.join(p, name), os.X_OK) for p in os.environ.get("PATH", "").split(os.pathsep))

# Render a slide (1280x720) using Pillow with dark theme
def _render_slide(title: str, bullets: List[str]) -> Path:
    width, height = 1280, 720
    img = Image.new("RGB", (width, height), color="#1e1e1e")
    draw = ImageDraw.Draw(img)
    try:
        title_font = ImageFont.truetype("arial.ttf", 48)
        bullet_font = ImageFont.truetype("arial.ttf", 28)
    except Exception:
        title_font = ImageFont.load_default()
        bullet_font = ImageFont.load_default()
    y = 80
    draw.text((width // 2, y), title, font=title_font, fill="white", anchor="mm")
    y += 100
    for bullet in bullets:
        draw.text((60, y), f"• {bullet}", font=bullet_font, fill="white")
        y += 50
    slide_path = Path(f"/tmp/slide_{uuid.uuid4().hex}.png")
    img.save(slide_path)
    return slide_path

# Synthesize narration using pyttsx3 (preferring espeak voice)
def _synthesize_text(text: str, job_id: str) -> Path:
    engine = pyttsx3.init()
    for v in engine.getProperty('voices'):
        if 'espeak' in v.id.lower():
            engine.setProperty('voice', v.id)
            break
    wav_path = Path(f"/tmp/audio_{job_id}_{uuid.uuid4().hex}.wav")
    engine.save_to_file(text, str(wav_path))
    engine.runAndWait()
    return wav_path

# Assemble final MP4 using ffmpeg, adding SRT subtitles. Output is 720p H.264.
def _assemble_video(slide_paths: List[Path], audio_paths: List[Path], subtitles_srt: str, output_path: Path):
    # Create concat list for images
    img_list = Path(f"/tmp/imglist_{uuid.uuid4().hex}.txt")
    with open(img_list, "w", encoding="utf-8") as f:
        for p in slide_paths:
            f.write(f"file '{p}'\n")
            f.write("duration 3\n")  # placeholder duration per slide
    # Create concat list for audio
    aud_list = Path(f"/tmp/audlist_{uuid.uuid4().hex}.txt")
    with open(aud_list, "w", encoding="utf-8") as f:
        for a in audio_paths:
            f.write(f"file '{a}'\n")
    # Concatenate audio files
    audio_concat = Path(f"/tmp/audio_concat_{uuid.uuid4().hex}.wav")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(aud_list), "-c", "copy", str(audio_concat)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # Create a video stream from the slide images
    video_tmp = Path(f"/tmp/video_tmp_{uuid.uuid4().hex}.mp4")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(img_list), "-vsync", "vfr", "-pix_fmt", "yuv420p", "-r", "30", str(video_tmp)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # Write subtitles file
    srt_path = Path(f"/tmp/subtitles_{uuid.uuid4().hex}.srt")
    srt_path.write_text(subtitles_srt, encoding="utf-8")
    # Merge video, audio, and subtitles into final MP4 (720p H.264)
    subprocess.run([
        "ffmpeg", "-y", "-i", str(video_tmp), "-i", str(audio_concat),
        "-c:v", "libx264", "-preset", "medium", "-crf", "23",
        "-c:a", "aac", "-b:a", "192k",
        "-vf", f"subtitles={srt_path}",
        str(output_path)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # Cleanup temporary concat files
    for p in [img_list, aud_list, audio_concat, video_tmp, srt_path]:
        try:
            p.unlink()
        except Exception:
            pass

class VideoTutorService:
    def __init__(self, repo: LearningVideoRepository = LearningVideoRepository()):
        self.repo = repo
        # Verify required binaries are present; fail fast if not.
        if not _binary_exists("ffmpeg"):
            raise HTTPException(status_code=503, detail="ffmpeg not available on server")
        if not _binary_exists("espeak"):
            raise HTTPException(status_code=503, detail="espeak not available on server")
        # Initialise TTS engine and prefer espeak voice if available.
        self.tts_engine = pyttsx3.init()
        for v in self.tts_engine.getProperty('voices'):
            if 'espeak' in v.id.lower():
                self.tts_engine.setProperty('voice', v.id)
                break
        self.tts_engine.setProperty('rate', 150)

    async def _generate_lesson(self, user_id: str, topic: str, max_duration: int) -> dict:
        """Generate a lesson plan using Gemini primary, Groq fallback.
        Returns a dict containing a list of slides, each with a title and bullet list.
        """
        try:
            lesson = await ai_orchestrator.generate_lesson_plan(
                user_id=user_id, topic=topic, max_duration_seconds=max_duration, provider="gemini"
            )
            return lesson
        except Exception as gemini_err:
            try:
                lesson = await ai_orchestrator.generate_lesson_plan(
                    user_id=user_id, topic=topic, max_duration_seconds=max_duration, provider="groq"
                )
                return lesson
            except Exception as groq_err:
                raise RuntimeError(f"Both Gemini and Groq failed: {gemini_err}; {groq_err}")

    def _synthesize_slide_audio(self, title: str, bullets: List[str], job_id: str) -> Path:
        text = f"{title}. " + " ".join(bullets)
        return _synthesize_text(text, job_id)

    async def process_job(self, job_id: str):
        job = self.repo.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        # Mark job as generating
        self.repo.update_status(job_id, status="generating")
        try:
            lesson = await self._generate_lesson(job.user_id, job.topic, job.max_duration_seconds)
            slides = lesson.get("slides", [])
            if not slides:
                raise RuntimeError("Lesson generation produced no slides")
            slide_paths: List[Path] = []
            audio_paths: List[Path] = []
            subtitles: List[str] = []
            current_ms = 0
            for idx, slide in enumerate(slides, start=1):
                title = slide.get("title", f"Slide {idx}")
                bullets = slide.get("bullets", [])
                slide_path = _render_slide(title, bullets)
                slide_paths.append(slide_path)
                audio_path = self._synthesize_slide_audio(title, bullets, job_id)
                audio_paths.append(audio_path)
                start_ts = f"{current_ms//3600000:02d}:{(current_ms%3600000)//60000:02d}:{(current_ms%60000)//1000:02d},000"
                current_ms += 3000
                end_ts = f"{current_ms//3600000:02d}:{(current_ms%3600000)//60000:02d}:{(current_ms%60000)//1000:02d},000"
                subtitles.append(f"{idx}\n{start_ts} --> {end_ts}\n{title}\n")
            subtitles_srt = "\n".join(subtitles)
            output_mp4 = Path(f"/tmp/video_{job_id}.mp4")
            _assemble_video(slide_paths, audio_paths, subtitles_srt, output_mp4)
            bucket = db_manager.client.storage.from_("video-tutor")
            object_path = f"{job_id}.mp4"
            with open(output_mp4, "rb") as f:
                bucket.upload(object_path, f.read())
            self.repo.update_completion(job_id, video_path=object_path)
        except Exception as exc:
            self.repo.update_status(job_id, status="failed", error_message=str(exc))
            raise HTTPException(status_code=503, detail="Video generation failed")
        finally:
            for p in slide_paths + audio_paths:
                try:
                    p.unlink()
                except Exception:
                    pass
            try:
                output_mp4.unlink()
            except Exception:
                pass

def cleanup_expired_videos():
    cutoff = datetime.utcnow() - timedelta(days=7)
    old_jobs = LearningVideoRepository().list_completed_before(cutoff)
    bucket = db_manager.client.storage.from_("video-tutor")
    for job in old_jobs:
        try:
            bucket.remove(job.video_path)
        except Exception:
            pass
        LearningVideoRepository().delete_job(job.job_id)
