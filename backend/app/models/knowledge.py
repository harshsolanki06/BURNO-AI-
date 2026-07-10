"""
BURNO AI OS — Knowledge Document ORM Model
"""
import json
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base, generate_uuid


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)   # pdf, txt, md, docx
    content: Mapped[str] = mapped_column(Text, nullable=False)           # full extracted text
    chunks_json: Mapped[str] = mapped_column(Text, nullable=True)        # JSON list of chunk strings
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="ready")     # ready | error
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def get_chunks(self) -> list:
        if self.chunks_json:
            return json.loads(self.chunks_json)
        return []
