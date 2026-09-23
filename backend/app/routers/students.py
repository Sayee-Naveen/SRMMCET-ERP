from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Student, FacultySection, SectionStudent, Faculty, Course
from ..schemas import StudentOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("", response_model=List[StudentOut])
def get_students(current_user: Faculty = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        return db.query(Student).filter(Student.is_active == True).all()

    # Faculty scoped students
    assigned_section_ids = [
        fs.section_id for fs in db.query(FacultySection).filter(FacultySection.faculty_id == current_user.faculty_id).all()
    ]
    student_ids = [
        ss.student_id for ss in db.query(SectionStudent).filter(SectionStudent.section_id.in_(assigned_section_ids)).all()
    ]

    students = db.query(Student).filter(Student.student_id.in_(student_ids), Student.is_active == True).all()
    return students

@router.get("/{reg_no}", response_model=StudentOut)
def get_student_by_reg(reg_no: str, current_user: Faculty = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.reg_no == reg_no, Student.is_active == True).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
