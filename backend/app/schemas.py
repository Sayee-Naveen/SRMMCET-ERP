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

class StudentOut(StudentBase):
    student_id: int
    is_active: bool
    course: Optional[CourseOut] = None
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

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    subject_id: int
    is_active: bool
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

class FacultyOut(FacultyBase):
    faculty_id: int
    is_active: bool
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
