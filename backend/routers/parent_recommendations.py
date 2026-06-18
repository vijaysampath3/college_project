from fastapi import APIRouter, Depends, Query, HTTPException, Header
import jwt
from typing import Dict, Any, List
from services.parent_recommendations_service import ParentRecommendationsService

router = APIRouter()

def get_current_user_id(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split(" ")[1]
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get("sub")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

async def get_parent_context(user_id: str = Depends(get_current_user_id)):
    """Middleware to get current parent profile id"""
    from services.parent_access_service import ParentAccessService
    try:
        parent = ParentAccessService.get_current_parent(user_id)
        return parent
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")


@router.get("/priorities")
async def get_priorities(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.get_priority_recommendations(parent["id"], student_id)

@router.get("/activities")
async def get_activities(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.get_teacher_assigned_activities(parent["id"], student_id)

@router.get("/assessments")
async def get_assessments(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.get_teacher_assigned_assessments(parent["id"], student_id)

@router.get("/home-activities")
async def get_home_activities(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.get_home_support_activities(parent["id"], student_id)

@router.get("/daily-plan")
async def get_daily_plan(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.get_daily_support_plan(parent["id"], student_id)

@router.get("/teacher-recommendations")
async def get_teacher_recommendations(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.get_teacher_recommendations(parent["id"], student_id)

@router.post("/home-activity-log")
async def create_home_activity_log(data: dict, student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.create_home_activity_log(parent["id"], student_id, data)

@router.get("/home-activity-log")
async def get_home_activity_logs(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentRecommendationsService.get_home_activity_logs(parent["id"], student_id)
