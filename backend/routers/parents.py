from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.parent_service import parent_service

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str

@router.get("/stats")
async def get_parent_stats():
    try:
        return parent_service.get_parent_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def get_all_parents(
    school_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    student_id: Optional[str] = None,
    relationship: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    try:
        filters = {}
        if school_id: filters['school_id'] = school_id
        if teacher_id: filters['teacher_id'] = teacher_id
        if student_id: filters['student_id'] = student_id
        if relationship: filters['relationship'] = relationship
        if status: filters['status'] = status
        if search: filters['search'] = search
        
        parents = parent_service.get_parents(filters)
        return parents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{parent_id}")
async def get_parent(parent_id: str):
    try:
        parent = parent_service.get_parent_details_by_id(parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        return parent
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{parent_id}/status")
async def deactivate_parent(parent_id: str, data: StatusUpdate):
    try:
        if data.status != 'inactive':
            raise HTTPException(status_code=400, detail="Only 'inactive' status is allowed via this endpoint")
        parent = parent_service.deactivate_parent(parent_id)
        return parent
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
