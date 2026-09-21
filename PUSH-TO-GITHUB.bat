@echo off
title Push Pivott to GitHub
cd /d "%~dp0"
echo ========================================================
echo   PIVOTT - PUSH TO GITHUB REPOSITORY
echo   Target: https://github.com/aadikr205/pivott.git
echo ========================================================
echo.

set "GIT_EXE=%USERPROFILE%\.tools\git\cmd\git.exe"

if not exist "%GIT_EXE%" (
    echo Error: Git not found at %GIT_EXE%
    pause
    exit /b 1
)

echo [1/2] Verifying local branch and remote...
"%GIT_EXE%" branch -M main
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin https://github.com/aadikr205/pivott.git
echo Remote origin set to: https://github.com/aadikr205/pivott.git
echo.

echo [2/2] Pushing branch 'main' to GitHub...
echo (If prompted, enter your GitHub Username and Personal Access Token)
echo.
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! All code has been pushed to GitHub!
    echo   URL: https://github.com/aadikr205/pivott
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   Push failed or was cancelled.
    echo   Note: If GitHub asks for a password, you must use a
    echo   Personal Access Token (PAT) from:
    echo   https://github.com/settings/tokens
    echo ========================================================
)

echo.
pause
