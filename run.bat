@echo off
title PIVOTT App Launcher
echo ========================================================
echo Starting PIVOTT App...
echo ========================================================
echo.

start "PIVOTT Server" node server/index.js
timeout /t 2 /nobreak >nul

echo Opening browser at http://localhost:5000...
start http://localhost:5000

echo.
echo ========================================================
echo PIVOTT is now RUNNING!
echo Local PC: http://localhost:5000
echo Mobile Cloud Tunnel: Check the terminal or scan QR code
echo ========================================================
