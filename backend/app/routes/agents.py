"""
BURNO AI OS — Agent Routes
GET  /api/agents           — List all agents with live status & metrics
GET  /api/agents/{type}    — Get single agent details
POST /api/agents/{type}/activate   — Set agent active
POST /api/agents/{type}/pause      — Pause agent
POST /api/agents/{type}/task       — Send a task directly to an agent
"""
import uuid
import random
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Agents"])

# ─── Agent Registry ─────────────────────────────────────────────────────────
AGENTS = {
    "research": {
        "type": "research",
        "name": "Research Agent",
        "icon": "🔍",
        "color": "#00E5FF",
        "description": "Web research, fact-checking, summarization, and information retrieval from live sources.",
        "capabilities": ["Web Search", "Fact Checking", "Summarization", "News Analysis", "Data Extraction"],
        "model": "llama-3.3-70b-versatile",
        "status": "active",
        "tasks_completed": 142,
        "avg_response_ms": 2800,
        "success_rate": 98.2,
    },
    "coding": {
        "type": "coding",
        "name": "Coding Agent",
        "icon": "💻",
        "color": "#10B981",
        "description": "Code generation, debugging, optimization, code review, and multi-language development.",
        "capabilities": ["Code Generation", "Debugging", "Code Review", "Optimization", "Documentation"],
        "model": "llama-3.3-70b-versatile",
        "status": "active",
        "tasks_completed": 89,
        "avg_response_ms": 3200,
        "success_rate": 97.5,
    },
    "automation": {
        "type": "automation",
        "name": "Automation Agent",
        "icon": "⚡",
        "color": "#8B5CF6",
        "description": "Browser automation, workflow execution, form filling, and repetitive task automation.",
        "capabilities": ["Browser Control", "Form Automation", "Workflow Execution", "Scheduling", "API Calls"],
        "model": "llama-3.3-70b-versatile",
        "status": "active",
        "tasks_completed": 56,
        "avg_response_ms": 4100,
        "success_rate": 94.8,
    },
    "productivity": {
        "type": "productivity",
        "name": "Productivity Agent",
        "icon": "📋",
        "color": "#a855f7",
        "description": "Task management, scheduling, project planning, and general productivity assistance.",
        "capabilities": ["Task Planning", "Scheduling", "Summarization", "Email Drafting", "Meeting Notes"],
        "model": "llama-3.3-70b-versatile",
        "status": "active",
        "tasks_completed": 203,
        "avg_response_ms": 2100,
        "success_rate": 99.1,
    },
    "vision": {
        "type": "vision",
        "name": "Vision Agent",
        "icon": "👁️",
        "color": "#EC4899",
        "description": "Screen analysis, image understanding, OCR, and visual data extraction.",
        "capabilities": ["Screen Analysis", "OCR", "Image Understanding", "Object Detection", "Visual QA"],
        "model": "llama-3.3-70b-versatile",
        "status": "standby",
        "tasks_completed": 31,
        "avg_response_ms": 5500,
        "success_rate": 91.3,
    },
    "memory": {
        "type": "memory",
        "name": "Memory Agent",
        "icon": "🧠",
        "color": "#F59E0B",
        "description": "Context storage, semantic recall, knowledge indexing, and long-term memory management.",
        "capabilities": ["Context Storage", "Semantic Search", "Knowledge Indexing", "Recall", "Embedding"],
        "model": "llama-3.3-70b-versatile",
        "status": "active",
        "tasks_completed": 524,
        "avg_response_ms": 900,
        "success_rate": 99.8,
    },
}

# Track runtime state (in-memory for now)
_agent_state: dict[str, str] = {k: v["status"] for k, v in AGENTS.items()}
_agent_tasks_runtime: dict[str, int] = {k: 0 for k in AGENTS}


# ─── Schemas ─────────────────────────────────────────────────────────────────
class AgentTaskRequest(BaseModel):
    message: str
    session_id: str | None = None


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _build_agent(key: str) -> dict:
    base = AGENTS[key].copy()
    base["status"] = _agent_state[key]
    base["tasks_completed"] = AGENTS[key]["tasks_completed"] + _agent_tasks_runtime[key]
    # Simulate slight randomness in live metrics
    base["avg_response_ms"] = AGENTS[key]["avg_response_ms"] + random.randint(-200, 200)
    base["last_active"] = datetime.now(timezone.utc).isoformat()
    return base


# ─── Routes ──────────────────────────────────────────────────────────────────
@router.get("/agents")
async def get_agents():
    """Return all 6 agents with live status and metrics."""
    return {
        "agents": [_build_agent(k) for k in AGENTS],
        "total": len(AGENTS),
        "active": sum(1 for s in _agent_state.values() if s == "active"),
        "standby": sum(1 for s in _agent_state.values() if s == "standby"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/agents/{agent_type}")
async def get_agent(agent_type: str):
    """Return details for a specific agent."""
    if agent_type not in AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found")
    return _build_agent(agent_type)


@router.post("/agents/{agent_type}/activate")
async def activate_agent(agent_type: str):
    """Activate (un-pause) an agent."""
    if agent_type not in AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found")
    _agent_state[agent_type] = "active"
    return {"success": True, "agent": agent_type, "status": "active"}


@router.post("/agents/{agent_type}/pause")
async def pause_agent(agent_type: str):
    """Pause an agent."""
    if agent_type not in AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found")
    _agent_state[agent_type] = "standby"
    return {"success": True, "agent": agent_type, "status": "standby"}


@router.post("/agents/{agent_type}/task")
async def agent_task(agent_type: str, req: AgentTaskRequest):
    """Send a task directly to a specific agent."""
    if agent_type not in AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found")
    if _agent_state[agent_type] == "standby":
        raise HTTPException(status_code=409, detail=f"Agent '{agent_type}' is paused. Activate it first.")

    _agent_tasks_runtime[agent_type] += 1
    _agent_state[agent_type] = "processing"

    try:
        from app.services.claude import call_claude
        session_id = req.session_id or str(uuid.uuid4())
        result = await call_claude(req.message, agent_type, session_id)
        _agent_state[agent_type] = "active"
        return {
            "success": True,
            "agent_type": agent_type,
            "agent_name": AGENTS[agent_type]["name"],
            "result": result,
            "session_id": session_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        _agent_state[agent_type] = "active"
        raise HTTPException(status_code=500, detail=str(e))
