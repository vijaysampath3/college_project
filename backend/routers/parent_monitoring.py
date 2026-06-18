from fastapi import APIRouter, Depends, Query, HTTPException, Header
import jwt
from services.parent_monitoring_service import ParentMonitoringService

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
    """Middleware to get current parent profile id"""
    from services.parent_access_service import ParentAccessService
    try:
        parent = ParentAccessService.get_current_parent(user_id)
        return parent
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")

@router.get("/overview")
async def get_overview(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentMonitoringService.get_monitoring_overview(parent["id"], student_id)

@router.get("/risk")
async def get_risk(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentMonitoringService.get_risk_analysis(parent["id"], student_id)

@router.get("/strengths")
async def get_strengths(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentMonitoringService.get_strengths(parent["id"], student_id)

@router.get("/support-areas")
async def get_support_areas(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentMonitoringService.get_support_areas(parent["id"], student_id)

@router.get("/interventions")
async def get_interventions(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentMonitoringService.get_intervention_status(parent["id"], student_id)

@router.get("/notes")
async def get_notes(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentMonitoringService.get_parent_visible_notes(parent["id"], student_id)

@router.get("/home-support")
async def get_home_support(student_id: str = Query(..., description="Student ID"), parent=Depends(get_parent_context)):
    return ParentMonitoringService.get_home_support_summary(parent["id"], student_id)
