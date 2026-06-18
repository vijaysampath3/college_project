from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Dict, Any, List
from pydantic import BaseModel
from services.teacher_student_service import TeacherStudentService
from services.supabase_client import get_supabase_client

router = APIRouter()

def get_current_user_id(authorization: str = Header(...)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    supabase = get_supabase_client()
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

class StudentCreate(BaseModel):
    student_id: str = None
    temporary_password: str = None
    student_name: str
    grade: str = None
    section: str = None
    date_of_birth: str = None
    gender: str = None
    phone: str = None
    email: str = None
    emergency_contact_name: str = None
    emergency_contact_number: str = None
    enrollment_date: str = None

class StudentUpdate(BaseModel):
    student_name: str = None
    grade: str = None
    section: str = None
    date_of_birth: str = None
    gender: str = None
    phone: str = None
    email: str = None
    emergency_contact_name: str = None
    emergency_contact_number: str = None

class StatusUpdate(BaseModel):
    status: str

class PasswordReset(BaseModel):
    password: str

@router.get("/next-id")
async def get_next_id(user_id: str = Depends(get_current_user_id)):
    # Optional: verify teacher context
    return {"next_id": TeacherStudentService.generate_student_id()}

@router.get("/")
async def get_students(user_id: str = Depends(get_current_user_id)):
    return TeacherStudentService.get_students_by_teacher(user_id)

@router.post("/")
async def create_student(student: StudentCreate, user_id: str = Depends(get_current_user_id)):
    return TeacherStudentService.create_student(user_id, student.dict(exclude_none=True))

@router.get("/{student_id}")
async def get_student(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherStudentService.get_student_by_id(user_id, student_id)

@router.put("/{student_id}")
async def update_student(student_id: str, data: StudentUpdate, user_id: str = Depends(get_current_user_id)):
    return TeacherStudentService.update_student(user_id, student_id, data.dict(exclude_none=True))

@router.patch("/{student_id}/status")
async def deactivate_student(student_id: str, data: StatusUpdate, user_id: str = Depends(get_current_user_id)):
    return TeacherStudentService.deactivate_student(user_id, student_id, data.status)

@router.post("/{student_id}/reset-password")
async def reset_password(student_id: str, data: PasswordReset, user_id: str = Depends(get_current_user_id)):
    return TeacherStudentService.reset_student_password(user_id, student_id, data.password)
