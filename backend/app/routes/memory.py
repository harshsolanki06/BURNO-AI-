"""
BURNO AI OS — Memory Routes
POST   /api/memory/store     — Save a new memory
GET    /api/memory/list      — List all memories (paginated, filterable)
GET    /api/memory/search    — Search memories by content
DELETE /api/memory/{id}      — Delete a memory
"""
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from pydantic import BaseModel

from app.core.deps import get_db, get_current_user_optional
from app.services.memory import store_memory, search_memories
from app.models.memory import Memory

router = APIRouter(prefix="/api/memory", tags=["Memory"])


class StoreMemoryRequest(BaseModel):
    content: str
    category: str = "conversation"
    tags: Optional[list] = None


def _serialize(m: Memory) -> dict:
    return {
        "id": m.id,
        "content": m.content,
        "category": m.category,
        "relevance_score": m.relevance_score or 1.0,
        "tags": json.loads(m.tags) if m.tags else [],
        "created_at": m.created_at.isoformat() if m.created_at else "",
    }


# ─── Store ────────────────────────────────────────────────────────────────────
@router.post("/store")
async def store(
    req: StoreMemoryRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    memory = await store_memory(
        db=db,
        content=req.content,
        category=req.category,
        user_id=user.id if user else None,
        tags=req.tags,
    )
    await db.commit()
    return {
        "id": memory.id,
        "stored": True,
        "category": memory.category,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── List (browse all) ────────────────────────────────────────────────────────
@router.get("/list")
async def list_memories(
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    stmt = select(Memory)
    if category and category != "all":
        stmt = stmt.where(Memory.category == category)
    stmt = stmt.order_by(desc(Memory.created_at)).offset(offset).limit(limit)
    result = await db.execute(stmt)
    memories = list(result.scalars().all())

    # Count total
    from sqlalchemy import func
    count_stmt = select(func.count(Memory.id))
    if category and category != "all":
        count_stmt = count_stmt.where(Memory.category == category)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    # Category counts
    cat_stmt = select(Memory.category, func.count(Memory.id)).group_by(Memory.category)
    cat_result = await db.execute(cat_stmt)
    categories = {row[0]: row[1] for row in cat_result.all()}

    return {
        "memories": [_serialize(m) for m in memories],
        "total": total,
        "limit": limit,
        "offset": offset,
        "categories": categories,
    }


# ─── Search ───────────────────────────────────────────────────────────────────
@router.get("/search")
async def search(
    query: str,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    results = await search_memories(
        db=db,
        query=query,
        limit=limit,
        user_id=user.id if user else None,
    )
    return {
        "query": query,
        "results": [_serialize(m) for m in results],
        "count": len(results),
    }


# ─── Delete ───────────────────────────────────────────────────────────────────
@router.delete("/{memory_id}")
async def delete_memory(
    memory_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Memory).where(Memory.id == memory_id)
    result = await db.execute(stmt)
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    await db.delete(memory)
    await db.commit()
    return {"deleted": True, "id": memory_id}


# ─── Stats ────────────────────────────────────────────────────────────────────
@router.get("/stats")
async def memory_stats(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    total_result = await db.execute(select(func.count(Memory.id)))
    total = total_result.scalar() or 0
    cat_result = await db.execute(
        select(Memory.category, func.count(Memory.id)).group_by(Memory.category)
    )
    categories = {row[0]: row[1] for row in cat_result.all()}
    return {
        "total": total,
        "categories": categories,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
