from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.supabase_client import get_supabase_client
from services.report_generation_service import ReportGenerationService

router = APIRouter(
    tags=["Reports"]
)

class GenerateReportRequest(BaseModel):
    student_id: str

@router.post("/generate")
async def generate_report(req: GenerateReportRequest):
    try:
        report = ReportGenerationService.generate_report(req.student_id)
        return {"success": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{student_id}")
async def get_reports(student_id: str):
    try:
        supabase = get_supabase_client()
        response = supabase.table("student_reports").select("*").eq("student_id", student_id).order("created_at", desc=True).execute()
        return {"success": True, "reports": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
