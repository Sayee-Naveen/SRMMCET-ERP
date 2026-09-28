from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import (
    Course, Subject, Student, Faculty, Section, SectionStudent,
    FacultySection, Department, FacultyStudent, AcademicSession, StudentCustomSubject
)
from ..schemas import (
    CourseCreate, CourseOut,
    SubjectCreate, SubjectOut,
    StudentCreate, StudentUpdate, StudentOut,
    FacultyCreate, FacultyUpdate, FacultyOut,
    SectionCreate, SectionOut,
    DepartmentCreate, DepartmentOut,
    AssignStudentsRequest,
    AcademicSessionCreate, AcademicSessionOut,
    StudentCustomSubjectCreate, StudentCustomSubjectOut
)
from ..auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(require_admin)])

# --- ACADEMIC SESSIONS CRUD (e.g. "Nov-Dec 2025", "Apr-May 2026") ---
@router.get("/sessions", response_model=List[AcademicSessionOut])
def get_all_sessions(db: Session = Depends(get_db)):
    return db.query(AcademicSession).all()

@router.post("/sessions", response_model=AcademicSessionOut)
def create_session(req: AcademicSessionCreate, db: Session = Depends(get_db)):
    existing = db.query(AcademicSession).filter(AcademicSession.session_name == req.session_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="An examination session with this name already exists")
    ses = AcademicSession(**req.model_dump())
    db.add(ses)
    db.commit()
    db.refresh(ses)
    return ses

@router.put("/sessions/{session_id}", response_model=AcademicSessionOut)
def update_session(session_id: int, req: AcademicSessionCreate, db: Session = Depends(get_db)):
    ses = db.query(AcademicSession).filter(AcademicSession.session_id == session_id).first()
    if not ses:
        raise HTTPException(status_code=404, detail="Session not found")
    for k, v in req.model_dump().items():
        setattr(ses, k, v)
    db.commit()
    db.refresh(ses)
    return ses

@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    ses = db.query(AcademicSession).filter(AcademicSession.session_id == session_id).first()
    if not ses:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(ses)
    db.commit()
    return {"message": "Academic session deleted successfully"}

