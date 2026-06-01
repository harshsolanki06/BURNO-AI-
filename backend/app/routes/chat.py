"""
EchoVerse AI OS — Chat Routes
POST /api/chat — AI-powered chat with agent routing
"""
import uuid
import traceback
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.agent import detect_agent, AGENT_NAMES
from app.services.claude import call_claude
from app.core.deps import get_db, get_current_user_optional
from app.models.message import Session as ChatSession, Message

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    try:
        start = datetime.now(timezone.utc)
        session_id = req.session_id or str(uuid.uuid4())
        agent_type = req.agent_type or detect_agent(req.message)
        msg_id = str(uuid.uuid4())

        # Ensure a chat session exists
        from sqlalchemy import select
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        chat_session = result.scalar_one_or_none()
        if chat_session is None:
            chat_session = ChatSession(
                id=session_id,
                user_id=user.id if user else None,
                title=req.message[:80],
            )
            db.add(chat_session)
            await db.flush()

        # Store user message first (flush so it's visible in DB)
        user_msg = Message(
            session_id=session_id,
            role="user",
            content=req.message,
        )
        db.add(user_msg)
        await db.flush()

        # Load conversation history (last 20 turns, oldest first, exclude current user msg)
        from sqlalchemy import select, asc
        history_result = await db.execute(
            select(Message)
            .where(Message.session_id == session_id)
            .where(Message.role.in_(["user", "assistant"]))
            .where(Message.id != user_msg.id)
            .order_by(asc(Message.created_at))
            .limit(20)
        )
        prior_messages = history_result.scalars().all()
        history = [
            {"role": m.role, "content": m.content}
            for m in prior_messages
        ]

        # Get AI response with full context
        content = await call_claude(req.message, agent_type, session_id, history=history)
        elapsed = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)
        tokens = len(content.split()) * 2  # rough estimate

        # Store assistant message
        ai_msg = Message(
            id=msg_id,
            session_id=session_id,
            role="assistant",
            content=content,
            agent_type=agent_type,
            agent_name=AGENT_NAMES.get(agent_type, "Agent"),
            tokens=tokens,
            processing_time_ms=elapsed,
            model=f"claude-{agent_type}",
        )
        db.add(ai_msg)
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
    except Exception as e:
        traceback.print_exc()
        raise

