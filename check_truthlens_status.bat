@echo off
title TruthLens AI - Status & Operations Check
cd /d "%~dp0"
.\backend\venv\Scripts\python analytics_dashboard\check_status.py
pause
