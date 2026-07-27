@echo off
title BURNO AI — Shutdown
color 0C

echo.
echo  Stopping BURNO AI servers...
echo.

taskkill /F /FI "WINDOWTITLE eq BURNO Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq BURNO Frontend*" >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

:: Kill node processes running on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill python processes running on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo  [✓] All BURNO AI servers stopped.
echo.
timeout /t 2 /nobreak >nul
