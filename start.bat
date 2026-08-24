@echo off
setlocal enabledelayedexpansion
title EV Connect AI Launcher

:: Force current directory to the folder containing start.bat
cd /d "%~dp0"

echo ===================================================
echo   ⚡ Launching EV Connect AI Full-Stack Platform ⚡
echo ===================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check server dependencies
if not exist "server\node_modules\" (
    echo [INFO] Installing server dependencies...
    cd /d "%~dp0server" && call npm install
    cd /d "%~dp0"
)

:: Check client dependencies
if not exist "client\node_modules\" (
    echo [INFO] Installing client dependencies...
    cd /d "%~dp0client" && call npm install
    cd /d "%~dp0"
)

echo 1. Starting Backend API Server (Port 5000)...
start "EVConnect AI Backend Server" cmd /k "cd /d \"%~dp0server\" && npm start"

echo 2. Starting Frontend Web Client (Port 5173)...
start "EVConnect AI Frontend Client" cmd /k "cd /d \"%~dp0client\" && npm run dev"

echo.
echo ===================================================
echo   ⚡ EV Connect AI is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ===================================================
echo Opening application in your default browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173

exit /b 0
