from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, ValidationInfo, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import json

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

    PROJECT_NAME: str = "SkillBridge India Portal API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS Configuration
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        elif isinstance(v, list):
            return v
        return []

    # Supabase Configuration
    SUPABASE_URL: str = "https://eiwvjvepyzcepkelojja.supabase.co"
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"

    # Phase 5: Multi-Model AI Configuration (Server-Side Only)
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    AI_DEFAULT_MODEL: str = "gemini-1.5-flash"
    GROQ_DEFAULT_MODEL: str = "llama-3.3-70b-versatile"
    AI_TIMEOUT_SECONDS: int = 15
    AI_SIMULATION_FALLBACK: bool = False
    # Maximum number of interview questions per session. Adjustable via environment variable for flexibility.
    INTERVIEW_MAX_QUESTIONS: int = Field(default=10, env="INTERVIEW_MAX_QUESTIONS")
    # Enforce that in production we must have a valid Gemini key (and optionally Groq key)
    @field_validator("ENVIRONMENT", mode="before")
    @classmethod
    def validate_environment(cls, v: str, info) -> str:
        # Accept 'development' or 'production'
        if v not in ("development", "production"):
            raise ValueError("ENVIRONMENT must be 'development' or 'production'")
        return v
    @field_validator("GEMINI_API_KEY", mode="before")
    @classmethod
    def validate_gemini_key(cls, v: str, info) -> str:
        # info contains the model data during validation
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production" and (not v or v.startswith("your-")):
            raise ValueError("GEMINI_API_KEY must be set for production")
        return v
    @field_validator("GROQ_API_KEY", mode="before")
    @classmethod
    def validate_groq_key(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        # Groq is optional but if provided in production must be valid
        if env == "production" and v and v.startswith("your-"):
            raise ValueError("GROQ_API_KEY is invalid for production")
        return v

    @field_validator("AI_SIMULATION_FALLBACK", mode="before")
    @classmethod
    def enforce_fallback_prod(cls, v: bool, info: ValidationInfo) -> bool:
        # In production, AI_SIMULATION_FALLBACK must be disabled
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production":
            return False
        return v

    @property
    def effective_secret_key(self) -> str:
        # Prefer service‑role key for full write access; fall back to anon key for read‑only scenarios.
        return self.SUPABASE_SERVICE_ROLE_KEY or self.SUPABASE_ANON_KEY

    # ---- New Zero‑Cost Video Tutor Flags ----
    VIDEO_TUTOR_ENABLED: bool = True
    VIDEO_MAX_DURATION_SECONDS: int = 600

settings = Settings()
