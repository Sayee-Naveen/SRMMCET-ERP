from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dept_name = Column(String(100), nullable=False, unique=True)
    dept_code = Column(String(20), nullable=False, unique=True)

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_name = Column(String(150), nullable=False)
    short_name = Column(String(30), nullable=False)
    degree = Column(String(20), nullable=False)
    branch_code = Column(String(10), nullable=False, unique=True)
    duration_yrs = Column(Integer, default=4)
    total_sems = Column(Integer, default=8)

    students = relationship("Student", back_populates="course")
    subjects = relationship("Subject", back_populates="course")
    sections = relationship("Section", back_populates="course")

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reg_no = Column(String(20), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)
    batch_year = Column(Integer, nullable=False)
    regulation = Column(String(10), nullable=False) # R2021 or R2025
    current_sem = Column(Integer, default=1)
    section = Column(String(10), default="A")
    is_active = Column(Boolean, default=True)

    course = relationship("Course", back_populates="students")
    section_assignments = relationship("SectionStudent", back_populates="student")
    faculty_assignments = relationship("FacultyStudent", back_populates="student")
    medical_records = relationship("MedicalRecord", back_populates="student")
    disciplinary_actions = relationship("DisciplinaryAction", back_populates="student")

class GradeScale(Base):
    __tablename__ = "grade_scale"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    regulation = Column(String(10), nullable=False)
    grade_letter = Column(String(5), nullable=False)
    grade_point = Column(Float, nullable=False)
    marks_min = Column(Integer, nullable=True)
    marks_max = Column(Integer, nullable=True)
    is_pass = Column(Boolean, default=True)
    display_order = Column(Integer, nullable=False)

class Subject(Base):
    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subject_code = Column(String(20), nullable=False)
    subject_name = Column(String(200), nullable=False)
    credits = Column(Float, nullable=False)
    subject_type = Column(String(20), nullable=False) # Theory, Practical, Activity
    semester = Column(Integer, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)
    regulation = Column(String(10), nullable=False)
    is_active = Column(Boolean, default=True)

    course = relationship("Course", back_populates="subjects")
    marks = relationship("Mark", back_populates="subject")

class Faculty(Base):
    __tablename__ = "faculty"

    faculty_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True, index=True)
    password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    role = Column(String(20), default="faculty") # faculty or admin
    is_active = Column(Boolean, default=True)

    assigned_sections = relationship("FacultySection", back_populates="faculty")
    assigned_students = relationship("FacultyStudent", back_populates="faculty")

class Section(Base):
    __tablename__ = "sections"

    section_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    section_name = Column(String(50), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)
    batch_year = Column(Integer, nullable=False)
    regulation = Column(String(10), nullable=False)

    course = relationship("Course", back_populates="sections")
    student_assignments = relationship("SectionStudent", back_populates="section")
    faculty_assignments = relationship("FacultySection", back_populates="section")

class SectionStudent(Base):
    __tablename__ = "section_students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    section_id = Column(Integer, ForeignKey("sections.section_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)

    section = relationship("Section", back_populates="student_assignments")
    student = relationship("Student", back_populates="section_assignments")

class FacultySection(Base):
    __tablename__ = "faculty_sections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    faculty_id = Column(Integer, ForeignKey("faculty.faculty_id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.section_id"), nullable=False)

    faculty = relationship("Faculty", back_populates="assigned_sections")
    section = relationship("Section", back_populates="faculty_assignments")

class FacultyStudent(Base):
    __tablename__ = "faculty_students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    faculty_id = Column(Integer, ForeignKey("faculty.faculty_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)

    faculty = relationship("Faculty", back_populates="assigned_students")
    student = relationship("Student", back_populates="faculty_assignments")

class Mark(Base):
    __tablename__ = "marks"

    mark_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reg_no = Column(String(20), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    semester = Column(Integer, nullable=False)
    attempt = Column(Integer, default=1)
    grade_letter = Column(String(5), nullable=False)
    grade_point = Column(Float, nullable=False)
    is_pass = Column(Boolean, default=True)
    entered_by = Column(Integer, nullable=True)
    entered_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subject = relationship("Subject", back_populates="marks")

class SemesterResult(Base):
    __tablename__ = "semester_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reg_no = Column(String(20), nullable=False, index=True)
    semester = Column(Integer, nullable=False)
    sgpa = Column(Float, nullable=False)
    cgpa = Column(Float, nullable=False)
    total_credits = Column(Float, nullable=False)
    computed_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False, index=True)
    record_type = Column(String(50), nullable=False) # Routine Checkup, Emergency, Medical Leave, Chronic Condition, Allergy Notice
    incident_date = Column(String(20), nullable=False)
    diagnosis_details = Column(Text, nullable=False)
    doctor_hospital_name = Column(String(150), nullable=True)
    treatment_prescribed = Column(Text, nullable=True)
    document_url = Column(String(255), nullable=True)
    signature_url = Column(String(255), nullable=True)
    recorded_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="medical_records")

class DisciplinaryAction(Base):
    __tablename__ = "disciplinary_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False, index=True)
    incident_date = Column(String(20), nullable=False)
    action_date = Column(String(20), nullable=False)
    category = Column(String(100), nullable=False) # Attendance Shortage, Misconduct, Academic Malpractice, Property Damage, Other
    report_description = Column(Text, nullable=False)
    action_taken = Column(String(100), nullable=False) # Verbal Warning, Written Warning, Parent Summoned, Fine Imposed, Suspension, Expulsion
    status = Column(String(30), default="Active") # Pending Review, Active, Resolved, Revoked
    supporting_doc_url = Column(String(255), nullable=True)
    student_signature_url = Column(String(255), nullable=True)
    authority_signature_url = Column(String(255), nullable=True)
    recorded_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="disciplinary_actions")

