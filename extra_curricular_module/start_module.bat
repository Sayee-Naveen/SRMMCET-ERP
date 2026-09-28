@echo off
echo =========================================================================
echo Starting SRM MCET Extra-Curricular Activities ERP Module (FastAPI + React)
echo =========================================================================
echo Domains: Sports, Cultural, Clubs, NSS/NCC, Music, Dance, Literary, Social Service, Certificates
echo.

echo [1/2] Launching Extra-Curricular FastAPI Backend on http://127.0.0.1:8001 ...
start "SRM ERP - Extra-Curricular Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

echo [2/2] Launching Extra-Curricular Vite React Frontend on http://localhost:5174 ...
start "SRM ERP - Extra-Curricular Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================================
echo Module is booting up!
echo Frontend Portal:  http://localhost:5174
echo Backend Swagger:  http://127.0.0.1:8001/docs
echo =========================================================================
pause