# --- DEPARTMENTS CRUD ---
@router.get("/departments", response_model=List[DepartmentOut])
def get_all_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.post("/departments", response_model=DepartmentOut)
def create_department(req: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(
        (Department.dept_name == req.dept_name) | (Department.dept_code == req.dept_code)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name or code already exists")
    dept = Department(**req.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.dept_id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted successfully"}

# --- COURSES CRUD ---
@router.get("/courses", response_model=List[CourseOut])
def get_all_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@router.post("/courses", response_model=CourseOut)
def create_course(req: CourseCreate, db: Session = Depends(get_db)):
    course = Course(**req.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

# --- SUBJECTS CRUD ---
@router.get("/subjects", response_model=List[SubjectOut])
def get_all_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()

@router.post("/subjects", response_model=SubjectOut)
def create_subject(req: SubjectCreate, db: Session = Depends(get_db)):
    subject = Subject(**req.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

# --- AD-HOC / CUSTOM SUBJECT ASSIGNMENT (Honors, Minors, Naan Mudhalvan, Electives, Internship) ---
@router.get("/students/{student_id}/custom-subjects", response_model=List[StudentCustomSubjectOut])
def get_student_custom_subjects(student_id: int, db: Session = Depends(get_db)):
    return db.query(StudentCustomSubject).filter(StudentCustomSubject.student_id == student_id).all()

@router.post("/students/{student_id}/assign-subject", response_model=StudentCustomSubjectOut)
def assign_custom_subject_to_student(student_id: int, req: StudentCustomSubjectCreate, db: Session = Depends(get_db)):
    stu = db.query(Student).filter(Student.student_id == student_id).first()
    if not stu:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(StudentCustomSubject).filter(
        StudentCustomSubject.student_id == student_id,
        StudentCustomSubject.subject_id == req.subject_id,
        StudentCustomSubject.semester == req.semester
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="This custom subject is already assigned to this student for this semester")

    rec = StudentCustomSubject(
        student_id=student_id,
        subject_id=req.subject_id,
        semester=req.semester,
        category=req.category,
        session_id=req.session_id
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.delete("/custom-subjects/{id}")
def remove_custom_subject(id: int, db: Session = Depends(get_db)):
    rec = db.query(StudentCustomSubject).filter(StudentCustomSubject.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(rec)
    db.commit()
    return {"message": "Custom subject assignment removed"}

# --- STUDENTS CRUD & EDIT (ENRICHED WITH ASSIGNED MENTOR) ---
@router.get("/students", response_model=List[StudentOut])
def get_admin_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    # Populate assigned faculty name
    res = []
    for s in students:
        # Check direct assignment
        mentor = db.query(FacultyStudent).filter(FacultyStudent.student_id == s.student_id).first()
        mentor_name = mentor.faculty.full_name if mentor and mentor.faculty else None

        if not mentor_name:
            # Check section assignment
            sec_stu = db.query(SectionStudent).filter(SectionStudent.student_id == s.student_id).first()
            if sec_stu:
                fac_sec = db.query(FacultySection).filter(FacultySection.section_id == sec_stu.section_id).first()
                if fac_sec and fac_sec.faculty:
                    mentor_name = fac_sec.faculty.full_name

        s_out = StudentOut.model_validate(s)
        s_out.assigned_faculty_name = mentor_name or "Unassigned"
        res.append(s_out)
    return res

@router.post("/students", response_model=StudentOut)
def create_student(req: StudentCreate, db: Session = Depends(get_db)):
    student = Student(**req.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.put("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, req: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = False # Soft delete
    db.commit()
    return {"message": "Student deactivated successfully"}

# --- FACULTY CRUD & EDIT (ENRICHED WITH ASSIGNED STUDENT COUNT) ---
@router.get("/faculty", response_model=List[FacultyOut])
def get_all_faculty(db: Session = Depends(get_db)):
    faculties = db.query(Faculty).all()
    res = []
    for f in faculties:
        # Count direct students
        direct_ids = [fs.student_id for fs in db.query(FacultyStudent).filter(FacultyStudent.faculty_id == f.faculty_id).all()]
        # Count section students
        sec_ids = [fs.section_id for fs in db.query(FacultySection).filter(FacultySection.faculty_id == f.faculty_id).all()]
        sec_student_ids = [ss.student_id for ss in db.query(SectionStudent).filter(SectionStudent.section_id.in_(sec_ids)).all()] if sec_ids else []

        f_out = FacultyOut.model_validate(f)
        f_out.assigned_students_count = len(set(direct_ids + sec_student_ids))
        res.append(f_out)
    return res

@router.post("/faculty", response_model=FacultyOut)
def create_faculty(req: FacultyCreate, db: Session = Depends(get_db)):
    faculty = Faculty(**req.model_dump())
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty

@router.put("/faculty/{faculty_id}", response_model=FacultyOut)
def update_faculty(faculty_id: int, req: FacultyUpdate, db: Session = Depends(get_db)):
    fac = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fac, field, value)

    db.commit()
    db.refresh(fac)
    return fac

@router.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    fac = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    fac.is_active = False
    db.commit()
    return {"message": "Faculty deactivated successfully"}

# --- FACULTY-STUDENT ASSIGNMENTS ---
@router.get("/faculty/{faculty_id}/students", response_model=List[StudentOut])
def get_faculty_assigned_students(faculty_id: int, db: Session = Depends(get_db)):
    # Direct assignments
    direct_ids = [
        fs.student_id for fs in db.query(FacultyStudent).filter(FacultyStudent.faculty_id == faculty_id).all()
    ]
    # Section assignments
    sec_ids = [
        fs.section_id for fs in db.query(FacultySection).filter(FacultySection.faculty_id == faculty_id).all()
    ]
    sec_student_ids = [
        ss.student_id for ss in db.query(SectionStudent).filter(SectionStudent.section_id.in_(sec_ids)).all()
    ]
    all_ids = list(set(direct_ids + sec_student_ids))
    return db.query(Student).filter(Student.student_id.in_(all_ids), Student.is_active == True).all()

@router.post("/faculty/{faculty_id}/assign-students")
def assign_students_to_faculty(faculty_id: int, req: AssignStudentsRequest, db: Session = Depends(get_db)):
    fac = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty not found")

    for sid in req.student_ids:
        existing = db.query(FacultyStudent).filter(
            FacultyStudent.faculty_id == faculty_id,
            FacultyStudent.student_id == sid
        ).first()
        if not existing:
            new_fs = FacultyStudent(faculty_id=faculty_id, student_id=sid)
            db.add(new_fs)

    db.commit()
    return {"message": f"{len(req.student_ids)} students successfully assigned to {fac.full_name}"}

@router.delete("/faculty/{faculty_id}/remove-student/{student_id}")
def remove_student_from_faculty(faculty_id: int, student_id: int, db: Session = Depends(get_db)):
    # 1. Remove direct mentor assignment if exists
    db.query(FacultyStudent).filter(
        FacultyStudent.faculty_id == faculty_id,
        FacultyStudent.student_id == student_id
    ).delete(synchronize_session=False)

    # 2. Also remove from any section assignments associated with this faculty
    fac_sections = db.query(FacultySection).filter(FacultySection.faculty_id == faculty_id).all()
    sec_ids = [fs.section_id for fs in fac_sections]
    if sec_ids:
        db.query(SectionStudent).filter(
            SectionStudent.student_id == student_id,
            SectionStudent.section_id.in_(sec_ids)
        ).delete(synchronize_session=False)

    db.commit()
    return {"message": "Student assignment removed successfully"}

# --- SECTIONS CRUD ---
@router.get("/sections", response_model=List[SectionOut])
def get_all_sections(db: Session = Depends(get_db)):
    return db.query(Section).all()

@router.post("/sections", response_model=SectionOut)
def create_section(req: SectionCreate, db: Session = Depends(get_db)):
    section = Section(**req.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section
