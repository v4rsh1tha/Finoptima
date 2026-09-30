@echo off
REM ============================================================
REM  FinOptima — First-Time Setup
REM
REM  Run this ONCE after downloading/extracting the project.
REM  It installs backend (Python) and frontend (Node) dependencies
REM  and sets up the frontend's environment file.
REM
REM  After this finishes, use start-finoptima.bat every time you
REM  want to run the app - you won't need to run this again unless
REM  you download a fresh copy of the project.
REM ============================================================

set PROJECT_DIR=%~dp0

echo ==============================================
echo  Step 1/3: Installing backend (Python) packages
echo ==============================================
cd /d "%PROJECT_DIR%backend"
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo [ERROR] pip install failed. Make sure Python is installed
    echo and available as "python" / "pip" from this terminal.
    pause
    exit /b 1
)

echo.
echo ==============================================
echo  Step 2/3: Installing frontend (Node) packages
echo  ^(this can take a minute or two the first time^)
echo ==============================================
cd /d "%PROJECT_DIR%frontend"
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. Make sure Node.js is installed
    echo and available as "npm" from this terminal.
    pause
    exit /b 1
)

echo.
echo ==============================================
echo  Step 3/3: Setting up frontend environment file
echo ==============================================
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo Created .env from .env.example
) else (
    echo .env already exists - leaving it as is.
)

echo.
echo ==============================================
echo  Setup complete!
echo  From now on, just double-click start-finoptima.bat
echo  to run the app.
echo ==============================================
pause
