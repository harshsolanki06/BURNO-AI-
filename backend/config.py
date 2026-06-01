"""
EchoVerse AI OS — Backward-compatible config re-export
Import settings from the app.core.config module.
"""
from app.core.config import settings, Settings

__all__ = ["settings", "Settings"]
