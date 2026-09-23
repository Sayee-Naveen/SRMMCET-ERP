from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import (
    Course, Subject, Student, Faculty, Section, SectionStudent,
    FacultySection, Department, FacultyStudent
)
from ..schemas import (
    CourseCreate, CourseOut,
    SubjectCreate, SubjectOut,
    StudentCreate, StudentUpdate, StudentOut,
    FacultyCreate, FacultyUpdate, FacultyOut,
    SectionCreate, SectionOut,
    DepartmentCreate, DepartmentOut,
    AssignStudentsRequest
)
from ..auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(require_admin)])

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

# --- STUDENTS CRUD & EDIT ---
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

# --- FACULTY CRUD & EDIT ---
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
    record = db.query(FacultyStudent).filter(
        FacultyStudent.faculty_id == faculty_id,
        FacultyStudent.student_id == student_id
    ).first()
    if record:
        db.delete(record)
        db.commit()
    return {"message": "Student assignment removed"}

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
