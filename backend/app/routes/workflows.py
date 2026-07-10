"""
BURNO AI OS — Workflow Builder Routes
POST   /api/workflows              — Create workflow template
GET    /api/workflows              — List all workflows
GET    /api/workflows/{id}         — Get single workflow
DELETE /api/workflows/{id}         — Delete workflow
POST   /api/workflows/{id}/run     — Execute a workflow (streamed step-by-step)
GET    /api/workflows/{id}/runs    — Get run history for a workflow
GET    /api/workflows/runs/recent  — Last N runs across all workflows
"""
import json
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.config import settings
from app.core.deps import get_db
from app.models.workflow import WorkflowTemplate, WorkflowRun

router = APIRouter(prefix="/api/workflows", tags=["Workflows"])

# ─── Schemas ──────────────────────────────────────────────────────────────────
class WorkflowStep(BaseModel):
    id: str
    agent: str          # research | coding | memory | productivity | vision | any
    action: str         # prompt | store_memory | search_knowledge | summarize | custom
    label: str
    prompt: str         # may include {{input}} {{prev_output}} placeholders
    config: dict = {}

class CreateWorkflow(BaseModel):
    name: str
    description: Optional[str] = ""
    icon: Optional[str] = "⚡"
    color: Optional[str] = "#00d4ff"
    steps: list[WorkflowStep]

class RunWorkflow(BaseModel):
    variables: dict = {}    # e.g. {"query": "latest AI news"}

# ─── Built-in templates ───────────────────────────────────────────────────────
BUILTIN_TEMPLATES = [
    {
        "id": "tmpl-research-store",
        "name": "Research & Store",
        "description": "Research a topic, summarize findings, and store to memory",
        "icon": "🔍",
        "color": "#4d7cff",
        "builtin": True,
        "steps": [
            {"id": "s1", "agent": "research", "action": "prompt", "label": "Research Topic",
             "prompt": "Research and provide a comprehensive overview of: {{query}}"},
            {"id": "s2", "agent": "research", "action": "summarize", "label": "Summarize Findings",
             "prompt": "Summarize the following research into 3-5 key bullet points:\n\n{{prev_output}}"},
            {"id": "s3", "agent": "memory", "action": "store_memory", "label": "Store to Memory",
             "prompt": "{{prev_output}}", "config": {"category": "knowledge"}},
        ]
    },
    {
        "id": "tmpl-code-review",
        "name": "Code & Document",
        "description": "Write code for a task then generate documentation",
        "icon": "💻",
        "color": "#10b981",
        "builtin": True,
        "steps": [
            {"id": "s1", "agent": "coding", "action": "prompt", "label": "Write Code",
             "prompt": "Write clean, well-commented code for: {{task}}"},
            {"id": "s2", "agent": "coding", "action": "prompt", "label": "Generate Docs",
             "prompt": "Write technical documentation and usage examples for this code:\n\n{{prev_output}}"},
            {"id": "s3", "agent": "memory", "action": "store_memory", "label": "Store Solution",
             "prompt": "Code solution for '{{task}}':\n\n{{prev_output}}", "config": {"category": "knowledge"}},
        ]
    },
    {
        "id": "tmpl-daily-brief",
        "name": "Daily Briefing",
        "description": "Gather news, summarize, format as a daily brief",
        "icon": "📰",
        "color": "#f59e0b",
        "builtin": True,
        "steps": [
            {"id": "s1", "agent": "research", "action": "prompt", "label": "Fetch AI News",
             "prompt": "What are the most important AI and technology developments happening today? List 5 key topics."},
            {"id": "s2", "agent": "productivity", "action": "prompt", "label": "Format Daily Brief",
             "prompt": "Format this as a concise daily briefing with emojis and clear sections:\n\n{{prev_output}}"},
            {"id": "s3", "agent": "memory", "action": "store_memory", "label": "Archive Briefing",
             "prompt": "Daily briefing: {{prev_output}}", "config": {"category": "note"}},
        ]
    },
    {
        "id": "tmpl-analyze-explain",
        "name": "Analyze & Explain",
        "description": "Analyze a concept then create a simple explanation",
        "icon": "🧠",
        "color": "#8b5cf6",
        "builtin": True,
        "steps": [
            {"id": "s1", "agent": "research", "action": "prompt", "label": "Deep Analysis",
             "prompt": "Provide a detailed technical analysis of: {{topic}}"},
            {"id": "s2", "agent": "productivity", "action": "prompt", "label": "Simplify for Beginners",
             "prompt": "Explain this in simple terms a beginner would understand:\n\n{{prev_output}}"},
        ]
    },
]


