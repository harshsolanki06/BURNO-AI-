"""
EchoVerse AI OS — Claude API Client
Async wrapper for Anthropic Claude API with demo-mode fallback
"""
from app.core.config import settings
from app.services.agent import AGENT_SYSTEM_PROMPTS


async def call_claude(
    message: str,
    agent_type: str,
    session_id: str,
    history: list[dict] | None = None,
) -> str:
    """
    Call the Claude API with an agent-specific system prompt and conversation history.
    history: list of {"role": "user"|"assistant", "content": str} dicts (oldest first).
    Falls back to a demo response if the API key isn't configured.
    """
    if settings.ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            system = AGENT_SYSTEM_PROMPTS.get(agent_type, AGENT_SYSTEM_PROMPTS["productivity"])

            # Build messages: prior history + current user turn
            messages = list(history or [])
            messages.append({"role": "user", "content": message})

            response = await client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=settings.CLAUDE_MAX_TOKENS,
                system=system,
                messages=messages,
            )
            return response.content[0].text
        except Exception as e:
            return f"[API Error] {agent_type.title()} Agent encountered an error: {str(e)}"

    # Demo-mode fallback — rich responses that demonstrate each agent's personality
    demo_responses = {
        "research": (
            f"🔍 **Research Agent** — Demo Mode\n\n"
            f"Received query: *\"{message}\"*\n\n"
            f"In production, I would:\n"
            f"• Search 12+ sources across the web\n"
            f"• Cross-reference and fact-check findings\n"
            f"• Deliver a structured, cited research report\n\n"
            f"→ Configure `ANTHROPIC_API_KEY` to activate live research."
        ),
        "coding": (
            f"💻 **Coding Agent** — Demo Mode\n\n"
            f"Received request: *\"{message}\"*\n\n"
            f"In production, I would:\n"
            f"• Generate clean, production-ready code\n"
            f"• Include inline comments and type hints\n"
            f"• Suggest optimizations and best practices\n\n"
            f"→ Configure `ANTHROPIC_API_KEY` to activate live coding."
        ),
        "automation": (
            f"⚡ **Automation Agent** — Demo Mode\n\n"
            f"Received command: *\"{message}\"*\n\n"
            f"In production, I would:\n"
            f"• Launch browser/desktop automation\n"
            f"• Execute multi-step workflows\n"
            f"• Report progress in real-time\n\n"
            f"→ Configure `ANTHROPIC_API_KEY` to activate live automation."
        ),
        "productivity": (
            f"📊 **Productivity Agent** — Demo Mode\n\n"
            f"Received: *\"{message}\"*\n\n"
            f"In production, I would:\n"
            f"• Manage tasks, schedules, and priorities\n"
            f"• Draft emails and documents\n"
            f"• Track project progress\n\n"
            f"→ Configure `ANTHROPIC_API_KEY` to activate."
        ),
        "vision": (
            f"👁️ **Vision Agent** — Demo Mode\n\n"
            f"Received: *\"{message}\"*\n\n"
            f"In production, I would:\n"
            f"• Analyze screen content and images\n"
            f"• Extract text via OCR\n"
            f"• Detect objects and faces\n\n"
            f"→ Configure `ANTHROPIC_API_KEY` to activate."
        ),
        "memory": (
            f"🧠 **Memory Agent** — Demo Mode\n\n"
            f"Received: *\"{message}\"*\n\n"
            f"In production, I would:\n"
            f"• Retrieve relevant conversation context\n"
            f"• Recall user preferences and patterns\n"
            f"• Build context for other agents\n\n"
            f"→ Configure `ANTHROPIC_API_KEY` to activate."
        ),
    }

    return demo_responses.get(agent_type, demo_responses["productivity"])
