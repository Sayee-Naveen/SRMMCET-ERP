from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Subject, GradeScale, Mark, SemesterResult, Student, Faculty
from ..schemas import (
    SubjectOut, GradeScaleOut, MarkOut, SaveMarksRequest,
    SemesterResultOut, SemesterSheetItem
)
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

@router.get("/semester-sheet", response_model=List[SemesterSheetItem])
def get_semester_sheet(reg_no: str, semester: int, db: Session = Depends(get_db)):
    """
    Returns the complete list of subjects for this student and semester:
    1. Regular subjects for this semester (Attempt 1 by default).
    2. Active arrears from ALL prior semesters (Sem 1 .. semester - 1)
       which have NOT been passed yet in any earlier attempt!
    """
    student = db.query(Student).filter(Student.reg_no == reg_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sheet = []

    # 1. Regular subjects for this semester
    regular_subjects = db.query(Subject).filter(
        Subject.course_id == student.course_id,
        Subject.semester == semester,
        Subject.regulation == student.regulation,
        Subject.is_active == True
    ).all()

    for sub in regular_subjects:
        # Check if already has a mark entered for this semester
        mark = db.query(Mark).filter(
            Mark.reg_no == reg_no,
            Mark.subject_id == sub.subject_id,
            Mark.semester == semester
        ).order_by(Mark.attempt.desc()).first()

        sheet.append(SemesterSheetItem(
            subject_id=sub.subject_id,
            subject_code=sub.subject_code,
            subject_name=sub.subject_name,
            credits=sub.credits,
            subject_type=sub.subject_type,
            original_semester=sub.semester,
            is_arrear=False,
            attempt=mark.attempt if mark else 1,
            grade_letter=mark.grade_letter if mark else "",
            grade_point=mark.grade_point if mark else 0.0,
            is_pass=mark.is_pass if mark else True
        ))

    # 2. Arrear carryover from prior semesters (prior_sem < semester)
    prior_marks = db.query(Mark).filter(
        Mark.reg_no == reg_no,
        Mark.semester < semester
    ).all()

    # Group prior marks by subject_id
    prior_by_subject = {}
    for pm in prior_marks:
        if pm.subject_id not in prior_by_subject:
            prior_by_subject[pm.subject_id] = []
        prior_by_subject[pm.subject_id].append(pm)

    for sid, m_list in prior_by_subject.items():
        # Has the student passed this subject in ANY attempt prior to the current semester?
        has_passed = any(m.is_pass for m in m_list)
        if not has_passed:
            # Active Arrear! Add to upcoming semester's evaluation sheet
            sub = db.query(Subject).filter(Subject.subject_id == sid).first()
            if not sub:
                continue

            # Check if an attempt for this arrear has already been recorded in the current semester
            current_mark = db.query(Mark).filter(
                Mark.reg_no == reg_no,
                Mark.subject_id == sid,
                Mark.semester == semester
            ).order_by(Mark.attempt.desc()).first()

            max_prior_attempt = max(m.attempt for m in m_list) if m_list else 1

            sheet.append(SemesterSheetItem(
                subject_id=sub.subject_id,
                subject_code=sub.subject_code,
                subject_name=sub.subject_name,
                credits=sub.credits,
                subject_type=sub.subject_type,
                original_semester=sub.semester,
                is_arrear=True,
                attempt=current_mark.attempt if current_mark else (max_prior_attempt + 1),
                grade_letter=current_mark.grade_letter if current_mark else "",
                grade_point=current_mark.grade_point if current_mark else 0.0,
                is_pass=current_mark.is_pass if current_mark else False
            ))

    return sheet

@router.post("/marks")
def save_marks(req: SaveMarksRequest, current_user: Faculty = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.reg_no == req.reg_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch Grade Scale lookup for student's regulation to ensure 100% accurate is_pass
    grade_scale_records = db.query(GradeScale).filter(GradeScale.regulation == student.regulation).all()
    grade_pass_map = {g.grade_letter: g.is_pass for g in grade_scale_records}

    # Upsert marks
    for item in req.marks:
        # Determine pass/fail accurately based on regulation grade scale
        is_pass_val = grade_pass_map.get(item.grade_letter, (item.grade_point > 0 and item.grade_letter not in ['U', 'SA', 'WH', 'WC']))

        existing = db.query(Mark).filter(
            Mark.reg_no == req.reg_no,
            Mark.subject_id == item.subject_id,
            Mark.attempt == item.attempt
        ).first()

        if existing:
            existing.semester = req.semester
            existing.grade_letter = item.grade_letter
            existing.grade_point = item.grade_point
            existing.is_pass = is_pass_val
            existing.entered_by = current_user.faculty_id
        else:
            new_mark = Mark(
                reg_no=req.reg_no,
                subject_id=item.subject_id,
                semester=req.semester,
                attempt=item.attempt,
                grade_letter=item.grade_letter,
                grade_point=item.grade_point,
                is_pass=is_pass_val,
                entered_by=current_user.faculty_id
            )
            db.add(new_mark)

    db.commit()

    # Recalculate SGPA for current examination session (all subjects appeared in this semester)
    current_marks = db.query(Mark).join(Subject).filter(
        Mark.reg_no == req.reg_no,
        Mark.semester == req.semester
    ).all()

    total_cp = 0.0
    total_cr = 0.0
    for m in current_marks:
        if m.subject:
            total_cp += m.subject.credits * m.grade_point
            total_cr += m.subject.credits

    sgpa = round(total_cp / total_cr, 2) if total_cr > 0 else 0.0

    # Calculate Cumulative CGPA across all semesters:
    # Rule: For each unique subject, take the best passed (or latest) attempt so credits are never counted twice
    all_marks = db.query(Mark).join(Subject).filter(Mark.reg_no == req.reg_no).all()
    best_marks = {}
    for m in all_marks:
        if not m.subject:
            continue
        sid = m.subject_id
        if sid not in best_marks:
            best_marks[sid] = m
        else:
            # If current stored is not pass and new one is pass, pick new one
            if m.is_pass and not best_marks[sid].is_pass:
                best_marks[sid] = m
            elif m.is_pass == best_marks[sid].is_pass and m.attempt > best_marks[sid].attempt:
                best_marks[sid] = m

    cum_cp = sum(m.subject.credits * m.grade_point for m in best_marks.values())
    cum_cr = sum(m.subject.credits for m in best_marks.values())
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
