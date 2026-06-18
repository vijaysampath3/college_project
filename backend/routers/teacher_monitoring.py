from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Any
from pydantic import BaseModel
from services.teacher_monitoring_service import TeacherMonitoringService
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

class NoteCreate(BaseModel):
    note: str

@router.get("/summary")
async def get_monitoring_summary(user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_monitoring_summary(user_id)

@router.get("/interventions")
async def get_intervention_students(user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_intervention_students(user_id)

@router.get("/student/{student_id}/monitor")
async def get_student_monitoring(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_student_monitoring(user_id, student_id)

@router.get("/student/{student_id}/assessments")
async def get_student_assessments(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_student_assessments(user_id, student_id)

@router.get("/student/{student_id}/learning-path")
async def get_student_learning_path(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_student_learning_path(user_id, student_id)

@router.get("/student/{student_id}/recommendations")
async def get_student_recommendations(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_student_recommendations(user_id, student_id)

@router.get("/student/{student_id}/activities")
async def get_student_activities(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_student_activities(user_id, student_id)

@router.post("/student/{student_id}/notes")
async def create_teacher_note(student_id: str, request: NoteCreate, user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.create_teacher_note(user_id, student_id, request.note)

@router.get("/student/{student_id}/notes")
async def get_teacher_notes(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherMonitoringService.get_teacher_notes(user_id, student_id)
