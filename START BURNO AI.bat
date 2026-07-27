@echo off
title BURNO AI — Startup
color 0B

echo.
echo  ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ ██████╗      █████╗ ██╗
echo  ██╔══██╗██║   ██║██╔══██╗████╗  ██║██╔═══██╗    ██╔══██╗██║
echo  ██████╔╝██║   ██║██████╔╝██╔██╗ ██║██║   ██║    ███████║██║
echo  ██╔══██╗██║   ██║██╔══██╗██║╚██╗██║██║   ██║    ██╔══██║██║
echo  ██████╔╝╚██████╔╝██║  ██║██║ ╚████║╚██████╔╝    ██║  ██║██║
echo  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═╝╚═╝
echo.
echo  Personal Intelligence Engine v2.0
echo  ════════════════════════════════════════════════════════════
echo.

:: ── Set project root ──────────────────────────────────────────────────────────
set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

echo  [1/2] Starting Backend (FastAPI on port 8000)...
start "BURNO Backend" cmd /k "cd /d "%BACKEND%" && color 0A && echo  BURNO AI Backend && echo  ─────────────────────── && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Brief pause so backend gets a head start
timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend (Next.js on port 3000)...
start "BURNO Frontend" cmd /k "cd /d "%FRONTEND%" && color 09 && echo  BURNO AI Frontend && echo  ─────────────────────── && npm run dev"

:: Wait a moment then open the browser
timeout /t 5 /nobreak >nul

echo.
echo  ════════════════════════════════════════════════════════════
echo  [✓] BURNO AI is launching...
echo.
echo      Frontend  →  http://localhost:3000
echo      Backend   →  http://localhost:8000
echo      API Docs  →  http://localhost:8000/docs
echo.
echo  Opening browser...
echo  ════════════════════════════════════════════════════════════
echo.

start http://localhost:3000

echo  Both servers are running in separate windows.
echo  Close those windows to stop BURNO AI.
echo.
pause
