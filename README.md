# 🌌 BURNO AI OS

<div align="center">

![BURNO Banner](https://img.shields.io/badge/BURNO-AI%20OS%20v2.0-00f0ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzAwZjBmZiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01LTEwIDV6Ii8+PC9zdmc+)

**A futuristic AI-powered operating assistant inspired by JARVIS**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Claude](https://img.shields.io/badge/Claude-Sonnet-orange?style=flat-square)](https://anthropic.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)

</div>

---

## ✨ Features

| Feature | Technology | Status |
|---------|-----------|--------|
| 🎙️ Voice Assistant | Whisper STT + ElevenLabs TTS | ✅ Ready |
| 🤖 Multi-Agent System | Claude API + Orchestrator | ✅ Ready |
| 🧠 Memory System | ChromaDB + Vector Embeddings | ✅ Ready |
| ⚡ Automation Engine | Playwright + PyAutoGUI | ✅ Ready |
| 👁️ Computer Vision | OpenCV + YOLOv8 + MediaPipe | ✅ Ready |
| 🌌 Futuristic UI | Framer Motion + Three.js | ✅ Ready |
| 🔒 Authentication | JWT + bcrypt | ✅ Ready |
| 📡 Real-time | WebSockets | ✅ Ready |

---

## 🏗️ Architecture

```
BURNO AI OS
├── frontend/                    # Next.js 15 + TypeScript + TailwindCSS
│   └── src/
│       ├── app/                 # App Router pages
│       ├── components/
│       │   ├── layout/          # Sidebar, TopBar
│       │   ├── chat/            # AI Chat Interface
│       │   ├── voice/           # Voice Visualizer
│       │   └── dashboard/       # Widgets, Stats, Agents
│       ├── hooks/               # useChat, useVoice, useSystemStatus
│       ├── lib/                 # Utils, constants
│       └── types/               # TypeScript definitions
│
└── backend/                     # FastAPI Python
    ├── main.py                  # App entry + routes + WebSocket
    ├── config.py                # Pydantic settings
    ├── schema.sql               # PostgreSQL schema
    └── requirements.txt         # Python dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (optional, SQLite fallback included)

### 1. Frontend Setup

```bash
cd frontend
npm install
cp ../.env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

Frontend runs at → **http://localhost:3000**

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python main.py
```

Backend runs at → **http://localhost:8000**

API docs → **http://localhost:8000/docs**

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Backend (`backend/.env`)
```env
ANTHROPIC_API_KEY=sk-ant-...        # Claude API
OPENAI_API_KEY=sk-...               # Whisper STT
ELEVENLABS_API_KEY=...              # TTS
DATABASE_URL=postgresql://...       # PostgreSQL
SECRET_KEY=your-secret-key          # JWT
```

---

## 🤖 Agent System

The multi-agent orchestrator routes requests to specialized agents:

| Agent | Trigger Keywords | Responsibility |
|-------|-----------------|----------------|
| 🔍 Research | search, find, research, news | Web research & summarization |
| 💻 Coding | code, debug, program, fix | Code generation & debugging |
| ⚡ Automation | open, browser, automate, click | App & browser control |
| 📊 Productivity | task, schedule, email, plan | Task & calendar management |
| 👁️ Vision | screen, image, see, detect | Visual analysis & OCR |
| 🧠 Memory | remember, recall, history | Context & preference storage |

---

## 🎙️ Voice Pipeline

```
User Speaks
    ↓
Wake Word Detection ("Echo")
    ↓
OpenAI Whisper STT → Text Transcript
    ↓
Agent Orchestrator → Best Agent
    ↓
Claude API → AI Response
    ↓
ElevenLabs TTS → Voice Output
    ↓
Real-time Waveform Visualization
```

---

## 📡 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connected` | Server→Client | Session established |
| `chat` | Client→Server | Send message |
| `typing` | Server→Client | Agent processing |
| `response` | Server→Client | AI response |
| `activity` | Server→Client | Live activity update |
| `ping/pong` | Both | Keep-alive |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Railway
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 📄 License

MIT © BURNO AI OS

---

<div align="center">
Built with ❤️ by an AI engineer
<br/>
<strong>BURNO AI OS — Where Intelligence Meets Interface</strong>
</div>
