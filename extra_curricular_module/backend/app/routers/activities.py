from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ExtraCurricularActivity, ActivityCertificate, ModuleStudent, ModuleFaculty
from ..schemas import (
    ActivityCreate, ActivityUpdate, ActivityOut,
    StudentOut, StudentPortfolioOut
)
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["Activities"])

@router.get("/students", response_model=List[StudentOut])
def get_students(db: Session = Depends(get_db)):
    return db.query(ModuleStudent).order_by(ModuleStudent.reg_no.asc()).all()

@router.get("/students/{reg_no}/portfolio", response_model=StudentPortfolioOut)
def get_student_portfolio(reg_no: str, db: Session = Depends(get_db)):
    student = db.query(ModuleStudent).filter(ModuleStudent.reg_no == reg_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    acts = db.query(ExtraCurricularActivity).filter(
        ExtraCurricularActivity.reg_no == reg_no
    ).order_by(ExtraCurricularActivity.event_date.desc()).all()

    total_certs = sum(len(a.certificates) for a in acts)
    award_keywords = ["1st", "2nd", "3rd", "Winner", "Gold", "Silver", "Bronze", "Prize", "Best", "Outstanding"]
    awards_count = sum(1 for a in acts if any(k.lower() in (a.achievement or "").lower() for k in award_keywords))

    return {
        "student": student,
        "total_activities": len(acts),
        "total_certificates": total_certs,
        "total_awards": awards_count,
        "activities": acts
    }

@router.get("/activities", response_model=List[ActivityOut])
def list_activities(
    category: Optional[str] = Query(None, description="Filter by category"),
    reg_no: Optional[str] = Query(None, description="Filter by student reg_no"),
    regulation: Optional[str] = Query(None, description="Filter by regulation R2021/R2025"),
    level: Optional[str] = Query(None, description="Event level"),
    academic_year: Optional[str] = Query(None, description="Academic Year"),
    search: Optional[str] = Query(None, description="Search keyword"),
    db: Session = Depends(get_db)
):
    query = db.query(ExtraCurricularActivity)

    if category and category.lower() != "all":
        query = query.filter(ExtraCurricularActivity.category == category)
    if reg_no:
        query = query.filter(ExtraCurricularActivity.reg_no == reg_no)
    if regulation and regulation.lower() != "all":
        query = query.filter(ExtraCurricularActivity.regulation == regulation)
    if level and level.lower() != "all":
        query = query.filter(ExtraCurricularActivity.level == level)
    if academic_year and academic_year.lower() != "all":
        query = query.filter(ExtraCurricularActivity.academic_year == academic_year)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ExtraCurricularActivity.title.ilike(search_filter)) |
            (ExtraCurricularActivity.organizer.ilike(search_filter)) |
            (ExtraCurricularActivity.sub_category.ilike(search_filter)) |
            (ExtraCurricularActivity.reg_no.ilike(search_filter))
        )

    return query.order_by(ExtraCurricularActivity.event_date.desc(), ExtraCurricularActivity.id.desc()).all()

@router.get("/activities/{activity_id}", response_model=ActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(ExtraCurricularActivity).filter(ExtraCurricularActivity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    return act

@router.post("/activities", response_model=ActivityOut)
def create_activity(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: Optional[ModuleFaculty] = Depends(get_current_user)
):
    student = db.query(ModuleStudent).filter(ModuleStudent.reg_no == payload.reg_no).first()
    if not student:
        raise HTTPException(status_code=400, detail=f"Student with register number {payload.reg_no} not registered.")

    activity_data = payload.model_dump(exclude={"certificate"})
    new_act = ExtraCurricularActivity(**activity_data)
    db.add(new_act)
    db.flush()

    # If certificate provided or uploaded by faculty
    if payload.certificate and (payload.certificate.certificate_no or payload.certificate.file_url or payload.certificate.title):
        cert_data = payload.certificate.model_dump()
        cert_data["activity_id"] = new_act.id
        cert = ActivityCertificate(**cert_data)
        db.add(cert)

    db.commit()
    db.refresh(new_act)
    return new_act

@router.put("/activities/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: int,
    payload: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: ModuleFaculty = Depends(get_current_user)
):
    act = db.query(ExtraCurricularActivity).filter(ExtraCurricularActivity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(act, field, val)

    act.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(act)
    return act

@router.delete("/activities/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: ModuleFaculty = Depends(get_current_user)
):
    act = db.query(ExtraCurricularActivity).filter(ExtraCurricularActivity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(act)
    db.commit()
    return {"message": "Activity deleted successfully", "id": activity_id}
