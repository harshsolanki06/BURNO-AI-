@echo off
title BURNO AI Startup
color 0B

echo.
echo  BURNO AI - Personal Intelligence Engine v2.0
echo  ================================================
echo.

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

echo  [1/2] Starting Backend on port 8000...
start "BURNO-Backend" cmd /k "cd /d "%BACKEND%" && color 0A && echo BURNO AI Backend Running && echo ──────────────────── && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend on port 3000...
start "BURNO-Frontend" cmd /k "cd /d "%FRONTEND%" && color 09 && echo BURNO AI Frontend Running && echo ──────────────────── && npm run dev"

timeout /t 6 /nobreak >nul

echo.
echo  ================================================
echo  [OK] Both servers are running!
echo.
echo      Frontend  -^>  http://localhost:3000
echo      Backend   -^>  http://localhost:8000
echo  ================================================
echo.
echo  Opening browser...

start http://localhost:3000

echo.
echo  Close the two command windows to stop BURNO AI.
pause
