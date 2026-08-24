@echo off
setlocal enabledelayedexpansion
title EV Connect AI Launcher

:: Force current working directory to the folder containing this batch file
cd /d "%~dp0"

echo ===================================================
echo   ⚡ Launching EV Connect AI Full-Stack Platform ⚡
echo ===================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found in your system PATH!
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Launch the single-command runner
echo Starting platform via node start.js...
node start.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] An error occurred while running EV Connect AI.
    pause
)
