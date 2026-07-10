"""
BURNO AI OS — Multi-Provider AI Service  
Priority: Groq (free/fast) → Anthropic (Claude) → OpenAI → Gemini → Smart Demo
Supports both streaming and non-streaming modes.
"""
from __future__ import annotations
from typing import List, Dict, Optional, AsyncIterator
from app.core.config import settings
from app.services.agent import AGENT_SYSTEM_PROMPTS, AGENT_NAMES

Messages = List[Dict[str, str]]


# ─── Provider: Groq (FREE, ultra-fast llama3) ─────────────────────────────────
async def _stream_groq(messages: Messages, system: str) -> AsyncIterator[str]:
    if not settings.GROQ_API_KEY:
        return
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
        stream = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "system", "content": system}] + messages,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            temperature=0.7,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as e:
        print(f"[Groq stream] Error: {e}")


async def _call_groq(messages: Messages, system: str) -> Optional[str]:
    if not settings.GROQ_API_KEY:
        return None
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
        resp = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "system", "content": system}] + messages,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            temperature=0.7,
        )
        return resp.choices[0].message.content
    except Exception as e:
        print(f"[Groq] Error: {e}")
        return None


# ─── Provider: Anthropic Claude ───────────────────────────────────────────────
async def _stream_anthropic(messages: Messages, system: str) -> AsyncIterator[str]:
    if not settings.ANTHROPIC_API_KEY:
        return
    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        async with client.messages.stream(
            model=settings.CLAUDE_MODEL,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            system=system,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
    except Exception as e:
        print(f"[Anthropic stream] Error: {e}")


async def _call_anthropic(messages: Messages, system: str) -> Optional[str]:
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        resp = await client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            system=system,
            messages=messages,
        )
        return resp.content[0].text
    except Exception as e:
        print(f"[Anthropic] Error: {e}")
        return None


# ─── Provider: OpenAI ─────────────────────────────────────────────────────────
async def _stream_openai(messages: Messages, system: str) -> AsyncIterator[str]:
    if not settings.OPENAI_API_KEY:
        return
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        stream = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "system", "content": system}] + messages,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as e:
        print(f"[OpenAI stream] Error: {e}")


async def _call_openai(messages: Messages, system: str) -> Optional[str]:
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        resp = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "system", "content": system}] + messages,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
        )
        return resp.choices[0].message.content
    except Exception as e:
        print(f"[OpenAI] Error: {e}")
        return None


# ─── Provider: Google Gemini (FREE) ───────────────────────────────────────────
async def _call_gemini(messages: Messages, system: str) -> Optional[str]:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=system,
        )
        history = []
        for m in messages[:-1]:
            history.append({
                "role": "user" if m["role"] == "user" else "model",
                "parts": [m["content"]],
            })
        chat = model.start_chat(history=history)
        resp = await chat.send_message_async(messages[-1]["content"])
        return resp.text
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return None


