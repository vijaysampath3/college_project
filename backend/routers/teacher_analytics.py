from fastapi import APIRouter, Depends, HTTPException, Header
from services.teacher_analytics_service import TeacherAnalyticsService
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

@router.get("/overview")
async def get_overview(user_id: str = Depends(get_current_user_id)):
    return TeacherAnalyticsService.get_overview_metrics(user_id)

@router.get("/risk")
async def get_risk(user_id: str = Depends(get_current_user_id)):
    return TeacherAnalyticsService.get_risk_analytics(user_id)

@router.get("/assessments")
async def get_assessments(user_id: str = Depends(get_current_user_id)):
    return TeacherAnalyticsService.get_assessment_analytics(user_id)

@router.get("/improvements")
async def get_improvements(user_id: str = Depends(get_current_user_id)):
    return TeacherAnalyticsService.get_student_improvements(user_id)

@router.get("/interventions")
async def get_interventions(user_id: str = Depends(get_current_user_id)):
    return TeacherAnalyticsService.get_intervention_effectiveness(user_id)

@router.get("/learning-paths")
async def get_learning_paths(user_id: str = Depends(get_current_user_id)):
    return TeacherAnalyticsService.get_learning_path_analytics(user_id)

@router.get("/parents")
async def get_parents(user_id: str = Depends(get_current_user_id)):
    return TeacherAnalyticsService.get_parent_engagement_analytics(user_id)
