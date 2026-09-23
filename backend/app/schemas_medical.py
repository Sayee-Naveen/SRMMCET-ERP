from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Medical Record Schemas
class MedicalRecordBase(BaseModel):
    record_type: str = Field(..., description="Routine Checkup, Emergency, Medical Leave, Chronic Condition, Allergy Notice")
    incident_date: str = Field(..., description="YYYY-MM-DD")
    diagnosis_details: str = Field(..., min_length=5)
    doctor_hospital_name: Optional[str] = None
    treatment_prescribed: Optional[str] = None
    document_url: Optional[str] = None
    signature_url: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    student_id: int

class MedicalRecordOut(MedicalRecordBase):
    id: int
    student_id: int
    recorded_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Disciplinary Action Schemas
class DisciplinaryActionBase(BaseModel):
    incident_date: str = Field(..., description="YYYY-MM-DD")
    action_date: str = Field(..., description="YYYY-MM-DD")
    category: str = Field(..., description="Attendance Shortage, Misconduct, Academic Malpractice, Property Damage, Other")
    report_description: str = Field(..., min_length=5)
    action_taken: str = Field(..., description="Verbal Warning, Written Warning, Parent Summoned, Fine Imposed, Suspension, Expulsion")
    status: Optional[str] = Field("Active", description="Pending Review, Active, Resolved, Revoked")
    supporting_doc_url: Optional[str] = None
    student_signature_url: Optional[str] = None
    authority_signature_url: Optional[str] = None

class DisciplinaryActionCreate(DisciplinaryActionBase):
    student_id: int

class DisciplinaryStatusUpdate(BaseModel):
    status: str

class DisciplinaryActionOut(DisciplinaryActionBase):
    id: int
    student_id: int
    recorded_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