# ─── Smart Demo (always works, no API key needed) ─────────────────────────────
def _smart_demo(message: str, agent_type: str) -> str:
    msg = message.lower()

    if any(w in msg for w in ["hello", "hi ", "hey", "what can you", "who are you", "introduce"]):
        return (
            "Hello! I'm BURNO AI OS -- your intelligent multi-agent assistant.\n\n"
            "I have 6 specialized agents ready to help:\n"
            "- Research Agent: web research, summarization, fact-checking\n"
            "- Coding Agent: code generation, debugging, optimization\n"
            "- Automation Agent: browser control, workflow automation\n"
            "- Productivity Agent: tasks, scheduling, project management\n"
            "- Vision Agent: screen analysis, OCR, object detection\n"
            "- Memory Agent: context storage and semantic recall\n\n"
            "DEMO MODE ACTIVE -- To enable live AI:\n"
            "1. Go to console.groq.com (free account, takes 1 min)\n"
            "2. Create an API key\n"
            "3. Add GROQ_API_KEY=your-key to backend/.env\n"
            "4. Restart the backend server"
        )

    if any(w in msg for w in ["python", "javascript", "typescript", "code", "function", "class", "script", "program"]):
        return (
            "Coding Agent (Demo Mode)\n\n"
            "I'd write production-ready code for your request.\n\n"
            "Example structure:\n"
            "```python\ndef solution(input_data):\n"
            "    # Clean, typed, documented code\n"
            "    # With error handling and best practices\n"
            "    result = process(input_data)\n"
            "    return result\n```\n\n"
            "To get live code generation:\n"
            "Get a free Groq key at console.groq.com -> add GROQ_API_KEY to .env"
        )

    if any(w in msg for w in ["search", "find", "research", "news", "latest", "what is", "explain", "how does", "tell me"]):
        return (
            "Research Agent (Demo Mode)\n\n"
            f"Query: \"{message[:80]}\"\n\n"
            "In live mode I would:\n"
            "- Search 10+ authoritative sources\n"
            "- Cross-reference and fact-check\n"
            "- Deliver a structured cited report\n\n"
            "To activate: Get a free Groq key at console.groq.com"
        )

    if any(w in msg for w in ["task", "todo", "schedule", "plan", "remind", "organize", "project", "help"]):
        return (
            "Productivity Agent (Demo Mode)\n\n"
            f"Request: \"{message[:80]}\"\n\n"
            "I can manage your tasks, schedules and projects.\n"
            "In live mode I'll create structured plans and track progress.\n\n"
            "To activate: Add GROQ_API_KEY from console.groq.com to your .env"
        )

    agent_label = AGENT_NAMES.get(agent_type, "BURNO")
    return (
        f"{agent_label} (Demo Mode)\n\n"
        f"Received: \"{message[:100]}\"\n\n"
        "I'm ready to process this in live mode.\n\n"
        "Quick setup for free live AI:\n"
        "1. Visit console.groq.com (free)\n"
        "2. Create an API key\n"
        "3. Add GROQ_API_KEY=your-key to backend/.env\n"
        "4. Restart the backend -- done!\n\n"
        "Alternative: aistudio.google.com for free Gemini -> GEMINI_API_KEY"
    )


# ─── Public API: non-streaming ────────────────────────────────────────────────
async def call_claude(
    message: str,
    agent_type: str,
    session_id: str,
    history: List[Dict[str, str]] | None = None,
) -> str:
    """Try all providers in order, fall back to smart demo."""
    system = AGENT_SYSTEM_PROMPTS.get(agent_type, AGENT_SYSTEM_PROMPTS["productivity"])
    messages: Messages = list(history or []) + [{"role": "user", "content": message}]

    for fn, name in [
        (_call_groq,      "Groq"),
        (_call_anthropic, "Claude"),
        (_call_openai,    "OpenAI"),
        (_call_gemini,    "Gemini"),
    ]:
        result = await fn(messages, system)
        if result:
            print(f"[AI] {name} | agent={agent_type}")
            return result

    print("[AI] Demo mode")
    return _smart_demo(message, agent_type)


# ─── Public API: streaming ────────────────────────────────────────────────────
async def stream_response(
    message: str,
    agent_type: str,
    history: List[Dict[str, str]] | None = None,
) -> AsyncIterator[str]:
    """
    Stream tokens as they arrive. Tries Groq first (fastest), then Claude.
    Falls back to yielding the full demo response at once.
    """
    system = AGENT_SYSTEM_PROMPTS.get(agent_type, AGENT_SYSTEM_PROMPTS["productivity"])
    messages: Messages = list(history or []) + [{"role": "user", "content": message}]

    # Try Groq streaming (fastest)
    if settings.GROQ_API_KEY:
        had_content = False
        async for token in _stream_groq(messages, system):
            had_content = True
            yield token
        if had_content:
            print(f"[AI-Stream] Groq | agent={agent_type}")
            return

    # Try Claude streaming
    if settings.ANTHROPIC_API_KEY:
        had_content = False
        async for token in _stream_anthropic(messages, system):
            had_content = True
            yield token
        if had_content:
            print(f"[AI-Stream] Claude | agent={agent_type}")
            return

    # Try OpenAI streaming
    if settings.OPENAI_API_KEY:
        had_content = False
        async for token in _stream_openai(messages, system):
            had_content = True
            yield token
        if had_content:
            print(f"[AI-Stream] OpenAI | agent={agent_type}")
            return

    # Fall back to demo (yield whole response)
    print("[AI-Stream] Demo mode")
    yield _smart_demo(message, agent_type)
