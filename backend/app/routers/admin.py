from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Course, Subject, Student, Faculty, Section, SectionStudent, FacultySection
from ..schemas import (
    CourseCreate, CourseOut,
    SubjectCreate, SubjectOut,
    StudentCreate, StudentOut,
    FacultyCreate, FacultyOut,
    SectionCreate, SectionOut
)
from ..auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(require_admin)])

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

# --- STUDENTS CRUD ---
@router.get("/students", response_model=List[StudentOut])
def get_admin_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

@router.post("/students", response_model=StudentOut)
def create_student(req: StudentCreate, db: Session = Depends(get_db)):
    student = Student(**req.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

# --- FACULTY CRUD ---
@router.get("/faculty", response_model=List[FacultyOut])
def get_all_faculty(db: Session = Depends(get_db)):
    return db.query(Faculty).all()

@router.post("/faculty", response_model=FacultyOut)
def create_faculty(req: FacultyCreate, db: Session = Depends(get_db)):
    faculty = Faculty(**req.model_dump())
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty

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

@router.post("/sections/{section_id}/assign-student/{student_id}")
def assign_student_to_section(section_id: int, student_id: int, db: Session = Depends(get_db)):
    existing = db.query(SectionStudent).filter(
        SectionStudent.section_id == section_id,
        SectionStudent.student_id == student_id
    ).first()
    if not existing:
        ss = SectionStudent(section_id=section_id, student_id=student_id)
        db.add(ss)
        db.commit()
    return {"message": "Student assigned to section successfully"}

@router.post("/sections/{section_id}/assign-faculty/{faculty_id}")
def assign_faculty_to_section(section_id: int, faculty_id: int, db: Session = Depends(get_db)):
    existing = db.query(FacultySection).filter(
        FacultySection.section_id == section_id,
        FacultySection.faculty_id == faculty_id
    ).first()
    if not existing:
        fs = FacultySection(section_id=section_id, faculty_id=faculty_id)
        db.add(fs)
        db.commit()
    return {"message": "Faculty assigned to section successfully"}
