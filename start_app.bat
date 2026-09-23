@echo off
echo ==========================================================
echo Starting SRM MCET Semester Results Module (FastAPI + React)
echo ==========================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SRM ERP - FastAPI Backend" cmd /k "cd /d D:\SRM_ERP\backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "SRM ERP - React Frontend" cmd /k "cd /d D:\SRM_ERP\frontend && npm run dev"

echo.
echo ==========================================================
echo System is running!
echo Frontend: http://localhost:5173
echo Backend API docs: http://127.0.0.1:8000/docs
echo ==========================================================
pause
