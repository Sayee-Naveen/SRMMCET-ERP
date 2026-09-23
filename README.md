# SRM MCET — Semester Results ERP Module

> Standalone Semester Results Module for **SRM Madurai College for Engineering and Technology (SRMMCET)**, affiliated to Anna University. Supports both **Regulation 2021 (R2021)** and **Regulation 2025 (R2025)** curricula, faculty-scoped grading workflows, live SGPA/CGPA computation, and an administrative control panel.

---

## 🌟 Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide Icons + React Hot Toast
- **Backend:** FastAPI (Python 3.10+) + Pydantic v2 + SQLAlchemy 2.0
- **Database:** MySQL 8.0 (with automatic resilient SQLite fallback for local demo)
- **Authentication:** JWT Bearer tokens with Role-Based Access Control (`faculty` / `admin`)

---

## 🚀 Quick Start

### 1. Launch Everything (Windows)
Double-click `start_app.bat` or run:
```bat
start_app.bat
```

### 2. Manual Start

#### Backend
```bash
cd backend
pip install -r requirements.txt
python seed_db.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

- **Frontend Portal:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔑 Demo Accounts

| Role | Username | Password | Scope |
|---|---|---|---|
| **Faculty (CSE)** | `prof.kumar` | `kumar123` | Scoped to assigned CSE section (~30 students) |
| **Faculty (IT)** | `prof.meena` | `meena123` | Scoped to assigned IT section (~30 students) |
| **Administrator** | `admin` | `admin123` | Full control over courses, subjects, regulations, students & sections |

---

## 📊 Anna University Regulations Implemented

### Regulation 2021 (Relative Grading)
- Grades: `O (10)`, `A+ (9)`, `A (8)`, `B+ (7)`, `B (6)`, `C (5)`, `U (0 - Fail)`, `SA (0)`
- Pass: `O` through `C`

### Regulation 2025 (Absolute Grading)
- Grades: `S (10)`, `A+ (9)`, `A (8)`, `B+ (7)`, `B (6.5)`, `C+ (6)`, `C (5)`, `U (0 - Fail)`
- Pass: `S` through `C` (minimum 50 marks)

$$\text{SGPA} = \frac{\sum (\text{Credits} \times \text{Grade Point})}{\sum \text{Credits}}$$

---

## 📂 Project Structure

```
D:\SRM_ERP\
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point & CORS
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models.py          # Relational DB models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # JWT authentication & dependencies
│   │   └── routers/
│   │       ├── auth.py        # /api/login
│   │       ├── students.py    # /api/students (scoped)
│   │       ├── results.py     # /api/marks, /api/subjects, /api/grade-scale
│   │       └── admin.py       # /api/admin/* (CRUD)
│   ├── seed_db.py             # Database seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/axios.js       # Axios client with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/Header.jsx
│   │   ├── pages/Login.jsx
│   │   ├── pages/Results.jsx  # Main Semester Results Sheet
│   │   ├── pages/AdminDashboard.jsx
│   │   ├── App.jsx
│   │   └── index.css          # SRMMCET theme styles
│   └── package.json
├── sql/
│   └── semester_module.sql    # Complete MySQL schema & seed data
├── start_app.bat              # One-click launcher
└── README.md
```
