@echo off
title TruthLens AI - Standalone Operations & Analytics Dashboard
echo ============================================================
echo   TruthLens AI - Standalone Operations & Analytics Server
echo   Running at http://localhost:5050
echo ============================================================
cd /d "%~dp0"

:: Kill any existing process on port 5050
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

start http://localhost:5050
.\backend\venv\Scripts\python analytics_dashboard\server.py --port 5050
pause
