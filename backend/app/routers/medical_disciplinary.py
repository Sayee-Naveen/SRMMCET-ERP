import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import MedicalRecord, DisciplinaryAction, Student, Faculty
from ..schemas_medical import (
    MedicalRecordBase, MedicalRecordCreate, MedicalRecordOut,
    DisciplinaryActionBase, DisciplinaryActionCreate, DisciplinaryActionOut, DisciplinaryStatusUpdate
)
from ..auth import get_current_user

router = APIRouter(
    prefix="/api/medical-disciplinary",
    tags=["Medical & Disciplinary"]
)

# Upload directory configuration
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------------------------------------------
# FILE & SIGNATURE UPLOAD ENDPOINT
# ----------------------------------------------------
@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    current_user: Faculty = Depends(get_current_user)
):
    """
    Secure file uploader for medical reports, supporting documents, and signatures.
    Supports PDF, PNG, JPG, JPEG (Max 5MB).
    """
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file_ext}'. Allowed formats: PDF, PNG, JPG, JPEG, WEBP."
        )

    # Read and check size limit (5MB max)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 5MB."
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    return {
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}",
        "original_name": file.filename
    }

# ----------------------------------------------------
# MEDICAL RECORDS ENDPOINTS
# ----------------------------------------------------
@router.get("/students/{student_id}/medical", response_model=List[MedicalRecordOut])
def get_student_medical_records(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    records = db.query(MedicalRecord).filter(MedicalRecord.student_id == student_id).order_by(MedicalRecord.id.desc()).all()
    return records

@router.post("/students/{student_id}/medical", response_model=MedicalRecordOut)
def create_medical_record(
    student_id: int,
    data: MedicalRecordBase,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_record = MedicalRecord(
        student_id=student_id,
        record_type=data.record_type,
        incident_date=data.incident_date,
        diagnosis_details=data.diagnosis_details,
        doctor_hospital_name=data.doctor_hospital_name,
        treatment_prescribed=data.treatment_prescribed,
        document_url=data.document_url,
        signature_url=data.signature_url,
        recorded_by=current_user.full_name
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.delete("/medical/{record_id}", response_model=dict)
def delete_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can delete medical records")

    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    db.delete(record)
    db.commit()
    return {"detail": "Medical record successfully deleted"}

# ----------------------------------------------------
# DISCIPLINARY ACTIONS ENDPOINTS
# ----------------------------------------------------
@router.get("/students/{student_id}/disciplinary", response_model=List[DisciplinaryActionOut])
def get_student_disciplinary_actions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    actions = db.query(DisciplinaryAction).filter(DisciplinaryAction.student_id == student_id).order_by(DisciplinaryAction.id.desc()).all()
    return actions

@router.post("/students/{student_id}/disciplinary", response_model=DisciplinaryActionOut)
def create_disciplinary_action(
    student_id: int,
    data: DisciplinaryActionBase,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_action = DisciplinaryAction(
        student_id=student_id,
        incident_date=data.incident_date,
        action_date=data.action_date,
        category=data.category,
        report_description=data.report_description,
        action_taken=data.action_taken,
        status=data.status or "Active",
        supporting_doc_url=data.supporting_doc_url,
        student_signature_url=data.student_signature_url,
        authority_signature_url=data.authority_signature_url,
        recorded_by=current_user.full_name
    )

    db.add(new_action)
    db.commit()
    db.refresh(new_action)
    return new_action

@router.patch("/disciplinary/{action_id}/status", response_model=DisciplinaryActionOut)
def update_disciplinary_status(
    action_id: int,
    status_data: DisciplinaryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    action = db.query(DisciplinaryAction).filter(DisciplinaryAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Disciplinary action record not found")

    valid_statuses = {"Pending Review", "Active", "Resolved", "Revoked"}
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from {valid_statuses}")

    action.status = status_data.status
    db.commit()
    db.refresh(action)
    return action

@router.delete("/disciplinary/{action_id}", response_model=dict)
def delete_disciplinary_action(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can delete disciplinary actions")

    action = db.query(DisciplinaryAction).filter(DisciplinaryAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Disciplinary action record not found")

    db.delete(action)
    db.commit()
    return {"detail": "Disciplinary action successfully deleted"}
