from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Any
from pydantic import BaseModel
from services.teacher_parent_service import TeacherParentService
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

class ParentCreate(BaseModel):
    parent_id: str = None
    parent_name: str
    email: str = None
    phone: str = None
    occupation: str = None
    address: str = None
    status: str = "active"
    temporary_password: str = None

class ParentUpdate(BaseModel):
    parent_name: str = None
    email: str = None
    phone: str = None
    occupation: str = None
    address: str = None
    status: str = None

class ResetPasswordRequest(BaseModel):
    new_password: str

class StudentAssignment(BaseModel):
    student_id: str
    relationship: str
    is_primary_parent: bool = False

class AssignStudentsRequest(BaseModel):
    assignments: List[StudentAssignment]

@router.get("/stats")
async def get_parent_stats(user_id: str = Depends(get_current_user_id)):
    return TeacherParentService.get_parent_stats(user_id)

@router.get("")
async def get_parents(user_id: str = Depends(get_current_user_id)):
    return TeacherParentService.get_parents_by_teacher(user_id)

@router.post("")
async def create_parent(data: ParentCreate, user_id: str = Depends(get_current_user_id)):
    return TeacherParentService.create_parent(user_id, data.dict(exclude_none=True))

@router.get("/available-students")
async def get_available_students(parent_id: str = None, user_id: str = Depends(get_current_user_id)):
    return TeacherParentService.get_available_students_for_assignment(user_id, parent_id)

@router.get("/{parent_id}")
async def get_parent(parent_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherParentService.get_parent_by_id(user_id, parent_id)

@router.put("/{parent_id}")
async def update_parent(parent_id: str, data: ParentUpdate, user_id: str = Depends(get_current_user_id)):
    return TeacherParentService.update_parent(user_id, parent_id, data.dict(exclude_unset=True))

@router.patch("/{parent_id}/status")
async def deactivate_parent(parent_id: str, user_id: str = Depends(get_current_user_id)):
    return TeacherParentService.deactivate_parent(user_id, parent_id)

@router.post("/{parent_id}/reset-password")
async def reset_password(parent_id: str, request: ResetPasswordRequest, user_id: str = Depends(get_current_user_id)):
    success = TeacherParentService.reset_parent_password(user_id, parent_id, request.new_password)
    return {"success": success}

@router.post("/{parent_id}/assign-students")
async def assign_students(parent_id: str, request: AssignStudentsRequest, user_id: str = Depends(get_current_user_id)):
    success = TeacherParentService.assign_students_to_parent(user_id, parent_id, [a.dict() for a in request.assignments])
    return {"success": success}

@router.delete("/relationship/{relationship_id}")
async def remove_relationship(relationship_id: str, user_id: str = Depends(get_current_user_id)):
    success = TeacherParentService.remove_relationship(user_id, relationship_id)
    return {"success": success}
