# SRM MCET — Extra-Curricular Activities ERP Module

> Standalone & Integrated Extra-Curricular Activities & Student Achievements ERP Module for **SRM Madurai College for Engineering and Technology (SRMMCET)**.
> Comprehensive tracking, certificate validation, and points accreditation across **Sports, Cultural, Clubs, NSS/NCC, Music, Dance, Literary, Social Service, and Digital Certificates**.

---

## 🌟 Tech Stack & Design System

- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide Icons + React Hot Toast
- **Backend:** FastAPI (Python 3.10+) + Pydantic v2 + SQLAlchemy 2.0
- **Database:** MySQL 8.0 with automatic resilient SQLite fallback (`extra_curricular.db`)
- **Authentication:** JWT Bearer tokens with Role-Based Access Control (`faculty` / `admin`)
- **Theme Tokens:** Primary Navy Blue (`#003898`), Header Blue (`#002B7A`), Accent Gold (`#FFB800`), Background Light (`#F4F6FB`)

---

## 🎯 8 Institutional Domains Covered

1. **Sports & Athletics:** Track & field, athletics, badminton, cricket, football, volleyball, table tennis, chess, kabaddi, zonal/inter-zonal meets.
2. **Cultural & Arts:** SRM FEST annual celebrations, inter-college culturals, theatrics, skits, mime, talent shows.
3. **Student Clubs & Chapters:** Coding Club, Robotics & AI Society, Rotaract Club, Toastmasters, EDC, Eco Club, Media Club.
4. **NSS & NCC:** 7-Day Special Village Camps (Melur, etc.), Swachh Bharat cleanliness drives, NCC Combined Annual Training Camps (CATC), Republic Day Parade contingent.
5. **Music & Band:** Classical vocal, western vocal, light music, keyboard, guitar, violin, mridangam, fusion college band.
6. **Dance:** Classical solo (Bharatanatyam / Kathak), folk dance (Karagattam, Oyilattam), western group choreography.
7. **Literary & Debating:** English debate, Tamil Pattimandram, elocution, quiz competitions, Model United Nations (MUN), essay writing.
8. **Social Service:** Mega voluntary blood donation camps, tree plantation, community digital literacy outreach, disaster relief.
9. **Certificates & Verification:** Digital certificate records with unique ID (`SRM-SP-2024-ZON-0041`), cryptographic verification hash (`SRM-AU-SP-783264`), faculty approval signoff, printable/downloadable proof.

---

## 🚀 Quick Launch

### 1. One-Click Launcher (Windows)
Double-click `start_module.bat` or run:
```bat
start_module.bat
```

### 2. Manual Commands

#### Backend
```bash
cd extra_curricular_module/backend
pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

#### Frontend
```bash
cd extra_curricular_module/frontend
npm install
npm run dev
```

- **Extra-Curricular Portal:** [http://localhost:5174](http://localhost:5174)
- **FastAPI Interactive Docs:** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

---

## 🔑 Demo Accounts

| Role | Username | Password | Privileges |
|---|---|---|---|
| **Faculty (CSE)** | `prof.kumar` | `kumar123` | Record activities, view scoped portfolios, verify student certificates |
| **Faculty (IT)** | `prof.meena` | `meena123` | Record activities, view scoped portfolios, verify student certificates |
| **Administrator** | `admin` | `admin123` | Full institution-wide control, delete records, approve all domains |

---

## 📊 Sample Pre-seeded Students

- `911124104001`: **Arjun R** (CSE, B.E., Section A)
- `911124104002`: **Priya S** (CSE, B.E., Section A)
- `911125104001`: **Suresh M** (CSE, B.E., Section A - R2025)
- `911124205001`: **Karthik M** (IT, B.Tech, Section A)
- `911124104005`: **Deepa V** (CSE, B.E., Section A)
- `911124205008`: **Vignesh K** (IT, B.Tech, Section B)
