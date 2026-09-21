@echo off
set "PATH=C:\Users\Entertainment\AppData\Local\OpenAI\Codex\runtimes\cua_node\6f12e0ef1c6e5061\bin;%PATH%"

echo ===================================================
echo   PIVOTT - AI-Powered Syllabus Backlog Allocator
echo ===================================================
echo.
echo Starting Backend API on http://localhost:5000...
start cmd /k "title Pivott Server && set PATH=C:\Users\Entertainment\AppData\Local\OpenAI\Codex\runtimes\cua_node\6f12e0ef1c6e5061\bin;%%PATH%% && node server/index.js"

timeout /t 2 >nul

echo Starting Frontend on http://localhost:5173...
start cmd /k "title Pivott Client && set PATH=C:\Users\Entertainment\AppData\Local\OpenAI\Codex\runtimes\cua_node\6f12e0ef1c6e5061\bin;%%PATH%% && cd client && npm run dev"

echo.
echo Pivott is launching!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
