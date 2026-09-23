from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    faculty_id: int
    username: str
    full_name: str

# Academic Session Schemas
class AcademicSessionBase(BaseModel):
    session_name: str # e.g. "Nov-Dec 2025", "Apr-May 2026"
    academic_year: str # e.g. "2025-2026"
    is_active: bool = True

class AcademicSessionCreate(AcademicSessionBase):
    pass

class AcademicSessionOut(AcademicSessionBase):
    session_id: int
    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    dept_name: str
    dept_code: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    dept_id: int
    class Config:
        from_attributes = True

# Course Schemas
class CourseBase(BaseModel):
    course_name: str
    short_name: str
    degree: str
    branch_code: str
    duration_yrs: int = 4
    total_sems: int = 8

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    course_id: int
    class Config:
        from_attributes = True

# Student Schemas
class StudentBase(BaseModel):
    reg_no: str
    name: str
    course_id: int
    batch_year: int
    regulation: str
    current_sem: int = 1
    section: str = "A"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    reg_no: Optional[str] = None
    course_id: Optional[int] = None
    batch_year: Optional[int] = None
    regulation: Optional[str] = None
    current_sem: Optional[int] = None
    section: Optional[str] = None
    is_active: Optional[bool] = None

class StudentOut(StudentBase):
    student_id: int
    is_active: bool
    course: Optional[CourseOut] = None
    assigned_faculty_name: Optional[str] = None
    class Config:
        from_attributes = True

# Subject Schemas
class SubjectBase(BaseModel):
    subject_code: str
    subject_name: str
    credits: float
    subject_type: str
    semester: int
    course_id: int
    regulation: str
    category: str = "Core" # Core, Professional Elective, Open Elective, Honors, Minors, Naan Mudhalvan, Internship, Project

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    subject_id: int
    is_active: bool
    class Config:
        from_attributes = True

# Student Custom Subject Schemas (Honors / Minors / Naan Mudhalvan / Electives)
class StudentCustomSubjectBase(BaseModel):
    student_id: int
    subject_id: int
    semester: int
    category: str = "Ad-hoc"
    session_id: Optional[int] = None

class StudentCustomSubjectCreate(StudentCustomSubjectBase):
    pass

class StudentCustomSubjectOut(StudentCustomSubjectBase):
    id: int
    subject: Optional[SubjectOut] = None
    class Config:
        from_attributes = True

# Grade Scale Schema
class GradeScaleOut(BaseModel):
    id: int
    regulation: str
    grade_letter: str
    grade_point: float
    marks_min: Optional[int] = None
    marks_max: Optional[int] = None
    is_pass: bool
    display_order: int
    class Config:
        from_attributes = True

# Mark Entry Schema
class SemesterSheetItem(BaseModel):
    subject_id: int
    subject_code: str
    subject_name: str
    credits: float
    subject_type: str
    original_semester: int
    is_arrear: bool
    attempt: int
    category: str = "Core" # Core, Arrear, Honors, Minors, Elective, Naan Mudhalvan, Internship, Project
    grade_letter: str = ""
    grade_point: float = 0.0
    is_pass: bool = True

class MarkItem(BaseModel):
    subject_id: int
    grade_letter: str
    grade_point: float
    attempt: int = 1
    is_pass: bool = True

class SaveMarksRequest(BaseModel):
    reg_no: str
    semester: int
    marks: List[MarkItem]

class MarkOut(BaseModel):
    mark_id: int
    reg_no: str
    subject_id: int
    semester: int
    attempt: int
    grade_letter: str
    grade_point: float
    is_pass: bool
    session_id: Optional[int] = None
    subject: Optional[SubjectOut] = None
    class Config:
        from_attributes = True

class SemesterResultOut(BaseModel):
    reg_no: str
    semester: int
    sgpa: float
    cgpa: float
    total_credits: float
    class Config:
        from_attributes = True

# Faculty Schemas
class FacultyBase(BaseModel):
    username: str
    full_name: str
    department: str
    role: str = "faculty"

class FacultyCreate(FacultyBase):
    password: str

class FacultyUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class FacultyOut(FacultyBase):
    faculty_id: int
    is_active: bool
    assigned_students_count: Optional[int] = 0
    class Config:
        from_attributes = True

# Section Schemas
class SectionBase(BaseModel):
    section_name: str
    course_id: int
    batch_year: int
    regulation: str

class SectionCreate(SectionBase):
    pass

class SectionOut(SectionBase):
    section_id: int
    course: Optional[CourseOut] = None
    class Config:
        from_attributes = True

class AssignStudentsRequest(BaseModel):
    student_ids: List[int]
