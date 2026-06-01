"""
EchoVerse AI OS — FastAPI Application Factory
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    from app.models.database import init_db
    print(f"[START] {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    await init_db()
    print("[OK] Database initialized")
    yield
    print("[STOP] EchoVerse shutting down...")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Futuristic AI Operating Assistant — Multi-agent, Voice, Vision, Memory",
        lifespan=lifespan,
    )

    # CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    from app.routes import chat, agents, auth, tasks, memory, system, automation
    application.include_router(system.router)
    application.include_router(auth.router)
    application.include_router(chat.router)
    application.include_router(agents.router)
    application.include_router(tasks.router)
    application.include_router(memory.router)
    application.include_router(automation.router)

    # WebSocket
    from app.ws.manager import register_ws
    register_ws(application)

    return application
