import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base, SessionLocal
from .routers import auth, students, results, admin, medical_disciplinary, extra_curricular

# Auto-create tables if they don't exist (includes new EC tables)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SRMMCET ERP — Unified Module",
    description="Semester Results | Medical & Disciplinary | Extra-Curricular Activities",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for medical documents, signatures, and EC certificates
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "certificates"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(results.router)
app.include_router(admin.router)
app.include_router(medical_disciplinary.router)
app.include_router(extra_curricular.router)


@app.on_event("startup")
def seed_ec_categories():
    """Seed activity categories into the DB on first startup."""
    from .models import ActivityCategory
    db = SessionLocal()
    try:
        if db.query(ActivityCategory).count() == 0:
            cats = [
                ActivityCategory(category_code="SPORTS", display_name="Sports & Athletics",
                                 description="Track, field, indoor and outdoor athletic events",
                                 icon_name="Trophy", badge_color="amber", display_order=1),
                ActivityCategory(category_code="CULTURAL", display_name="Cultural & Arts",
                                 description="Theatrics, skits, fest performances and arts",
                                 icon_name="Sparkles", badge_color="purple", display_order=2),
                ActivityCategory(category_code="CLUBS", display_name="Student Clubs & Chapters",
                                 description="Technical, professional and social student clubs",
                                 icon_name="Users", badge_color="blue", display_order=3),
                ActivityCategory(category_code="NSS_NCC", display_name="NSS & NCC",
                                 description="National Cadet Corps and National Service Scheme",
                                 icon_name="Shield", badge_color="emerald", display_order=4),
                ActivityCategory(category_code="MUSIC", display_name="Music & Band",
                                 description="Vocal, instrumental and orchestra competitions",
                                 icon_name="Music", badge_color="rose", display_order=5),
                ActivityCategory(category_code="DANCE", display_name="Dance",
                                 description="Classical, folk and western dance performances",
                                 icon_name="Flame", badge_color="orange", display_order=6),
                ActivityCategory(category_code="LITERARY", display_name="Literary & Debating",
                                 description="Debates, elocution, quiz and MUN conferences",
                                 icon_name="BookOpen", badge_color="cyan", display_order=7),
                ActivityCategory(category_code="SOCIAL_SERVICE", display_name="Social Service",
                                 description="Blood donation, community drives and village outreach",
                                 icon_name="Heart", badge_color="red", display_order=8),
            ]
            db.add_all(cats)
            db.commit()
            print("[STARTUP] EC Activity Categories seeded.")
    finally:
        db.close()


@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "SRMMCET ERP — Unified Module",
        "version": "2.0.0",
        "modules": ["Semester Results", "Medical & Disciplinary", "Extra-Curricular Activities"]
    }

