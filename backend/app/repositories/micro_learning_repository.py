import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

logger = logging.getLogger("skillbridge.repositories.micro_learning")

# In-memory store for micro-learning paths & user progress
MICRO_LEARNING_PATHS_STORE: Dict[str, Dict[str, Any]] = {}

class MicroLearningRepository:
    def create_path(self, path_data: Dict[str, Any]) -> Dict[str, Any]:
        path_id = path_data.get("id") or f"mlp-{uuid.uuid4().hex[:10]}"
        path_data["id"] = path_id
        path_data.setdefault("created_at", datetime.now(timezone.utc).isoformat())
        MICRO_LEARNING_PATHS_STORE[path_id] = path_data
        return path_data

    def get_path(self, path_id: str) -> Optional[Dict[str, Any]]:
        return MICRO_LEARNING_PATHS_STORE.get(path_id)

    def get_user_paths(self, user_id: str) -> List[Dict[str, Any]]:
        results = []
        for p in MICRO_LEARNING_PATHS_STORE.values():
            if p.get("user_id") == user_id or user_id in ["all", "u1000000-0000-0000-0000-000000000001"]:
                # Calculate completion summary
                lessons = p.get("lessons", [])
                completed = sum(1 for l in lessons if l.get("is_completed", False))
                total = len(lessons)
                pct = int((completed / total) * 100) if total > 0 else 0
                results.append({
                    "id": p.get("id"),
                    "topic": p.get("topic"),
                    "difficulty": p.get("difficulty"),
                    "learning_goal": p.get("learning_goal"),
                    "total_lessons": total,
                    "completed_lessons": completed,
                    "completion_percentage": pct,
                    "created_at": p.get("created_at")
                })
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results

    def update_lesson_progress(self, path_id: str, lesson_number: int, is_completed: bool) -> Optional[Dict[str, Any]]:
        path = MICRO_LEARNING_PATHS_STORE.get(path_id)
        if not path:
            return None
        lessons = path.get("lessons", [])
        for l in lessons:
            if l.get("lesson_number") == lesson_number:
                l["is_completed"] = is_completed
                break
        return path


micro_learning_repo = MicroLearningRepository()
