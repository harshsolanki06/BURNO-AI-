"""
BURNO AI OS — System Routes
Health checks, system status, and root endpoint
"""
from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import settings
from app.services.agent import AGENT_SYSTEM_PROMPTS

router = APIRouter(tags=["System"])


@router.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "agents": list(AGENT_SYSTEM_PROMPTS.keys()),
        "ai_provider": settings.active_ai_provider,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "ai_provider": settings.active_ai_provider,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/api/system/status")
async def system_status():
    try:
        import psutil
        cpu = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory().percent
    except ImportError:
        cpu = 0.0
        mem = 0.0

    return {
        "cpu": cpu,
        "memory": mem,
        "active_agents": 6,
        "total_tasks": 0,
        "uptime": 72000,
        "api_latency": 42,
        "ws_connected": True,
        "ai_provider": settings.active_ai_provider,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/api/system/provider")
async def ai_provider():
    """Return which AI provider is currently active."""
    provider = settings.active_ai_provider
    provider_info = {
        "groq":      {"name": "Groq (Llama 3)",   "model": settings.GROQ_MODEL,    "free": True},
        "anthropic": {"name": "Anthropic (Claude)", "model": settings.CLAUDE_MODEL,  "free": False},
        "openai":    {"name": "OpenAI (GPT-4o)",    "model": settings.OPENAI_MODEL,   "free": False},
        "gemini":    {"name": "Google Gemini",       "model": settings.GEMINI_MODEL,   "free": True},
        "demo":      {"name": "Demo Mode",           "model": "none",                  "free": True},
    }
    info = provider_info.get(provider, provider_info["demo"])
    return {
        "provider": provider,
        "name": info["name"],
        "model": info["model"],
        "free": info["free"],
        "live": provider != "demo",
    }
