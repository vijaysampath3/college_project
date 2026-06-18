from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Any
from pydantic import BaseModel
from services.teacher_intervention_service import TeacherInterventionService
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

class AssignActivityRequest(BaseModel):
    activity_code: str
    activity_title: str
    activity_category: str
    priority: str = "Normal"
    teacher_note: str = None
    due_date: str = None

class AssignAssessmentRequest(BaseModel):
    assessment_type: str
    assessment_title: str
    reason: str = None
    priority: str = "Normal"
    teacher_note: str = None
    due_date: str = None

@router.get("/overview")
async def get_overview(user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.get_assessment_overview(user_id)

@router.get("/recent-assessments")
async def get_recent_assessments(user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.get_recent_assessments(user_id)

@router.get("/queue")
async def get_intervention_queue(user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.get_intervention_queue(user_id)

@router.get("/all-assigned")
async def get_all_assigned(user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.get_all_assigned(user_id)

@router.get("/student/{student_id}/assessment/{assessment_id}/recommendations")
async def get_recommendations(student_id: str, assessment_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.get_assessment_recommendations(user_id, student_id, assessment_id)

@router.post("/student/{student_id}/assign-activity")
async def assign_activity(student_id: str, request: AssignActivityRequest, user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.assign_activity(user_id, student_id, request.dict())

@router.post("/student/{student_id}/assign-assessment")
async def assign_assessment(student_id: str, request: AssignAssessmentRequest, user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.assign_assessment(user_id, student_id, request.dict())

@router.get("/student/{student_id}/assignments")
async def get_student_assignments(student_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherInterventionService.get_student_assignments(user_id, student_id)
