"""
EchoVerse AI OS — WebSocket Connection Manager
Real-time bidirectional communication with chat, typing, and ping support
"""
from datetime import datetime, timezone
from typing import Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from app.services.agent import detect_agent
from app.services.claude import call_claude


class ConnectionManager:
    """Manages active WebSocket connections by session ID."""

    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, ws: WebSocket, session_id: str):
        await ws.accept()
        self.active[session_id] = ws
        print(f"[WS] Connected: {session_id} (total: {len(self.active)})")

    def disconnect(self, session_id: str):
        self.active.pop(session_id, None)
        print(f"[WS] Disconnected: {session_id}")

    async def send(self, session_id: str, data: dict):
        if ws := self.active.get(session_id):
            await ws.send_json(data)

    async def broadcast(self, data: dict):
        for ws in self.active.values():
            try:
                await ws.send_json(data)
            except Exception:
                pass


# Singleton manager
manager = ConnectionManager()


def register_ws(app: FastAPI):
    """Register the WebSocket endpoint on the app."""

    @app.websocket("/ws/{session_id}")
    async def websocket_endpoint(ws: WebSocket, session_id: str):
        await manager.connect(ws, session_id)
        try:
            # Send welcome
            await ws.send_json({
                "type": "connected",
                "session_id": session_id,
                "message": "EchoVerse AI OS - WebSocket connected",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

            # Message loop
            while True:
                data = await ws.receive_json()
                msg_type = data.get("type", "")

                if msg_type == "chat":
                    agent = detect_agent(data.get("message", ""))
                    await ws.send_json({"type": "typing", "agent": agent})
                    content = await call_claude(data["message"], agent, session_id)
                    await ws.send_json({
                        "type": "response",
                        "content": content,
                        "agent_type": agent,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

                elif msg_type == "ping":
                    await ws.send_json({
                        "type": "pong",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

        except WebSocketDisconnect:
            manager.disconnect(session_id)
        except Exception:
            manager.disconnect(session_id)