def _serialize_template(t: WorkflowTemplate | dict, include_steps: bool = True) -> dict:
    if isinstance(t, dict):
        return t
    return {
        "id": t.id,
        "name": t.name,
        "description": t.description or "",
        "icon": t.icon,
        "color": t.color,
        "builtin": False,
        "steps": t.get_steps() if include_steps else [],
        "created_at": t.created_at.isoformat() if t.created_at else "",
    }


def _serialize_run(r: WorkflowRun) -> dict:
    duration = None
    if r.completed_at and r.started_at:
        duration = round((r.completed_at - r.started_at).total_seconds(), 2)
    return {
        "id": r.id,
        "workflow_id": r.workflow_id,
        "workflow_name": r.workflow_name,
        "status": r.status,
        "steps": r.get_results(),
        "error": r.error,
        "started_at": r.started_at.isoformat() if r.started_at else "",
        "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        "duration_seconds": duration,
    }


# ─── Execute a single step ────────────────────────────────────────────────────
async def execute_step(step: dict, context: dict) -> dict:
    """Execute one workflow step and return a result dict."""
    action = step.get("action", "prompt")
    agent = step.get("agent", "research")
    prompt_tmpl = step.get("prompt", "")

    # Replace template vars
    prompt = prompt_tmpl
    for k, v in context.items():
        prompt = prompt.replace("{{" + k + "}}", str(v))

    t0 = time.time()

    if action == "store_memory":
        # Store content to memory directly
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                category = step.get("config", {}).get("category", "conversation")
                r = await c.post(
                    "http://localhost:8000/api/memory/store",
                    json={"content": prompt, "category": category},
                )
                ok = r.status_code == 200
                output = f"Stored to memory (category: {category})" if ok else f"Memory store failed: {r.text[:100]}"
        except Exception as e:
            output = f"Memory store error: {e}"

    else:
        # Route to AI via /api/chat
        try:
            async with httpx.AsyncClient(timeout=60) as c:
                r = await c.post(
                    "http://localhost:8000/api/chat",
                    json={"message": prompt, "agent_type": agent},
                )
                d = r.json()
                output = d.get("content", f"Error: {r.status_code}")
        except Exception as e:
            output = f"Step error: {e}"

    elapsed = round(time.time() - t0, 2)
    return {
        "step_id": step.get("id"),
        "label": step.get("label"),
        "agent": agent,
        "action": action,
        "output": output,
        "elapsed_s": elapsed,
        "status": "completed",
    }


# ─── List workflows ───────────────────────────────────────────────────────────
@router.get("")
async def list_workflows(db: AsyncSession = Depends(get_db)):
    stmt = select(WorkflowTemplate).order_by(desc(WorkflowTemplate.created_at))
    result = await db.execute(stmt)
    user_wfs = [_serialize_template(w, include_steps=True) for w in result.scalars().all()]
    return {
        "workflows": BUILTIN_TEMPLATES + user_wfs,
        "total": len(BUILTIN_TEMPLATES) + len(user_wfs),
        "builtins": len(BUILTIN_TEMPLATES),
        "custom": len(user_wfs),
    }


# ─── Get single (must be before /{id}/runs) ───────────────────────────────────
@router.get("/runs/recent")
async def recent_runs(limit: int = 20, db: AsyncSession = Depends(get_db)):
    stmt = select(WorkflowRun).order_by(desc(WorkflowRun.started_at)).limit(limit)
    result = await db.execute(stmt)
    return {"runs": [_serialize_run(r) for r in result.scalars().all()]}


@router.get("/{wf_id}")
async def get_workflow(wf_id: str, db: AsyncSession = Depends(get_db)):
    # Check builtins first
    for bt in BUILTIN_TEMPLATES:
        if bt["id"] == wf_id:
            return bt
    stmt = select(WorkflowTemplate).where(WorkflowTemplate.id == wf_id)
    result = await db.execute(stmt)
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return _serialize_template(wf)


