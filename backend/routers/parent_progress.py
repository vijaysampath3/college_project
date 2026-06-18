from fastapi import APIRouter, Depends, Query, HTTPException, Header
import jwt
from services.parent_access_service import ParentAccessService
from services.parent_progress_service import ParentProgressService

router = APIRouter()

def get_current_user_id(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split(" ")[1]
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_parent_context(user_id: str = Depends(get_current_user_id)):
    """Middleware to get current parent profile"""
    try:
        parent = ParentAccessService.get_current_parent(user_id)
        return parent
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.get("/summary")
async def get_summary(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentProgressService.get_student_progress_summary(parent["id"], student_id)

@router.get("/assessments")
async def get_assessments(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentProgressService.get_assessment_history(parent["id"], student_id)

@router.get("/trends")
async def get_trends(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentProgressService.get_progress_trends(parent["id"], student_id)

@router.get("/learning-path")
async def get_learning_path(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentProgressService.get_learning_path_progress(parent["id"], student_id)

@router.get("/strengths")
async def get_strengths(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentProgressService.get_strength_areas(parent["id"], student_id)

@router.get("/improvements")
async def get_improvements(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentProgressService.get_improvement_areas(parent["id"], student_id)

@router.get("/achievements")
async def get_achievements(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentProgressService.get_achievement_timeline(parent["id"], student_id)
