from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.student_service import student_service

router = APIRouter()

class StudentCreateUpdate(BaseModel):
    school_id: str
    student_id: str
    student_name: str
    admission_number: Optional[str] = None
    temporary_password: Optional[str] = None
    grade: Optional[str] = None
    section: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = 'active'

class StatusUpdate(BaseModel):
    status: str

@router.post("")
async def create_student(data: StudentCreateUpdate):
    try:
        student = student_service.create_student(data.model_dump(exclude_unset=True))
        return {"success": True, "student": student}
    except Exception as e:
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="Student ID or Admission Number already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def get_all_students():
    try:
        students = student_service.get_students()
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{student_id}")
async def get_student(student_id: str):
    try:
        student = student_service.get_student_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/school/{school_id}")
async def get_students_by_school(school_id: str):
    try:
        students = student_service.get_students_by_school(school_id)
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{student_id}")
async def update_student(student_id: str, data: StudentCreateUpdate):
    try:
        student = student_service.update_student(student_id, data.model_dump(exclude_unset=True))
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    except HTTPException:
        raise
    except Exception as e:
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="Student ID or Admission Number already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{student_id}/status")
async def deactivate_student(student_id: str, data: StatusUpdate):
    try:
        student = student_service.update_student(student_id, {"status": data.status})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
