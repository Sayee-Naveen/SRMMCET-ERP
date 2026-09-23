from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Faculty
from ..schemas import LoginRequest, TokenResponse
from ..auth import create_access_token

router = APIRouter(prefix="/api", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Faculty).filter(Faculty.username == req.username, Faculty.is_active == True).first()
    if not user or user.password != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.faculty_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "faculty_id": user.faculty_id,
        "username": user.username,
        "full_name": user.full_name
    }
