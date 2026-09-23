from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: str
    department: str

# Student Schemas
class StudentOut(BaseModel):
    id: int
    reg_no: str
    name: str
    department: str
    degree: str
    batch_year: int
    regulation: str
    current_sem: int
    section: str

    class Config:
        from_attributes = True

# Certificate Schemas
class CertificateBase(BaseModel):
    certificate_no: Optional[str] = None
    title: Optional[str] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = "image/png"

class CertificateCreate(CertificateBase):
    pass

class CertificateOut(CertificateBase):
    id: int
    activity_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Activity Schemas
class ActivityBase(BaseModel):
    reg_no: str
    regulation: Optional[str] = "R2021" # Selectable: R2021, R2025
    category: str # Sports, Cultural, Clubs, NSS/NCC, Music, Dance, Literary, Social Service
    sub_category: str
    title: str
    organizer: str
    level: str = "College"
    role: str = "Participant"
    achievement: str = "Completed"
    event_date: str
    academic_year: str = "2024-2025"
    semester: int = 1
    description: Optional[str] = None

class ActivityCreate(ActivityBase):
    certificate: Optional[CertificateCreate] = None

class ActivityUpdate(BaseModel):
    regulation: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    title: Optional[str] = None
    organizer: Optional[str] = None
    level: Optional[str] = None
    role: Optional[str] = None
    achievement: Optional[str] = None
    event_date: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[int] = None
    description: Optional[str] = None

class ActivityOut(ActivityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    student: Optional[StudentOut] = None
    certificates: List[CertificateOut] = []

    class Config:
        from_attributes = True

# Student Portfolio Output
class StudentPortfolioOut(BaseModel):
    student: StudentOut
    total_activities: int
    total_certificates: int
    total_awards: int
    activities: List[ActivityOut]

# Category Master Schemas
class CategoryOut(BaseModel):
    id: int
    category_code: str
    display_name: str
    description: Optional[str] = None
    icon_name: str
    badge_color: str
    display_order: int

    class Config:
        from_attributes = True

# Analytics Summary Schemas
class CategoryMetric(BaseModel):
    category: str
    count: int
    certificates_count: int

class AnalyticsSummaryOut(BaseModel):
    total_activities: int
    total_certificates: int
    total_awards: int
    total_students_participated: int
    category_breakdown: List[CategoryMetric]
    recent_activities: List[ActivityOut]
