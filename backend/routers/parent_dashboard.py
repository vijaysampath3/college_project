from fastapi import APIRouter, HTTPException, Depends, Header, Query
from services.parent_access_service import ParentAccessService
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

def get_parent_context(user_id: str = Depends(get_current_user_id)):
    try:
        parent = ParentAccessService.get_current_parent(user_id)
        return parent
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(parent=Depends(get_parent_context)):
    return parent

@router.get("/students")
async def get_students(parent=Depends(get_parent_context)):
    return ParentAccessService.get_linked_students(parent["id"])

@router.get("/dashboard")
async def get_dashboard(student_id: str = Query(..., description="The ID of the student to fetch dashboard data for"), parent=Depends(get_parent_context)):
    return ParentAccessService.get_parent_dashboard_summary(parent["id"], student_id)
