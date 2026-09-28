from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class ActivityCategory(Base):
    __tablename__ = "activity_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_code = Column(String(50), unique=True, nullable=False) # SPORTS, CULTURAL, CLUBS, NSS_NCC, MUSIC, DANCE, LITERARY, SOCIAL_SERVICE
    display_name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    icon_name = Column(String(50), default="Award")
    badge_color = Column(String(50), default="blue")
    display_order = Column(Integer, default=1)

class ModuleStudent(Base):
    __tablename__ = "module_students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reg_no = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False) # CSE, IT, ECE, MECH, etc.
    degree = Column(String(20), default="B.E.")
    batch_year = Column(Integer, nullable=False)
    regulation = Column(String(10), default="R2021")
    current_sem = Column(Integer, default=2)
    section = Column(String(10), default="A")

    activities = relationship("ExtraCurricularActivity", back_populates="student")

class ModuleFaculty(Base):
    __tablename__ = "module_faculty"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    role = Column(String(20), default="faculty") # faculty or admin
    is_active = Column(Boolean, default=True)

class ExtraCurricularActivity(Base):
    __tablename__ = "extra_curricular_activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reg_no = Column(String(20), ForeignKey("module_students.reg_no"), nullable=False, index=True)
    regulation = Column(String(10), default="R2021", nullable=False) # R2021 or R2025 (selective)
    category = Column(String(50), nullable=False, index=True) # Sports, Cultural, Clubs, NSS/NCC, Music, Dance, Literary, Social Service
    sub_category = Column(String(100), nullable=False) # e.g. Badminton, Robotics Club, Blood Donation, Custom Sport/Game
    title = Column(String(200), nullable=False)
    organizer = Column(String(150), nullable=False)
    level = Column(String(50), default="College") # Department, College, Inter-Collegiate, Zonal, State, National, International
    role = Column(String(50), default="Participant") # Participant, Winner, Runner-Up, Team Captain, Volunteer, Cadet, President, Coordinator
    achievement = Column(String(100), default="Completed") # 1st Place, Winner, Runner-Up, Completed, Custom
    event_date = Column(String(20), nullable=False) # YYYY-MM-DD
    academic_year = Column(String(20), default="2024-2025")
    semester = Column(Integer, default=1)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("ModuleStudent", back_populates="activities")
    certificates = relationship("ActivityCertificate", back_populates="activity", cascade="all, delete-orphan")

class ActivityCertificate(Base):
    __tablename__ = "activity_certificates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    activity_id = Column(Integer, ForeignKey("extra_curricular_activities.id"), nullable=False)
    certificate_no = Column(String(60), nullable=True, index=True)
    title = Column(String(200), nullable=True)
    issuing_authority = Column(String(150), nullable=True)
    issue_date = Column(String(20), nullable=True)
    file_url = Column(String(300), nullable=True) # Uploaded certificate file path / preview
    file_type = Column(String(50), default="image/png")
    created_at = Column(DateTime, default=datetime.utcnow)

    activity = relationship("ExtraCurricularActivity", back_populates="certificates")
