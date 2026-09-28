@echo off
echo =========================================================================
echo SRM MADURAI COLLEGE FOR ENGINEERING & TECHNOLOGY - UNIFIED ERP SYSTEM
echo =========================================================================
echo All Modules Integrated: Semester Results, Medical & Disciplinary, Extra-Curricular
echo Single Portal, Single Login, Shared Common Student Database
echo.

echo [1/2] Starting Unified FastAPI Backend on http://127.0.0.1:8000 ...
start "SRM ERP - Unified Backend (Port 8000)" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Unified React Frontend on http://localhost:5173 ...
start "SRM ERP - Unified Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================================
echo UNIFIED ERP PORTAL IS RUNNING!
echo.
echo Portal Web Address:        http://localhost:5173
echo  - Semester Results:       http://localhost:5173/results
echo  - Medical & Disciplinary: http://localhost:5173/medical-disciplinary
echo  - Extra-Curricular:       http://localhost:5173/extra-curricular
echo  - Admin Cell Console:     http://localhost:5173/admin
echo.
echo Unified API Docs:          http://127.0.0.1:8000/docs
echo.
echo Demo Credentials:
echo  - Administrator:         admin / admin123
echo  - CSE Faculty:           prof.kumar / kumar123
echo  - IT Faculty:            prof.meena / meena123
echo =========================================================================
pause
