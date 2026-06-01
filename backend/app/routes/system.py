"""
EchoVerse AI OS — System Routes
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
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health")
async def health():
    return {
        "status": "healthy",
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
        "active_agents": 2,
        "total_tasks": 847,
        "uptime": 72000,
        "api_latency": 42,
        "ws_connected": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
