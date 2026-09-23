import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, activities, certificates, categories, analytics

# Auto-create tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SRM MCET — Extra-Curricular Activities ERP Module",
    description="Dedicated FastAPI Backend for Sports, Cultural, Clubs, NSS/NCC, Music, Dance, Literary, Social Service & Certificates",
    version="1.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for certificate attachments & proofs
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(os.path.join(UPLOAD_DIR, "certificates"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(activities.router)
app.include_router(certificates.router)
app.include_router(categories.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "module": "SRM MCET Extra-Curricular Activities ERP Module",
        "version": "1.0.0",
        "domains": [
            "Sports",
            "Cultural",
            "Clubs",
            "NSS/NCC",
            "Music",
            "Dance",
            "Literary",
            "Social Service",
            "Certificates"
        ],
        "docs_url": "/docs"
    }
