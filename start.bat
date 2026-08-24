@echo off
echo ===================================================
echo   ⚡ Launching EVConnect AI Full-Stack Platform ⚡
echo ===================================================
echo.
echo 1. Starting Backend API Server (Port 5000)...
start "EVConnect AI Server" cmd /k "cd server && npm start"

echo 2. Starting Frontend Web Client (Port 5173)...
start "EVConnect AI Client" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo   EVConnect AI is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ===================================================
timeout /t 3
start http://localhost:5173
