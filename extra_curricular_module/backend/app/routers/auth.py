from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ModuleFaculty
from ..schemas import LoginRequest, TokenResponse
from ..auth import create_access_token, get_current_user

router = APIRouter(prefix="/api", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(ModuleFaculty).filter(
        ModuleFaculty.username == payload.username,
        ModuleFaculty.password == payload.password,
        ModuleFaculty.is_active == True
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "full_name": user.full_name,
        "department": user.department
    }

@router.get("/me")
def get_me(current_user: ModuleFaculty = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "department": current_user.department,
        "role": current_user.role
    }
