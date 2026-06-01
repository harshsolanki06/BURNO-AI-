"""
EchoVerse AI OS — Agent Routes
GET /api/agents — List all available agents
"""
from fastapi import APIRouter

from app.services.agent import AGENT_SYSTEM_PROMPTS

router = APIRouter(prefix="/api", tags=["Agents"])


@router.get("/agents")
async def get_agents():
    return {
        "agents": [
            {"type": k, "name": f"{k.title()} Agent", "status": "ready"}
            for k in AGENT_SYSTEM_PROMPTS.keys()
        ]
    }
