"""
BURNO AI OS — Application Configuration
Pydantic Settings with .env file support
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ─── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "BURNO AI OS"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # ─── Server ───────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app"
    ALLOW_ALL_ORIGINS: bool = False   # Set True in Railway env to open CORS globally

    # ─── AI APIs ──────────────────────────────────────────────────────────────
    # Provider priority: Groq → Anthropic → OpenAI → Gemini → Smart Demo
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""          # FREE: get at console.groq.com
    GEMINI_API_KEY: str = ""        # FREE: get at aistudio.google.com

    # ElevenLabs TTS
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"

    # ─── Model settings ───────────────────────────────────────────────────────
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    CLAUDE_MAX_TOKENS: int = 4096
    GROQ_MODEL: str = "llama3-70b-8192"      # Fast & free on Groq
    OPENAI_MODEL: str = "gpt-4o-mini"         # Cheap OpenAI fallback
    GEMINI_MODEL: str = "gemini-1.5-flash"    # Free Google fallback

    # ─── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./echoverse.db"
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001
    CHROMA_COLLECTION: str = "echoverse_memory"

    # ─── Auth ─────────────────────────────────────────────────────────────────
    SECRET_KEY: str = "dev-secret-key-change-in-production-burno"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    @property
    def origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_sqlite(self) -> bool:
        return "sqlite" in self.DATABASE_URL

    @property
    def active_ai_provider(self) -> str:
        """Return the name of whichever provider key is configured first."""
        if self.GROQ_API_KEY:
            return "groq"
        if self.ANTHROPIC_API_KEY:
            return "anthropic"
        if self.OPENAI_API_KEY:
            return "openai"
        if self.GEMINI_API_KEY:
            return "gemini"
        return "demo"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