# ─── Create ──────────────────────────────────────────────────────────────────
@router.post("")
async def create_workflow(body: CreateWorkflow, db: AsyncSession = Depends(get_db)):
    wf = WorkflowTemplate(
        name=body.name,
        description=body.description,
        icon=body.icon or "⚡",
        color=body.color or "#00d4ff",
        steps_json=json.dumps([s.model_dump() for s in body.steps]),
    )
    db.add(wf)
    await db.commit()
    await db.refresh(wf)
    return _serialize_template(wf)


# ─── Delete ──────────────────────────────────────────────────────────────────
@router.delete("/{wf_id}")
async def delete_workflow(wf_id: str, db: AsyncSession = Depends(get_db)):
    # Cannot delete builtins
    if any(bt["id"] == wf_id for bt in BUILTIN_TEMPLATES):
        raise HTTPException(status_code=400, detail="Cannot delete built-in workflows")
    stmt = select(WorkflowTemplate).where(WorkflowTemplate.id == wf_id)
    result = await db.execute(stmt)
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    await db.delete(wf)
    await db.commit()
    return {"deleted": True, "id": wf_id}


# ─── Run (SSE streaming) ─────────────────────────────────────────────────────
@router.post("/{wf_id}/run")
async def run_workflow(wf_id: str, body: RunWorkflow, db: AsyncSession = Depends(get_db)):
    # Resolve steps
    steps = None
    wf_name = ""
    for bt in BUILTIN_TEMPLATES:
        if bt["id"] == wf_id:
            steps = bt["steps"]
            wf_name = bt["name"]
            break

    if steps is None:
        stmt = select(WorkflowTemplate).where(WorkflowTemplate.id == wf_id)
        result = await db.execute(stmt)
        wf = result.scalar_one_or_none()
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
        steps = wf.get_steps()
        wf_name = wf.name

    if not steps:
        raise HTTPException(status_code=400, detail="Workflow has no steps")

    # Create run record
    run = WorkflowRun(workflow_id=wf_id, workflow_name=wf_name, status="running",
                      input_vars_json=json.dumps(body.variables))
    db.add(run)
    await db.commit()
    await db.refresh(run)
    run_id = run.id

    async def stream():
        context = dict(body.variables)
        step_results = []
        failed = False

        yield f"data: {json.dumps({'type':'start','run_id':run_id,'workflow':wf_name,'total_steps':len(steps)})}\n\n"

        for i, step in enumerate(steps):
            yield f"data: {json.dumps({'type':'step_start','step_index':i,'label':step.get('label','Step'),'agent':step.get('agent')})}\n\n"
            try:
                result = await execute_step(step, context)
                step_results.append(result)
                context["prev_output"] = result["output"]
                context[f"step_{i+1}_output"] = result["output"]
                yield f"data: {json.dumps({'type':'step_done','step_index':i,'result':result})}\n\n"
            except Exception as e:
                err = {"step_id": step.get("id"), "label": step.get("label"), "status": "failed", "output": str(e)}
                step_results.append(err)
                failed = True
                yield f"data: {json.dumps({'type':'step_error','step_index':i,'error':str(e)})}\n\n"
                break

        # Save run result to DB
        async with db.begin_nested() if False else db.begin():
            pass
        # Use a fresh session operation
        run_stmt = select(WorkflowRun).where(WorkflowRun.id == run_id)
        run_res = await db.execute(run_stmt)
        run_obj = run_res.scalar_one_or_none()
        if run_obj:
            run_obj.status = "failed" if failed else "completed"
            run_obj.steps_result_json = json.dumps(step_results)
            run_obj.completed_at = datetime.now(timezone.utc)
            await db.commit()

        final_output = step_results[-1]["output"] if step_results else ""
        yield f"data: {json.dumps({'type':'complete','status':'failed' if failed else 'completed','run_id':run_id,'final_output':final_output,'step_count':len(step_results)})}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ─── Run history ─────────────────────────────────────────────────────────────
@router.get("/{wf_id}/runs")
async def workflow_runs(wf_id: str, limit: int = 10, db: AsyncSession = Depends(get_db)):
    stmt = (select(WorkflowRun).where(WorkflowRun.workflow_id == wf_id)
            .order_by(desc(WorkflowRun.started_at)).limit(limit))
    result = await db.execute(stmt)
    return {"runs": [_serialize_run(r) for r in result.scalars().all()]}
