"""
Vercel Serverless Function Entrypoint for SkillBridge India FastAPI Backend
"""

import sys
from pathlib import Path

# Add backend root directory to sys.path so that 'app' module can be resolved anywhere
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

# Expose app for Vercel ASGI runtime
__all__ = ["app"]
