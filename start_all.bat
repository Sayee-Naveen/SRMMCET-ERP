@echo off
echo =========================================================================
echo SRM MADURAI COLLEGE FOR ENGINEERING & TECHNOLOGY - UNIFIED ERP SYSTEM
echo =========================================================================
echo Starting All Modules: Semester Results, Medical & Disciplinary, Extra-Curricular
echo.

echo [1/4] Starting Main ERP Backend (Results, Medical, Disciplinary, Admin) on http://127.0.0.1:8000 ...
start "SRM ERP - Main Backend (Port 8000)" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/4] Starting Extra-Curricular Backend (Activities, Culturals, Sports) on http://127.0.0.1:8001 ...
start "SRM ERP - Extra-Curricular Backend (Port 8001)" cmd /k "cd /d %~dp0extra_curricular_module\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

echo [3/4] Starting Main ERP React Portal on http://localhost:5173 ...
start "SRM ERP - Main Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [4/4] Starting Extra-Curricular React Portal on http://localhost:5174 ...
start "SRM ERP - Extra-Curricular Frontend (Port 5174)" cmd /k "cd /d %~dp0extra_curricular_module\frontend && npm run dev"

echo.
echo =========================================================================
echo ALL SERVICES SUCCESSFULLY LAUNCHED!
echo.
echo Main ERP Portal:            http://localhost:5173
echo  - Semester Results:        http://localhost:5173/results
echo  - Medical & Disciplinary:  http://localhost:5173/medical-disciplinary
echo  - Admin Cell Console:      http://localhost:5173/admin
echo.
echo Extra-Curricular Portal:    http://localhost:5174
echo.
echo Swagger API Documentation:
echo  - Main ERP API Docs:       http://127.0.0.1:8000/docs
echo  - Extra-Curricular Docs:   http://127.0.0.1:8001/docs
echo.
echo Demo Credentials (both portals):
echo  - Administrator:          admin / admin123
echo  - CSE Faculty:            prof.kumar / kumar123
echo  - IT Faculty:             prof.meena / meena123
echo =========================================================================
pause
