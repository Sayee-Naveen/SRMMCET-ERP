import os
import uuid
import shutil
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    ExtraCurricularActivity, ActivityCertificate, ActivityCategory, Student, Faculty
)
from ..schemas import (
    ECActivityCreate, ECActivityUpdate, ECActivityOut,
    ECStudentPortfolioOut, ECCategoryOut, ECAnalyticsSummaryOut, ECCategoryMetric,
    ECCertificateOut
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/ec", tags=["Extra-Curricular"])

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "uploads", "certificates"
)
os.makedirs(UPLOAD_DIR, exist_ok=True)

PRESET_DOMAINS = {
    "Sports": {
        "events": ["Athletics (100m, 200m, 400m, 4x100m Relay)", "Cricket", "Football",
                   "Badminton (Singles / Doubles)", "Volleyball", "Basketball", "Table Tennis",
                   "Chess", "Kabaddi", "Kho-Kho", "Ball Badminton", "Archery"],
        "roles": ["Participant", "Winner", "Runner-Up", "Team Captain", "Vice-Captain", "Squad Member"],
        "achievements": ["1st Place (Gold)", "2nd Place (Silver)", "3rd Place (Bronze)",
                         "Winner", "Runner-Up", "Semi-Finalist", "Quarter-Finalist", "Participant"],
        "levels": ["Department", "College Annual Sports", "Anna University Zonal",
                   "Inter-Zonal", "State Level", "All India Inter-University", "National"]
    },
    "Cultural": {
        "events": ["Annual Cultural Fest (SRM FEST)", "Inter-Collegiate Cultural Carnival",
                   "Theatrics & Skit", "Mime & Street Play", "Fashion & Traditional Attire Walk",
                   "Standup Comedy", "Short Film & Photography"],
        "roles": ["Performer", "Lead Actor", "Director", "Event Coordinator", "Participant", "Winner"],
        "achievements": ["1st Prize", "2nd Prize", "3rd Prize", "Best Performer",
                         "Special Jury Award", "Participation"],
        "levels": ["College Fest", "Inter-Collegiate", "State Level Fest", "National Fest"]
    },
    "Clubs": {
        "events": ["SRM Coding & Algorithmic Club", "Robotics & Automation Society",
                   "AI & Data Science Student Chapter", "Rotaract Club of SRMMCET",
                   "Toastmasters International Club", "Entrepreneurship Development Cell (EDC)",
                   "Eco & Nature Conservation Club", "Photography & Media Guild", "Design & UI/UX Society"],
        "roles": ["President", "Vice President", "Secretary", "Treasurer", "Technical Lead",
                  "Event Coordinator", "Active Member"],
        "achievements": ["Outstanding Leadership", "Best Club Coordinator", "Active Contribution",
                         "Completed Tenure", "Project Showcase Winner"],
        "levels": ["College Chapter", "Inter-College Chapter", "District / Regional", "National Chapter"]
    },
    "NSS/NCC": {
        "events": ["NSS 7-Day Rural Special Camp", "Swachh Bharat Cleanliness Mission",
                   "NSS Annual Regular Activities", "NCC Annual Training Camp (ATC)",
                   "NCC Combined Annual Training Camp (CATC)", "Republic Day Parade (RDC) Contingent",
                   "Thal Sainik Camp (TSC)", "NCC National Integration Camp (NIC)"],
        "roles": ["Cadet", "Senior Under Officer (SUO)", "Junior Under Officer (JUO)",
                  "Sergeant", "Corporal", "NSS Volunteer", "Camp Leader"],
        "achievements": ["Camp Completion Certificate", "Best Cadet Award", "Outstanding NSS Volunteer",
                         "RDC Medal", "Governor's Commendation", "Completed"],
        "levels": ["Unit Level", "Battalion / Camp Level", "Group Level", "Directorate / State", "National"]
    },
    "Music": {
        "events": ["Carnatic Classical Vocal Solo", "Western Vocal Solo", "Light Music / Film Song Vocal",
                   "Instrumental - Keyboard / Piano", "Instrumental - Violin / Flute",
                   "Instrumental - Guitar / Bass", "Percussion - Mridangam / Drums", "College Fusion Band"],
        "roles": ["Solo Vocalist", "Lead Guitarist", "Keyboardist", "Percussionist", "Band Member", "Accompanist"],
        "achievements": ["1st Prize (Gold)", "2nd Prize (Silver)", "3rd Prize (Bronze)",
                         "Best Instrumentalist", "Best Band", "Participation"],
        "levels": ["College", "Inter-Collegiate Fest", "University Level", "State Level", "National"]
    },
    "Dance": {
        "events": ["Classical Solo (Bharatanatyam / Kathak)", "Classical Group Dance",
                   "Western Dance Solo", "Western Hip-Hop / Freestyle Group",
                   "Folk Dance (Karagattam / Oyilattam / Kavadi)", "Contemporary & Lyrical Dance"],
        "roles": ["Solo Dancer", "Group Lead Choreographer", "Ensemble Performer", "Participant"],
        "achievements": ["1st Prize", "2nd Prize", "3rd Prize", "Best Choreography",
                         "Special Jury Award", "Participation"],
        "levels": ["College Annual Day", "Inter-Collegiate Culturals",
                   "State Dance Competition", "National Championship"]
    },
    "Literary": {
        "events": ["English Debate (Parliamentary / Oxford)", "Tamil Debate (Pattimandram / Arangam)",
                   "English & Tamil Elocution", "General & Tech Quiz", "Creative Essay Writing",
                   "Poetry Recitation & Slam", "Model United Nations (MUN)", "Spell Bee & Word Power"],
        "roles": ["Debater / Speaker", "Quizzer", "Writer / Poet", "Delegate (MUN)", "Participant"],
        "achievements": ["1st Place (Winner)", "2nd Place (Runner-up)", "3rd Place",
                         "Best Speaker / Debater", "Best Delegate", "Participation"],
        "levels": ["Department", "College", "Inter-Collegiate", "State Level", "National MUN"]
    },
    "Social Service": {
        "events": ["Mega Voluntary Blood Donation Camp", "Tree Plantation & Green Campus Drive",
                   "Village Literacy & Digital Awareness Outreach", "Orphanage & Elderly Home Care Visit",
                   "Disaster Relief & Aid Distribution", "Traffic Awareness & Road Safety Campaign",
                   "Health & Hygiene Awareness Drive"],
        "roles": ["Student Coordinator", "Donor & Volunteer", "Team Lead", "Field Campaigner"],
        "achievements": ["Certificate of Appreciation", "Star Donor Citation", "Outstanding Social Volunteer",
                         "Community Impact Recognition", "Completed"],
        "levels": ["Campus", "Local Community / Madurai District", "State Outreach", "National Mission"]
    }
}

