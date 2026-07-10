"""
BURNO AI OS — Activity Log Routes
GET /api/activity  — fetch recent activity entries
POST /api/activity — log a new activity entry
"""
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel

from app.core.deps import get_db, get_current_user_optional
from app.models.activity import ActivityLog

router = APIRouter(prefix="/api/activity", tags=["Activity"])


class ActivityCreate(BaseModel):
    type: str          # message | task | agent | system | voice | automation | memory
    title: str
    description: Optional[str] = None
    metadata: Optional[dict] = None


@router.post("")
async def log_activity(
    req: ActivityCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    """Log a new activity entry."""
    entry = ActivityLog(
        user_id=user.id if user else None,
        type=req.type,
        title=req.title,
        description=req.description,
        metadata_json=json.dumps(req.metadata) if req.metadata else None,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return {
        "id": entry.id,
        "logged": True,
        "timestamp": entry.created_at.isoformat() if entry.created_at else datetime.now(timezone.utc).isoformat(),
    }


@router.get("")
async def get_activity(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Fetch recent activity entries, newest first."""
    result = await db.execute(
        select(ActivityLog)
        .order_by(desc(ActivityLog.created_at))
        .limit(limit)
    )
    entries = result.scalars().all()

    # Icon + color map by activity type
    type_meta = {
        "message":    {"icon": "💬", "color": "#4d7cff"},
        "task":       {"icon": "🔍", "color": "#4d7cff"},
        "agent":      {"icon": "🤖", "color": "#34d399"},
        "system":     {"icon": "✅", "color": "#34d399"},
        "voice":      {"icon": "🎙️", "color": "#a855f7"},
        "automation": {"icon": "⚡", "color": "#fb923c"},
        "memory":     {"icon": "🧠", "color": "#00f0ff"},
    }

    return {
        "items": [
            {
                "id": e.id,
                "type": e.type,
                "title": e.title,
                "description": e.description or "",
                "timestamp": e.created_at.isoformat() if e.created_at else "",
                "icon": type_meta.get(e.type, {}).get("icon", "📌"),
                "color": type_meta.get(e.type, {}).get("color", "#4d7cff"),
                "metadata": json.loads(e.metadata_json) if e.metadata_json else {},
            }
            for e in entries
        ],
        "count": len(entries),
    }
