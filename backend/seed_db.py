import os
from sqlalchemy import create_engine
from app.database import engine
from app.models import Base, Course, GradeScale, Student, Subject, Faculty, Section, SectionStudent, FacultySection, Mark, SemesterResult
from sqlalchemy.orm import sessionmaker

def seed_db():
    Session = sessionmaker(bind=engine)
    db = Session()

    # Check if courses exist
    if db.query(Course).count() > 0:
        print("[SEED] Database already contains seed data.")
        db.close()
        return

    print("[SEED] Seeding database with initial SRMMCET courses, subjects, grade scales, and demo users...")

    # 1. Courses
    c1 = Course(course_name="B.E. Computer Science and Engineering", short_name="CSE", degree="B.E.", branch_code="104", duration_yrs=4, total_sems=8)
    c2 = Course(course_name="B.Tech Information Technology", short_name="IT", degree="B.Tech", branch_code="205", duration_yrs=4, total_sems=8)
    db.add_all([c1, c2])
    db.commit()

    # 2. Grade Scale R2021
    gs_r21 = [
        GradeScale(regulation="R2021", grade_letter="O",  grade_point=10.0, is_pass=True, display_order=1),
        GradeScale(regulation="R2021", grade_letter="A+", grade_point=9.0,  is_pass=True, display_order=2),
        GradeScale(regulation="R2021", grade_letter="A",  grade_point=8.0,  is_pass=True, display_order=3),
        GradeScale(regulation="R2021", grade_letter="B+", grade_point=7.0,  is_pass=True, display_order=4),
        GradeScale(regulation="R2021", grade_letter="B",  grade_point=6.0,  is_pass=True, display_order=5),
        GradeScale(regulation="R2021", grade_letter="C",  grade_point=5.0,  is_pass=True, display_order=6),
        GradeScale(regulation="R2021", grade_letter="U",  grade_point=0.0,  is_pass=False, display_order=7),
        GradeScale(regulation="R2021", grade_letter="SA", grade_point=0.0,  is_pass=False, display_order=8),
    ]
    # Grade Scale R2025
    gs_r25 = [
        GradeScale(regulation="R2025", grade_letter="S",  grade_point=10.0, is_pass=True, display_order=1, marks_min=91, marks_max=100),
        GradeScale(regulation="R2025", grade_letter="A+", grade_point=9.0,  is_pass=True, display_order=2, marks_min=81, marks_max=90),
        GradeScale(regulation="R2025", grade_letter="A",  grade_point=8.0,  is_pass=True, display_order=3, marks_min=71, marks_max=80),
        GradeScale(regulation="R2025", grade_letter="B+", grade_point=7.0,  is_pass=True, display_order=4, marks_min=66, marks_max=70),
        GradeScale(regulation="R2025", grade_letter="B",  grade_point=6.5,  is_pass=True, display_order=5, marks_min=61, marks_max=65),
        GradeScale(regulation="R2025", grade_letter="C+", grade_point=6.0,  is_pass=True, display_order=6, marks_min=56, marks_max=60),
        GradeScale(regulation="R2025", grade_letter="C",  grade_point=5.0,  is_pass=True, display_order=7, marks_min=50, marks_max=55),
        GradeScale(regulation="R2025", grade_letter="U",  grade_point=0.0,  is_pass=False, display_order=8, marks_min=0,  marks_max=49),
    ]
    db.add_all(gs_r21 + gs_r25)

    # 3. Faculty
    f_admin = Faculty(username="admin", password="admin123", full_name="ERP Administrator", department="Academic Cell", role="admin")
    f_kumar = Faculty(username="prof.kumar", password="kumar123", full_name="Dr. R. Kumar", department="Computer Science", role="faculty")
    f_meena = Faculty(username="prof.meena", password="meena123", full_name="Dr. S. Meena", department="Information Technology", role="faculty")
    db.add_all([f_admin, f_kumar, f_meena])
    db.commit()

    # 4. Students
    st1 = Student(reg_no="911124104001", name="Arjun R", course_id=c1.course_id, batch_year=2024, regulation="R2021", current_sem=2, section="A")
    st2 = Student(reg_no="911124104002", name="Priya S", course_id=c1.course_id, batch_year=2024, regulation="R2021", current_sem=2, section="A")
    st3 = Student(reg_no="911125104001", name="Suresh M", course_id=c1.course_id, batch_year=2025, regulation="R2025", current_sem=1, section="A")
    st4 = Student(reg_no="911124205001", name="Karthik M", course_id=c2.course_id, batch_year=2024, regulation="R2021", current_sem=2, section="A")
    db.add_all([st1, st2, st3, st4])
    db.commit()

    # 5. Subjects CSE R2021 Sem 1
    subs = [
        Subject(subject_code="HS3151", subject_name="Professional English - I", credits=3.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="MA3151", subject_name="Matrices and Calculus", credits=4.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="PH3151", subject_name="Engineering Physics", credits=3.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="CY3151", subject_name="Engineering Chemistry", credits=3.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="GE3151", subject_name="Problem Solving and Python", credits=3.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="GE3152", subject_name="Heritage of Tamils", credits=1.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="GE3171", subject_name="Python Lab", credits=2.0, subject_type="Practical", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="BS3171", subject_name="Physics & Chemistry Lab", credits=2.0, subject_type="Practical", semester=1, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="GE3172", subject_name="English Lab", credits=1.0, subject_type="Practical", semester=1, course_id=c1.course_id, regulation="R2021"),
        # Sem 2
        Subject(subject_code="HS3251", subject_name="Professional English - II", credits=2.0, subject_type="Theory", semester=2, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="MA3251", subject_name="Statistics & Numerical Methods", credits=4.0, subject_type="Theory", semester=2, course_id=c1.course_id, regulation="R2021"),
        Subject(subject_code="CS3251", subject_name="Programming in C", credits=3.0, subject_type="Theory", semester=2, course_id=c1.course_id, regulation="R2021"),
        # CSE R2025 Sem 1
        Subject(subject_code="HS4151", subject_name="Technical English", credits=3.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2025"),
        Subject(subject_code="MA4151", subject_name="Linear Algebra and Calculus", credits=4.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2025"),
        Subject(subject_code="CS4151", subject_name="Programming Fundamentals", credits=3.0, subject_type="Theory", semester=1, course_id=c1.course_id, regulation="R2025"),
    ]
    db.add_all(subs)
    db.commit()

    # 6. Sections
    sec1 = Section(section_name="CSE-A-2024", course_id=c1.course_id, batch_year=2024, regulation="R2021")
    sec2 = Section(section_name="CSE-A-2025", course_id=c1.course_id, batch_year=2025, regulation="R2025")
    sec3 = Section(section_name="IT-A-2024", course_id=c2.course_id, batch_year=2024, regulation="R2021")
    db.add_all([sec1, sec2, sec3])
    db.commit()

    # 7. Section Assignments
    db.add_all([
        SectionStudent(section_id=sec1.section_id, student_id=st1.student_id),
        SectionStudent(section_id=sec1.section_id, student_id=st2.student_id),
        SectionStudent(section_id=sec2.section_id, student_id=st3.student_id),
        SectionStudent(section_id=sec3.section_id, student_id=st4.student_id),

        FacultySection(faculty_id=f_kumar.faculty_id, section_id=sec1.section_id),
        FacultySection(faculty_id=f_kumar.faculty_id, section_id=sec2.section_id),
        FacultySection(faculty_id=f_meena.faculty_id, section_id=sec3.section_id)
    ])
    db.commit()
    print("[SEED] Seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
