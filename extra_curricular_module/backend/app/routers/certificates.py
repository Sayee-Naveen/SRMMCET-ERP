import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ActivityCertificate, ExtraCurricularActivity
from ..schemas import CertificateOut

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "certificates")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[CertificateOut])
def list_certificates(
    search: Optional[str] = Query(None, description="Search certificate no or title"),
    db: Session = Depends(get_db)
):
    query = db.query(ActivityCertificate)

    if search:
        s = f"%{search}%"
        query = query.filter(
            (ActivityCertificate.certificate_no.ilike(s)) |
            (ActivityCertificate.title.ilike(s)) |
            (ActivityCertificate.issuing_authority.ilike(s))
        )

    return query.order_by(ActivityCertificate.id.desc()).all()

@router.get("/{cert_id}", response_model=CertificateOut)
def get_certificate(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(ActivityCertificate).filter(ActivityCertificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

@router.post("/upload")
async def upload_certificate_file(
    file: UploadFile = File(...)
):
    allowed_exts = {".png", ".jpg", ".jpeg", ".webp", ".pdf", ".svg"}
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in allowed_exts:
        raise HTTPException(status_code=400, detail="Supported file formats: PNG, JPG, WEBP, PDF, SVG")

    clean_filename = f"cert_{uuid.uuid4().hex[:12]}{ext.lower()}"
    target_path = os.path.join(UPLOAD_DIR, clean_filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "file_url": f"http://127.0.0.1:8001/uploads/certificates/{clean_filename}",
        "filename": clean_filename,
        "file_type": file.content_type
    }
