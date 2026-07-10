"""
BURNO AI OS — Voice TTS Route
POST /api/voice/speak  — Convert text to speech via ElevenLabs, stream audio back
GET  /api/voice/status — Check if TTS is configured
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(prefix="/api/voice", tags=["Voice"])


class SpeakRequest(BaseModel):
    text: str
    voice_id: str | None = None  # override default voice


@router.get("/status")
async def voice_status():
    """Check if ElevenLabs TTS is configured."""
    has_key = bool(settings.ELEVENLABS_API_KEY)
    return {
        "configured": has_key,
        "provider": "ElevenLabs" if has_key else "none",
        "voice_id": settings.ELEVENLABS_VOICE_ID if has_key else None,
    }


@router.post("/speak")
async def speak(req: SpeakRequest):
    """Convert text to audio using ElevenLabs and stream MP3 back."""
    if not settings.ELEVENLABS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ElevenLabs API key not configured. Add ELEVENLABS_API_KEY to backend/.env",
        )

    voice_id = req.voice_id or settings.ELEVENLABS_VOICE_ID or "21m00Tcm4TlvDq8ikWAM"

    # Trim text to reasonable length
    text = req.text.strip()[:2000]
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    async def audio_stream():
        try:
            import httpx
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
            headers = {
                "xi-api-key": settings.ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            }
            payload = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                },
            }
            async with httpx.AsyncClient(timeout=30) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    if resp.status_code != 200:
                        error = await resp.aread()
                        raise HTTPException(
                            status_code=resp.status_code,
                            detail=f"ElevenLabs error: {error.decode()[:200]}",
                        )
                    async for chunk in resp.aiter_bytes(chunk_size=4096):
                        yield chunk
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

    return StreamingResponse(
        audio_stream(),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-cache",
            "X-Voice-ID": voice_id,
        },
    )
