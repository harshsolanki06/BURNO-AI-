"""
BURNO AI OS — Chat Routes
POST /api/chat         — Full response (stores to DB, waits for complete answer)
POST /api/chat/stream  — SSE streaming (tokens appear word-by-word as they arrive)
"""
import uuid
import json
import traceback
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.agent import detect_agent, AGENT_NAMES
from app.services.claude import call_claude, stream_response
from app.core.deps import get_db, get_current_user_optional
from app.models.message import Session as ChatSession, Message
from app.models.activity import ActivityLog

router = APIRouter(prefix="/api", tags=["Chat"])

HISTORY_LIMIT = 20


async def _ensure_session(db: AsyncSession, session_id: str, message: str, user) -> None:
    """Create chat session row if it doesn't exist yet."""
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    if result.scalar_one_or_none() is None:
        db.add(ChatSession(
            id=session_id,
            user_id=user.id if user else None,
            title=message[:80],
        ))
        await db.flush()


async def _load_history(db: AsyncSession, session_id: str) -> list:
    """Load the last HISTORY_LIMIT messages for conversation context."""
    result = await db.execute(
        select(Message)
        .where(
            Message.session_id == session_id,
            Message.role.in_(["user", "assistant"]),
        )
        .order_by(asc(Message.created_at))
        .limit(HISTORY_LIMIT)
    )
    return [{"role": m.role, "content": m.content} for m in result.scalars().all()]


def _model_name() -> str:
    from app.core.config import settings
    return settings.CLAUDE_MODEL


# ─── POST /api/chat — standard (waits for full response) ─────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    try:
        start       = datetime.now(timezone.utc)
        session_id  = req.session_id or str(uuid.uuid4())
        agent_type  = req.agent_type or detect_agent(req.message)
        msg_id      = str(uuid.uuid4())

        await _ensure_session(db, session_id, req.message, user)
        history = await _load_history(db, session_id)

        db.add(Message(session_id=session_id, role="user", content=req.message))

        content = await call_claude(req.message, agent_type, session_id, history=history)
        elapsed = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)
        tokens  = len(content.split()) * 2

        db.add(Message(
            id=msg_id,
            session_id=session_id,
            role="assistant",
            content=content,
            agent_type=agent_type,
            agent_name=AGENT_NAMES.get(agent_type, "Agent"),
            tokens=tokens,
            processing_time_ms=elapsed,
            model=_model_name(),
        ))
        db.add(ActivityLog(
            user_id=user.id if user else None,
            type="message",
            title=f"{AGENT_NAMES.get(agent_type, 'Agent')} responded",
            description=req.message[:120],
        ))
        await db.flush()

        return ChatResponse(
            id=msg_id,
            content=content,
            agent_type=agent_type,
            agent_name=AGENT_NAMES.get(agent_type, "Agent"),
            session_id=session_id,
            processing_time_ms=elapsed,
            tokens=tokens,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception:
        traceback.print_exc()
        raise


# ─── POST /api/chat/stream — Server-Sent Events streaming ─────────────────────
@router.post("/chat/stream")
async def chat_stream(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    """
    Stream AI response token-by-token via SSE.
    The frontend receives tokens immediately as they arrive,
    then a final 'done' event with full metadata.
    """
    session_id = req.session_id or str(uuid.uuid4())
    agent_type = req.agent_type or detect_agent(req.message)
    msg_id     = str(uuid.uuid4())
    start      = datetime.now(timezone.utc)
    user_id    = user.id if user else None

    # Do all DB work BEFORE starting the stream generator
    # (SQLAlchemy async sessions can't be used inside async generators safely)
    await _ensure_session(db, session_id, req.message, user)
    history = await _load_history(db, session_id)
    db.add(Message(session_id=session_id, role="user", content=req.message))
    await db.flush()

    # Snapshot the values we need inside the generator (no db reference)
    snap_session_id = session_id
    snap_agent_type = agent_type
    snap_msg_id     = msg_id
    snap_start      = start
    snap_user_id    = user_id
    snap_message    = req.message
    snap_history    = history

    async def generate():
        full_content: list[str] = []

        try:
            async for token in stream_response(snap_message, snap_agent_type, snap_history):
                full_content.append(token)
                payload = json.dumps({"token": token, "session_id": snap_session_id})
                yield f"data: {payload}\n\n"

            content = "".join(full_content)
            elapsed = int((datetime.now(timezone.utc) - snap_start).total_seconds() * 1000)
            tokens  = len(content.split()) * 2

            # Persist with a FRESH session (safe to use after streaming)
            from app.models.database import async_session
            async with async_session() as fresh_db:
                fresh_db.add(Message(
                    id=snap_msg_id,
                    session_id=snap_session_id,
                    role="assistant",
                    content=content,
                    agent_type=snap_agent_type,
                    agent_name=AGENT_NAMES.get(snap_agent_type, "Agent"),
                    tokens=tokens,
                    processing_time_ms=elapsed,
                    model=_model_name(),
                ))
                fresh_db.add(ActivityLog(
                    user_id=snap_user_id,
                    type="message",
                    title=f"{AGENT_NAMES.get(snap_agent_type, 'Agent')} responded",
                    description=snap_message[:120],
                ))
                await fresh_db.commit()

            done_payload = json.dumps({
                "done":               True,
                "id":                 snap_msg_id,
                "agent_type":         snap_agent_type,
                "agent_name":         AGENT_NAMES.get(snap_agent_type, "Agent"),
                "session_id":         snap_session_id,
                "processing_time_ms": elapsed,
                "tokens":             tokens,
                "timestamp":          datetime.now(timezone.utc).isoformat(),
            })
            yield f"data: {done_payload}\n\n"

        except Exception as exc:
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
