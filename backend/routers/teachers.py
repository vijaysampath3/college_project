from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from services.teacher_service import teacher_service

router = APIRouter()

class TeacherCreate(BaseModel):
    school_id: str
    teacher_id: str
    employee_id: str
    teacher_name: str
    email: str
    phone: str = None
    department: str = None
    designation: str = None
    qualification: str = None
    joining_date: str = None
    temp_password: str = None

class TeacherUpdate(BaseModel):
    teacher_name: str = None
    email: str = None
    phone: str = None
    department: str = None
    designation: str = None
    qualification: str = None
    joining_date: str = None
    status: str = None
    school_id: str = None
    temp_password: str = None

class StatusUpdate(BaseModel):
    status: str

@router.post("/")
async def create_teacher(teacher: TeacherCreate):
    try:
        return teacher_service.create_teacher(teacher.dict(exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def get_teachers():
    try:
        return teacher_service.get_teachers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{teacher_id}")
async def get_teacher(teacher_id: str):
    teacher = teacher_service.get_teacher_by_id(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.get("/school/{school_id}")
async def get_teachers_by_school(school_id: str):
    try:
        return teacher_service.get_teachers_by_school(school_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{teacher_id}")
async def update_teacher(teacher_id: str, teacher: TeacherUpdate):
    try:
        return teacher_service.update_teacher(teacher_id, teacher.dict(exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{teacher_id}/status")
async def update_teacher_status(teacher_id: str, status_update: StatusUpdate):
    try:
        return teacher_service.update_teacher(teacher_id, {"status": status_update.status})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{teacher_id}/stats")
async def get_teacher_stats(teacher_id: str):
    try:
        return teacher_service.get_teacher_stats(teacher_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
