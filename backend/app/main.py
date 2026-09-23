from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, students, results, admin

# Auto-create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SRM MCET - Semester Results ERP Module",
    description="FastAPI Backend for Semester Results ERP Module (R2021 & R2025)",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(results.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "SRMMCET Semester Results ERP Module",
        "version": "1.0.0"
    }