AWARD_KEYWORDS = ["1st", "2nd", "3rd", "Winner", "Gold", "Silver", "Bronze", "Prize", "Best", "Outstanding"]


# ─────────────────────────────────────────────
# Categories
# ─────────────────────────────────────────────

@router.get("/categories", response_model=List[ECCategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ActivityCategory).order_by(ActivityCategory.display_order.asc()).all()

@router.get("/categories/domains-meta")
def get_domains_metadata():
    return PRESET_DOMAINS


# ─────────────────────────────────────────────
# Activities CRUD
# ─────────────────────────────────────────────

@router.get("/activities", response_model=List[ECActivityOut])
def list_activities(
    category: Optional[str] = Query(None),
    reg_no: Optional[str] = Query(None),
    regulation: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    academic_year: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(ExtraCurricularActivity)
    if category and category.lower() != "all":
        q = q.filter(ExtraCurricularActivity.category == category)
    if reg_no:
        q = q.filter(ExtraCurricularActivity.reg_no == reg_no)
    if regulation and regulation.lower() != "all":
        q = q.filter(ExtraCurricularActivity.regulation == regulation)
    if level and level.lower() != "all":
        q = q.filter(ExtraCurricularActivity.level == level)
    if academic_year and academic_year.lower() != "all":
        q = q.filter(ExtraCurricularActivity.academic_year == academic_year)
    if search:
        sf = f"%{search}%"
        q = q.filter(
            (ExtraCurricularActivity.title.ilike(sf)) |
            (ExtraCurricularActivity.organizer.ilike(sf)) |
            (ExtraCurricularActivity.sub_category.ilike(sf)) |
            (ExtraCurricularActivity.reg_no.ilike(sf))
        )
    return q.order_by(ExtraCurricularActivity.event_date.desc(), ExtraCurricularActivity.id.desc()).all()


@router.get("/activities/{activity_id}", response_model=ECActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(ExtraCurricularActivity).filter(ExtraCurricularActivity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    return act


@router.post("/activities", response_model=ECActivityOut)
def create_activity(
    payload: ECActivityCreate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.reg_no == payload.reg_no).first()
    if not student:
        raise HTTPException(status_code=400, detail=f"Student {payload.reg_no} not found in the student registry.")
    activity_data = payload.model_dump(exclude={"certificate"})
    new_act = ExtraCurricularActivity(**activity_data)
    db.add(new_act)
    db.flush()
    if payload.certificate and (payload.certificate.certificate_no or payload.certificate.file_url or payload.certificate.title):
        cert_data = payload.certificate.model_dump()
        cert_data["activity_id"] = new_act.id
        db.add(ActivityCertificate(**cert_data))
    db.commit()
    db.refresh(new_act)
    return new_act


@router.put("/activities/{activity_id}", response_model=ECActivityOut)
def update_activity(
    activity_id: int,
    payload: ECActivityUpdate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    act = db.query(ExtraCurricularActivity).filter(ExtraCurricularActivity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(act, field, val)
    act.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(act)
    return act


@router.delete("/activities/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    act = db.query(ExtraCurricularActivity).filter(ExtraCurricularActivity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(act)
    db.commit()
    return {"message": "Activity deleted", "id": activity_id}


# ─────────────────────────────────────────────
# Student Portfolio
# ─────────────────────────────────────────────

@router.get("/portfolio/{reg_no}", response_model=ECStudentPortfolioOut)
def get_student_portfolio(reg_no: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.reg_no == reg_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    acts = (db.query(ExtraCurricularActivity)
            .filter(ExtraCurricularActivity.reg_no == reg_no)
            .order_by(ExtraCurricularActivity.event_date.desc()).all())
    awards_count = sum(1 for a in acts if any(k.lower() in (a.achievement or "").lower() for k in AWARD_KEYWORDS))
    total_certs = sum(len(a.certificates) for a in acts)
    return {
        "student": student,
        "total_activities": len(acts),
        "total_certificates": total_certs,
        "total_awards": awards_count,
        "activities": acts
    }


# ─────────────────────────────────────────────
# Analytics
# ─────────────────────────────────────────────

@router.get("/analytics/summary", response_model=ECAnalyticsSummaryOut)
def get_analytics_summary(db: Session = Depends(get_db)):
    acts = db.query(ExtraCurricularActivity).all()
    certs = db.query(ActivityCertificate).all()
    total_awards = sum(1 for a in acts if any(k.lower() in (a.achievement or "").lower() for k in AWARD_KEYWORDS))
    categories = ["Sports", "Cultural", "Clubs", "NSS/NCC", "Music", "Dance", "Literary", "Social Service"]
    breakdown = [
        ECCategoryMetric(
            category=cat,
            count=len([a for a in acts if a.category == cat]),
            certificates_count=sum(len(a.certificates) for a in acts if a.category == cat)
        )
        for cat in categories
    ]
    recent = (db.query(ExtraCurricularActivity)
              .order_by(ExtraCurricularActivity.id.desc()).limit(6).all())
    return {
        "total_activities": len(acts),
        "total_certificates": len(certs),
        "total_awards": total_awards,
        "total_students_participated": len(set(a.reg_no for a in acts)),
        "category_breakdown": breakdown,
        "recent_activities": recent
    }


@router.get("/analytics/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    leaderboard = []
    for s in students:
        acts = db.query(ExtraCurricularActivity).filter(ExtraCurricularActivity.reg_no == s.reg_no).all()
        if acts:
            awards = sum(1 for a in acts if any(k.lower() in (a.achievement or "").lower() for k in AWARD_KEYWORDS))
            certs = sum(len(a.certificates) for a in acts)
            leaderboard.append({
                "reg_no": s.reg_no,
                "name": s.name,
                "activities_count": len(acts),
                "certificates_count": certs,
                "awards_count": awards
            })
    leaderboard.sort(key=lambda x: (x["awards_count"], x["activities_count"]), reverse=True)
    return leaderboard[:10]


# ─────────────────────────────────────────────
# Certificates Listing & Upload
# ─────────────────────────────────────────────

@router.get("/certificates", response_model=List[ECCertificateOut])
def list_certificates(
    search: Optional[str] = Query(None, description="Search certificate no or title"),
    db: Session = Depends(get_db)
):
    query = db.query(ActivityCertificate)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (ActivityCertificate.certificate_no.ilike(s)) |
            (ActivityCertificate.title.ilike(s)) |
            (ActivityCertificate.issuing_authority.ilike(s))
        )
    return query.order_by(ActivityCertificate.id.desc()).all()


@router.get("/certificates/{cert_id}", response_model=ECCertificateOut)
def get_certificate(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(ActivityCertificate).filter(ActivityCertificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert


@router.post("/certificates/upload")
async def upload_certificate(
    file: UploadFile = File(...),
    current_user: Faculty = Depends(get_current_user)
):
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".pdf", ".svg"}
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in allowed:
        raise HTTPException(status_code=400, detail="Supported formats: PNG, JPG, WEBP, PDF, SVG")
    filename = f"cert_{uuid.uuid4().hex[:12]}{ext.lower()}"
    target = os.path.join(UPLOAD_DIR, filename)
    with open(target, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    return {
        "file_url": f"/uploads/certificates/{filename}",
        "filename": filename,
        "file_type": file.content_type
    }


@router.delete("/certificates/{cert_id}")
def delete_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    cert = db.query(ActivityCertificate).filter(ActivityCertificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    db.delete(cert)
    db.commit()
    return {"message": "Certificate deleted"}
