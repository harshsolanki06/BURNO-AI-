"""
EchoVerse AI OS — Task Schemas
"""
from typing import Optional
from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str
    agent_type: str


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    agent_type: str
    progress: int = 0
    result: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None

    class Config:
        from_attributes = True
