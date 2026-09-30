@echo off
REM ============================================================
REM  FinOptima — One-Click Launcher
REM
REM  Double-click this file (or right-click > Run) to start both
REM  the backend (Flask API, port 5000) and the frontend
REM  (React app, port 3000) automatically, each in its own window.
REM
REM  Keep both windows open while you use the app.
REM  Close them (or press Ctrl+C inside each) when you're done.
REM ============================================================

REM %~dp0 = the folder this .bat file lives in, so it works no
REM matter where you moved/extracted the project to.
set PROJECT_DIR=%~dp0

echo Starting FinOptima backend (Flask, port 5000)...
start "FinOptima Backend" cmd /k "cd /d "%PROJECT_DIR%backend" && python app.py"

REM Give the backend a couple seconds head start before the
REM frontend boots up and tries to talk to it.
timeout /t 3 /nobreak >nul

echo Starting FinOptima frontend (React, port 3000)...
start "FinOptima Frontend" cmd /k "cd /d "%PROJECT_DIR%frontend" && npm start"

echo.
echo Both servers are starting in separate windows.
echo   Backend:  http://127.0.0.1:5000
echo   Frontend: http://localhost:3000  (opens automatically in your browser)
echo.
echo You can close THIS window - the two server windows will keep running.
pause
