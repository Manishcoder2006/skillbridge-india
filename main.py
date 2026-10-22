"""
Root Entrypoint for SkillBridge India FastAPI Backend
Provides immediate compatibility whether Render is configured with root directory "." or "backend/".
"""

import sys
from pathlib import Path

# Ensure backend directory is in sys.path
_ROOT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _ROOT_DIR / "backend"

for _p in (str(_BACKEND_DIR), str(_ROOT_DIR)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("ENVIRONMENT", "development").lower() not in ("production", "prod")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=reload)
