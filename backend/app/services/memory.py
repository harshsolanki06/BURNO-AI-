"""
EchoVerse AI OS — Memory Service
Store and search conversation memories
"""
import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.memory import Memory


async def store_memory(
    db: AsyncSession,
    content: str,
    category: str = "conversation",
    user_id: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> Memory:
    """Store a new memory entry."""
    memory = Memory(
        content=content,
        category=category,
        user_id=user_id,
        tags=json.dumps(tags) if tags else None,
    )
    db.add(memory)
    await db.flush()
    await db.refresh(memory)
    return memory


async def search_memories(
    db: AsyncSession,
    query: str,
    limit: int = 5,
    user_id: Optional[str] = None,
) -> List[Memory]:
    """Search memories by content (basic LIKE search; upgrade to vector search with ChromaDB)."""
    stmt = select(Memory).where(Memory.content.contains(query))
    if user_id:
        stmt = stmt.where(Memory.user_id == user_id)
    stmt = stmt.order_by(desc(Memory.created_at)).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())
