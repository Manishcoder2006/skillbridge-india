from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
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
        "http://localhost:3000",
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
    AI_SIMULATION_FALLBACK: bool = True

    @property
    def effective_secret_key(self) -> str:
        return self.SUPABASE_SECRET_KEY or self.SUPABASE_SERVICE_ROLE_KEY

settings = Settings()
