"""
EchoVerse AI OS — Memory Routes
Store and search conversation memories
"""
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.deps import get_db, get_current_user_optional
from app.services.memory import store_memory, search_memories

router = APIRouter(prefix="/api/memory", tags=["Memory"])


class StoreMemoryRequest(BaseModel):
    content: str
    category: str = "conversation"
    tags: Optional[list] = None


@router.post("/store")
async def store(
    req: StoreMemoryRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    """Store a new memory entry."""
    memory = await store_memory(
        db=db,
        content=req.content,
        category=req.category,
        user_id=user.id if user else None,
        tags=req.tags,
    )
    return {
        "id": memory.id,
        "stored": True,
        "category": memory.category,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/search")
async def search(
    query: str,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    """Search memories by content."""
    results = await search_memories(
        db=db,
        query=query,
        limit=limit,
        user_id=user.id if user else None,
    )
    return {
        "query": query,
        "results": [
            {
                "id": m.id,
                "content": m.content,
                "category": m.category,
                "relevance_score": m.relevance_score,
                "tags": json.loads(m.tags) if m.tags else [],
                "created_at": m.created_at.isoformat() if m.created_at else "",
            }
            for m in results
        ],
        "count": len(results),
    }
