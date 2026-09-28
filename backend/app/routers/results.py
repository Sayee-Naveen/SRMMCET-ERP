import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import (
    Subject, GradeScale, Mark, SemesterResult, Student, Faculty,
    StudentCustomSubject, Course, FacultyStudent, SectionStudent, FacultySection
)
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
    1. Regular department subjects for this semester (Attempt 1 by default).
    2. Ad-hoc/custom subjects specifically assigned to this student
       (e.g. Honors, Minors, Naan Mudhalvan, Electives, Internship, Project).
    3. Active arrears from ALL prior semesters (Sem 1 .. semester - 1)
       carrying their original_semester and incremented attempt count.
    """
    student = db.query(Student).filter(Student.reg_no == reg_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sheet = []
    seen_subject_ids = set()

    # 1. Regular subjects for this semester
    regular_subjects = db.query(Subject).filter(
        Subject.course_id == student.course_id,
        Subject.semester == semester,
        Subject.regulation == student.regulation,
        Subject.is_active == True
    ).all()

    for sub in regular_subjects:
        seen_subject_ids.add(sub.subject_id)
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
            category=sub.category or "Core",
            grade_letter=mark.grade_letter if mark else "",
            grade_point=mark.grade_point if mark else 0.0,
            is_pass=mark.is_pass if mark else True
        ))

    # 2. Ad-hoc / Custom subjects assigned to this specific student for this semester
    custom_records = db.query(StudentCustomSubject).filter(
        StudentCustomSubject.student_id == student.student_id,
        StudentCustomSubject.semester == semester
    ).all()

    for cr in custom_records:
        sub = cr.subject
        if sub and sub.subject_id not in seen_subject_ids:
            seen_subject_ids.add(sub.subject_id)
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
                original_semester=semester,
                is_arrear=False,
                attempt=mark.attempt if mark else 1,
                category=cr.category or "Ad-hoc",
                grade_letter=mark.grade_letter if mark else "",
                grade_point=mark.grade_point if mark else 0.0,
                is_pass=mark.is_pass if mark else True
            ))

    # 3. Arrear carryover from prior semesters (prior_sem < semester)
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
            # Active Arrear! Add to current semester's evaluation sheet
            sub = db.query(Subject).filter(Subject.subject_id == sid).first()
            if not sub:
                continue

            current_mark = db.query(Mark).filter(
                Mark.reg_no == reg_no,
                Mark.subject_id == sid,
                Mark.semester == semester
            ).order_by(Mark.attempt.desc()).first()

            max_prior_attempt = max(m.attempt for m in m_list) if m_list else 1

            # Ensure original semester is taken from the subject's defined semester or first failed attempt
            first_failed_attempt = min(m.semester for m in m_list) if m_list else sub.semester

            sheet.append(SemesterSheetItem(
                subject_id=sub.subject_id,
                subject_code=sub.subject_code,
                subject_name=sub.subject_name,
                credits=sub.credits,
                subject_type=sub.subject_type,
                original_semester=first_failed_attempt,
                is_arrear=True,
                attempt=current_mark.attempt if current_mark else (max_prior_attempt + 1),
                category="Arrear",
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

    grade_scale_records = db.query(GradeScale).filter(GradeScale.regulation == student.regulation).all()
    grade_pass_map = {g.grade_letter: g.is_pass for g in grade_scale_records}

    # Upsert marks
    for item in req.marks:
        is_pass_val = grade_pass_map.get(
            item.grade_letter,
            (item.grade_point > 0 and item.grade_letter not in ['U', 'SA', 'WH', 'WC'])
        )

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

    # Recalculate SGPA for current examination session
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

    # Calculate Cumulative CGPA (best attempt per unique subject)
    all_marks = db.query(Mark).join(Subject).filter(Mark.reg_no == req.reg_no).all()
    best_marks = {}
    for m in all_marks:
        if not m.subject:
            continue
        sid = m.subject_id
        if sid not in best_marks:
            best_marks[sid] = m
        else:
            if m.is_pass and not best_marks[sid].is_pass:
                best_marks[sid] = m
            elif m.is_pass == best_marks[sid].is_pass and m.attempt > best_marks[sid].attempt:
                best_marks[sid] = m

    cum_cp = sum(m.subject.credits * m.grade_point for m in best_marks.values())
    cum_cr = sum(m.subject.credits for m in best_marks.values())
    cgpa = round(cum_cp / cum_cr, 2) if cum_cr > 0 else 0.0

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

# --- CSV / EXCEL EXPORT ENDPOINT ---
@router.get("/export-results")
def export_results(
    dept: Optional[str] = None,
    faculty_id: Optional[int] = None,
    reg_no: Optional[str] = None,
    semester: Optional[int] = None,
    batch_year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Exports semester results data as a CSV table file.
    Supports filtering by Department, Faculty (Mentor), Student Reg No, Semester, and Batch.
    """
    query = db.query(Student).filter(Student.is_active == True)

    if reg_no:
        query = query.filter(Student.reg_no == reg_no)
    if batch_year:
        query = query.filter(Student.batch_year == batch_year)
    if dept:
        query = query.join(Course).filter(Course.course_name.ilike(f"%{dept}%") | Course.short_name.ilike(f"%{dept}%"))
    if faculty_id:
        direct_sids = [fs.student_id for fs in db.query(FacultyStudent).filter(FacultyStudent.faculty_id == faculty_id).all()]
        sec_ids = [fs.section_id for fs in db.query(FacultySection).filter(FacultySection.faculty_id == faculty_id).all()]
        sec_sids = [ss.student_id for ss in db.query(SectionStudent).filter(SectionStudent.section_id.in_(sec_ids)).all()]
        query = query.filter(Student.student_id.in_(list(set(direct_sids + sec_sids))))

    students = query.order_by(Student.batch_year.desc(), Student.reg_no.asc()).all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Header Row
    writer.writerow([
        "Register Number", "Student Name", "Course / Department", "Batch", "Regulation",
        "Assigned Mentor", "Semester", "Subject Code", "Subject Name", "Category",
        "Original Semester", "Attempt", "Credits", "Grade Letter", "Grade Point",
        "Status", "Semester SGPA", "Cumulative CGPA"
    ])

    for st in students:
        # Determine assigned mentor name
        mentor_rel = db.query(FacultyStudent).filter(FacultyStudent.student_id == st.student_id).first()
        mentor_name = mentor_rel.faculty.full_name if mentor_rel and mentor_rel.faculty else "Unassigned"

        marks_query = db.query(Mark).filter(Mark.reg_no == st.reg_no)
        if semester:
            marks_query = marks_query.filter(Mark.semester == semester)
        marks = marks_query.order_by(Mark.semester.asc(), Mark.subject_id.asc()).all()

        # Cache semester results for this student
        sem_res_map = {
            sr.semester: sr for sr in db.query(SemesterResult).filter(SemesterResult.reg_no == st.reg_no).all()
        }

        if not marks:
            # Output basic student row even if no marks entered yet
            writer.writerow([
                st.reg_no, st.name, st.course.course_name if st.course else "",
                st.batch_year, st.regulation, mentor_name,
                st.current_sem, "—", "No marks recorded", "—",
                "—", "—", "—", "—", "—", "—", "—", "—"
            ])
            continue

        for m in marks:
            sub = m.subject
            sr = sem_res_map.get(m.semester)
            is_arrear = (m.semester > sub.semester) if sub else False
            orig_sem = sub.semester if sub else m.semester
            cat = "Arrear" if is_arrear else (sub.category if sub else "Core")

            writer.writerow([
                st.reg_no,
                st.name,
                st.course.course_name if st.course else "",
                st.batch_year,
                st.regulation,
                mentor_name,
                m.semester,
                sub.subject_code if sub else "—",
                sub.subject_name if sub else "—",
                cat,
                orig_sem,
                m.attempt,
                sub.credits if sub else 0.0,
                m.grade_letter,
                m.grade_point,
                "PASS" if m.is_pass else "RE-APPEAR",
                sr.sgpa if sr else "—",
                sr.cgpa if sr else "—"
            ])

    csv_data = output.getvalue()
    output.close()

    filename = f"srm_mcet_results_{dept or 'all'}_{semester or 'all_sems'}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
