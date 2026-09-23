from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Subject, GradeScale, Mark, SemesterResult, Student, Faculty
from ..schemas import SubjectOut, GradeScaleOut, MarkOut, SaveMarksRequest, SemesterResultOut
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["Results"])

@router.get("/subjects", response_model=List[SubjectOut])
def get_subjects(course_id: int, semester: int, regulation: str, db: Session = Depends(get_db)):
    return db.query(Subject).filter(
        Subject.course_id == course_id,
        Subject.semester == semester,
        Subject.regulation == regulation,
        Subject.is_active == True
    ).all()

@router.get("/grade-scale", response_model=List[GradeScaleOut])
def get_grade_scale(regulation: str, db: Session = Depends(get_db)):
    return db.query(GradeScale).filter(
        GradeScale.regulation == regulation
    ).order_by(GradeScale.display_order).all()

@router.get("/marks", response_model=List[MarkOut])
def get_marks(reg_no: str, semester: int, db: Session = Depends(get_db)):
    return db.query(Mark).filter(
        Mark.reg_no == reg_no,
        Mark.semester == semester
    ).all()

@router.get("/results/{reg_no}", response_model=List[SemesterResultOut])
def get_semester_results(reg_no: str, db: Session = Depends(get_db)):
    return db.query(SemesterResult).filter(
        SemesterResult.reg_no == reg_no
    ).order_by(SemesterResult.semester).all()

@router.post("/marks")
def save_marks(req: SaveMarksRequest, current_user: Faculty = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.reg_no == req.reg_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Upsert marks
    for item in req.marks:
        existing = db.query(Mark).filter(
            Mark.reg_no == req.reg_no,
            Mark.subject_id == item.subject_id,
            Mark.attempt == item.attempt
        ).first()

        if existing:
            existing.grade_letter = item.grade_letter
            existing.grade_point = item.grade_point
            existing.is_pass = item.is_pass
            existing.entered_by = current_user.faculty_id
        else:
            new_mark = Mark(
                reg_no=req.reg_no,
                subject_id=item.subject_id,
                semester=req.semester,
                attempt=item.attempt,
                grade_letter=item.grade_letter,
                grade_point=item.grade_point,
                is_pass=item.is_pass,
                entered_by=current_user.faculty_id
            )
            db.add(new_mark)

    db.commit()

    # Recalculate SGPA & CGPA
    # Fetch all marks for current semester
    current_marks = db.query(Mark).join(Subject).filter(
        Mark.reg_no == req.reg_no,
        Mark.semester == req.semester
    ).all()

    total_cp = 0.0
    total_cr = 0.0
    for m in current_marks:
        sub = m.subject
        if sub:
            total_cp += sub.credits * m.grade_point
            total_cr += sub.credits

    sgpa = round(total_cp / total_cr, 2) if total_cr > 0 else 0.0

    # Calculate Cumulative CGPA across all semesters
    all_marks = db.query(Mark).join(Subject).filter(Mark.reg_no == req.reg_no).all()
    cum_cp = sum(m.subject.credits * m.grade_point for m in all_marks if m.subject)
    cum_cr = sum(m.subject.credits for m in all_marks if m.subject)
    cgpa = round(cum_cp / cum_cr, 2) if cum_cr > 0 else 0.0

    # Upsert SemesterResult
    sem_res = db.query(SemesterResult).filter(
        SemesterResult.reg_no == req.reg_no,
        SemesterResult.semester == req.semester
    ).first()

    if sem_res:
        sem_res.sgpa = sgpa
        sem_res.cgpa = cgpa
        sem_res.total_credits = total_cr
    else:
        new_res = SemesterResult(
            reg_no=req.reg_no,
            semester=req.semester,
            sgpa=sgpa,
            cgpa=cgpa,
            total_credits=total_cr
        )
        db.add(new_res)

    db.commit()

    return {
        "message": "Marks saved successfully!",
        "reg_no": req.reg_no,
        "semester": req.semester,
        "sgpa": sgpa,
        "cgpa": cgpa,
        "total_credits": total_cr
    }
