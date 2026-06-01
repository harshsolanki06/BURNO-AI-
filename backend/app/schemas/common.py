"""
EchoVerse AI OS — Common Schemas
"""
from typing import Optional, Any
from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    error: Optional[str] = None
    timestamp: str
