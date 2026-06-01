"""
EchoVerse AI OS — Chat Schemas
Pydantic models for chat request/response
"""
from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    agent_type: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    id: str
    content: str
    agent_type: str
    agent_name: str
    session_id: str
    processing_time_ms: int
    tokens: int
    timestamp: str
