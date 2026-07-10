"""
BURNO AI OS — Workflow ORM Models
WorkflowTemplate: saved chains of steps
WorkflowRun: execution history for each run
"""
import json
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base, generate_uuid


class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    steps_json: Mapped[str] = mapped_column(Text, nullable=False)     # JSON list of step dicts
    icon: Mapped[str] = mapped_column(String(10), default="⚡")
    color: Mapped[str] = mapped_column(String(20), default="#00d4ff")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def get_steps(self) -> list:
        return json.loads(self.steps_json) if self.steps_json else []


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    workflow_id: Mapped[str] = mapped_column(String(36), nullable=False)
    workflow_name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="running")  # running|completed|failed
    steps_result_json: Mapped[str] = mapped_column(Text, nullable=True) # JSON list of step results
    input_vars_json: Mapped[str] = mapped_column(Text, nullable=True)   # JSON dict of input vars
    error: Mapped[str] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    def get_results(self) -> list:
        return json.loads(self.steps_result_json) if self.steps_result_json else []
