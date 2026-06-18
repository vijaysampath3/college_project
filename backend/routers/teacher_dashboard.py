from fastapi import APIRouter, HTTPException, Depends, Header
from services.teacher_access_service import TeacherAccessService
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

def get_teacher_context(user_id: str = Depends(get_current_user_id)):
    try:
        teacher = TeacherAccessService.get_current_teacher(user_id)
        return teacher
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(teacher=Depends(get_teacher_context)):
    return teacher

@router.get("/dashboard/stats")
async def get_dashboard_stats(teacher=Depends(get_teacher_context)):
    return TeacherAccessService.get_teacher_dashboard_stats(teacher["id"], teacher["schoolId"])

@router.get("/students")
async def get_students(teacher=Depends(get_teacher_context)):
    return TeacherAccessService.get_assigned_students(teacher["id"], teacher["schoolId"])

@router.get("/risk-distribution")
async def get_risk_distribution(teacher=Depends(get_teacher_context)):
    return TeacherAccessService.get_teacher_risk_distribution(teacher["id"], teacher["schoolId"])

@router.get("/recent-assessments")
async def get_recent_assessments(teacher=Depends(get_teacher_context)):
    return TeacherAccessService.get_recent_assessments(teacher["id"], teacher["schoolId"])

@router.get("/alerts")
async def get_alerts(teacher=Depends(get_teacher_context)):
    return TeacherAccessService.get_teacher_alerts(teacher["id"], teacher["schoolId"])

@router.get("/analytics")
async def get_analytics(teacher=Depends(get_teacher_context)):
    return TeacherAccessService.get_teacher_analytics(teacher["id"], teacher["schoolId"])

@router.get("/dashboard/student-performance")
async def get_student_performance(teacher=Depends(get_teacher_context)):
    return TeacherAccessService.get_student_performance_overview(teacher["id"], teacher["schoolId"])
