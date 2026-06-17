from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.teacher_student_assignment_service import assignment_service

router = APIRouter()

class AssignStudentsRequest(BaseModel):
    teacher_id: str
    student_ids: List[str]
    assigned_by: Optional[str] = None

class ReassignStudentRequest(BaseModel):
    student_id: str
    new_teacher_id: str
    assigned_by: Optional[str] = None

@router.post("/teacher-students")
async def assign_students(data: AssignStudentsRequest):
    try:
        assignments = assignment_service.assign_students(data.teacher_id, data.student_ids, data.assigned_by)
        return {"success": True, "assignments": assignments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/teacher/{teacher_id}")
async def get_students_for_teacher(teacher_id: str):
    try:
        students = assignment_service.get_students_for_teacher(teacher_id)
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/reassign")
async def reassign_student(data: ReassignStudentRequest):
    try:
        assignment = assignment_service.reassign_student(data.student_id, data.new_teacher_id, data.assigned_by)
        return {"success": True, "assignment": assignment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{assignment_id}")
async def remove_assignment(assignment_id: str):
    try:
        assignment = assignment_service.remove_assignment(assignment_id)
        return {"success": True, "assignment": assignment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/counts")
async def get_teachers_student_count(school_id: Optional[str] = None):
    try:
        counts = assignment_service.get_teachers_student_count(school_id)
        return counts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
