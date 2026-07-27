# BURNO AI — PowerShell Startup Script
# Usage from VS Code terminal: powershell -ExecutionPolicy Bypass -File ".\start-burno.ps1"

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "  BURNO AI - Personal Intelligence Engine v2.0" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor DarkCyan
Write-Host ""

# Get paths
$ROOT = "C:\Users\solan\Downloads\My Assistant"
$BACKEND = "$ROOT\backend"
$FRONTEND = "$ROOT\frontend"

# ── Start Backend ──────────────────────────────────────────────────────────────
Write-Host "  [1/2] Starting Backend (FastAPI on port 8000)..." -ForegroundColor Yellow

$backendCmd = "cd `"$BACKEND`"; Write-Host 'BURNO BACKEND RUNNING' -ForegroundColor Green; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 3

# ── Start Frontend ─────────────────────────────────────────────────────────────
Write-Host "  [2/2] Starting Frontend (Next.js on port 3000)..." -ForegroundColor Yellow

$frontendCmd = "cd `"$FRONTEND`"; Write-Host 'BURNO FRONTEND RUNNING' -ForegroundColor Blue; npm run dev"
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $frontendCmd

Start-Sleep -Seconds 6

# ── Open browser ───────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ================================================" -ForegroundColor DarkCyan
Write-Host "  [OK] BURNO AI is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "      Frontend  ->  http://localhost:3000" -ForegroundColor Cyan
Write-Host "      Backend   ->  http://localhost:8000" -ForegroundColor Cyan
Write-Host "      API Docs  ->  http://localhost:8000/docs" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Opening browser..." -ForegroundColor DarkGray
Write-Host "  ================================================" -ForegroundColor DarkCyan
Write-Host ""

Start-Process "http://localhost:3000"

Write-Host "  Done! Close the two windows to stop BURNO AI." -ForegroundColor Green
Write-Host ""
