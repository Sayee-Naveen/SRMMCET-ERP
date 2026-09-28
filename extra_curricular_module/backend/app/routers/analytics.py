from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import ExtraCurricularActivity, ActivityCertificate, ModuleStudent
from ..schemas import AnalyticsSummaryOut, CategoryMetric, ActivityOut

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummaryOut)
def get_analytics_summary(db: Session = Depends(get_db)):
    acts = db.query(ExtraCurricularActivity).all()
    certs = db.query(ActivityCertificate).all()

    total_acts = len(acts)
    total_certs = len(certs)

    award_keywords = ["1st", "2nd", "3rd", "Winner", "Gold", "Silver", "Bronze", "Prize", "Best", "Outstanding"]
    total_awards = sum(1 for a in acts if any(k.lower() in (a.achievement or "").lower() for k in award_keywords))

    unique_students = len(set(a.reg_no for a in acts))

    # Category breakdown
    categories = [
        "Sports", "Cultural", "Clubs", "NSS/NCC", "Music", "Dance", "Literary", "Social Service"
    ]
    breakdown: List[CategoryMetric] = []
    for cat in categories:
        cat_acts = [a for a in acts if a.category == cat]
        cat_certs = sum(len(a.certificates) for a in cat_acts)
        breakdown.append(CategoryMetric(
            category=cat,
            count=len(cat_acts),
            certificates_count=cat_certs
        ))

    # Recent activities
    recent = db.query(ExtraCurricularActivity).order_by(
        ExtraCurricularActivity.created_at.desc(),
        ExtraCurricularActivity.id.desc()
    ).limit(6).all()

    return {
        "total_activities": total_acts,
        "total_certificates": total_certs,
        "total_awards": total_awards,
        "total_students_participated": unique_students,
        "category_breakdown": breakdown,
        "recent_activities": recent
    }

@router.get("/leaderboard")
def get_top_performers(db: Session = Depends(get_db)):
    students = db.query(ModuleStudent).all()
    leaderboard = []

    for s in students:
        award_keywords = ["1st", "2nd", "3rd", "Winner", "Gold", "Silver", "Bronze", "Prize", "Best"]
        awards = sum(1 for a in s.activities if any(k.lower() in (a.achievement or "").lower() for k in award_keywords))
        certs_count = sum(len(a.certificates) for a in s.activities)

        if len(s.activities) > 0:
            leaderboard.append({
                "reg_no": s.reg_no,
                "name": s.name,
                "department": s.department,
                "section": s.section,
                "activities_count": len(s.activities),
                "certificates_count": certs_count,
                "awards_count": awards
            })

    leaderboard.sort(key=lambda x: (x["awards_count"], x["activities_count"]), reverse=True)
    return leaderboard[:10]
