@echo off
setlocal enabledelayedexpansion
title EV Connect AI Launcher

:: Force current working directory to the folder containing this batch file
cd /d "%~dp0"

echo ===================================================
echo   ⚡ EV Connect AI Full-Stack Launcher ⚡
echo ===================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found in your system PATH!
    echo Please download and install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Check and install server dependencies if missing
if not exist "server\node_modules\" (
    echo [INFO] Installing server dependencies...
    cd /d "%~dp0server"
    call npm install
    cd /d "%~dp0"
)

:: 3. Check and install client dependencies if missing
if not exist "client\node_modules\" (
    echo [INFO] Installing client dependencies...
    cd /d "%~dp0client"
    call npm install
    cd /d "%~dp0"
)

:: 4. Start the platform
echo [INFO] Starting EV Connect AI servers...
echo.
echo ===================================================
echo   ⚡ Live Website:   http://localhost:5000
echo   ⚡ Vite Dev Port:  http://localhost:5173
echo ===================================================
echo.

:: Open browser automatically to http://localhost:5000
start http://localhost:5000

:: Run the server directly in this window
node start.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with an error.
    pause
)
