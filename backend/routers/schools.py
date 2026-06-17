from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.school_service import SchoolService

router = APIRouter()

class SchoolCreateUpdate(BaseModel):
    school_name: str
    school_code: str
    district: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    principal_name: Optional[str] = None
    logo_url: Optional[str] = None
    academic_year: Optional[str] = None
    status: Optional[str] = 'active'

@router.get("")
async def get_all_schools():
    try:
        schools = SchoolService.get_schools()
        return {"success": True, "schools": schools}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{school_id}")
async def get_school(school_id: str):
    try:
        school = SchoolService.get_school_by_id(school_id)
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        return {"success": True, "school": school}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_school(data: SchoolCreateUpdate):
    try:
        school = SchoolService.create_school(data.model_dump(exclude_unset=True))
        return {"success": True, "school": school}
    except Exception as e:
        # Check if it's a unique constraint violation for school_code
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="School code already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{school_id}")
async def update_school(school_id: str, data: SchoolCreateUpdate):
    try:
        school = SchoolService.update_school(school_id, data.model_dump(exclude_unset=True))
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        return {"success": True, "school": school}
    except HTTPException:
        raise
    except Exception as e:
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="School code already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{school_id}/status")
async def deactivate_school(school_id: str):
    try:
        school = SchoolService.deactivate_school(school_id)
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        return {"success": True, "school": school}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{school_id}/stats")
async def get_school_stats(school_id: str):
    try:
        stats = SchoolService.get_school_stats(school_id)
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
