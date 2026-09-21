@echo off
title Pivott AI - Study Planner & Mobile Hub
color 0A

echo ========================================================
echo   PIVOTT AI - STUDY PLANNER & MOBILE AUTO-LOGIN HUB
echo ========================================================
echo.

set "NODE_BIN=C:\Users\Entertainment\AppData\Local\OpenAI\Codex\runtimes\cua_node\6f12e0ef1c6e5061\bin"
if exist "%NODE_BIN%\node.exe" (
    set "PATH=%NODE_BIN%;%PATH%"
)

echo [1/3] Checking Node.js environment...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found in PATH or Codex runtime.
    pause
    exit /b 1
)

echo [2/3] Starting Pivott Backend Server (Port 5000)...
start /b cmd /c "node server\index.js"

echo [3/3] Starting Tunnel Watchdog & 24/7 Auto-Healer...
start /b cmd /c "node server\tunnel-watchdog.js"

echo.
echo Waiting 3 seconds for server initialization...
timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   [SUCCESS] Pivott is running!
echo   Mobile Login Hub: http://localhost:5000/mobile-login
echo   Opening Mobile Login Hub in your browser...
echo ========================================================
start "" "http://localhost:5000/mobile-login"

echo.
echo NOTE: Keep this window open or minimized to keep the
echo       server and mobile QR codes active 24/7.
echo.
pause
