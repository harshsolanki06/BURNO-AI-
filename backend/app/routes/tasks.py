"""
EchoVerse AI OS — Task Routes
CRUD operations for agent tasks
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.deps import get_db, get_current_user_optional
from app.schemas.task import TaskCreate, TaskResponse
from app.models.task import Task

router = APIRouter(prefix="/api", tags=["Tasks"])


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    req: TaskCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    """Create a new task assigned to an agent."""
    task = Task(
        title=req.title,
        description=req.description,
        agent_type=req.agent_type,
        user_id=user.id if user else None,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        agent_type=task.agent_type,
        progress=task.progress,
        created_at=task.created_at.isoformat() if task.created_at else datetime.now(timezone.utc).isoformat(),
    )


@router.get("/tasks")
async def list_tasks(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List recent tasks."""
    result = await db.execute(
        select(Task).order_by(desc(Task.created_at)).limit(limit)
    )
    tasks = result.scalars().all()
    return {
        "tasks": [
            TaskResponse(
                id=t.id,
                title=t.title,
                description=t.description,
                status=t.status,
                agent_type=t.agent_type,
                progress=t.progress,
                result=t.result,
                error=t.error,
                created_at=t.created_at.isoformat() if t.created_at else "",
                completed_at=t.completed_at.isoformat() if t.completed_at else None,
            )
            for t in tasks
        ],
        "count": len(tasks),
    }
