from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.supabase_client import get_supabase_client
from services.learning_path_engine import LearningPathEngine
from services.learning_coach_service import LearningCoachService
from datetime import datetime, timezone

router = APIRouter()

class GeneratePathRequest(BaseModel):
    student_id: str
    report_id: Optional[str] = None

@router.post("/generate")
async def generate_path(req: GeneratePathRequest):
    try:
        supabase = get_supabase_client()
        
        # Check if already has an active path
        active_path_resp = supabase.table("student_learning_paths").select("*").eq("student_id", req.student_id).eq("status", "active").execute()
        if active_path_resp.data:
            return {"success": True, "message": "Already has an active path.", "path_id": active_path_resp.data[0]["id"]}

        # Fetch assessment snapshot
        results_resp = supabase.table("assessment_results").select("*").eq("student_id", req.student_id).order("created_at", desc=True).execute()
        snapshot = {}
        for r in results_resp.data:
            if r["assessment_type"] not in snapshot:
                snapshot[r["assessment_type"]] = r["result_data"]
                
        # Calculate risks
        from services.risk_engine import RiskEngine
        risks = RiskEngine.calculate_all_risks(snapshot)

        # Generate path
        path_data = LearningPathEngine.generate_learning_path(req.student_id, snapshot, risks, req.report_id)
        
        # Save to DB
        supabase.table("student_learning_paths").insert(path_data["path"]).execute()
        
        # Batch insert items
        if path_data["items"]:
            supabase.table("learning_path_items").insert(path_data["items"]).execute()
            
        return {"success": True, "path_id": path_data["path"]["id"]}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{student_id}")
async def get_active_path(student_id: str):
    try:
        supabase = get_supabase_client()
        path_resp = supabase.table("student_learning_paths").select("*").eq("student_id", student_id).eq("status", "active").execute()
        if not path_resp.data:
            return {"success": True, "path": None, "items": []}
            
        path = path_resp.data[0]
        items_resp = supabase.table("learning_path_items").select("*").eq("path_id", path["id"]).order("week_number").order("order_index").execute()
        
        # Calculate progress
        progress = LearningPathEngine.calculate_path_progress(path["id"], items_resp.data)
        
        # Update path if progress changed
        if path["completion_percentage"] != progress["completion_percentage"] or path["current_week"] != progress["current_week"]:
            supabase.table("student_learning_paths").update({
                "completion_percentage": progress["completion_percentage"],
                "current_week": progress["current_week"],
                "status": "completed" if progress["completion_percentage"] == 100 else "active",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", path["id"]).execute()
            
            path["completion_percentage"] = progress["completion_percentage"]
            path["current_week"] = progress["current_week"]
            if progress["completion_percentage"] == 100:
                path["status"] = "completed"

        # Generate AI coach message
        coach_message = LearningCoachService.generate_coach_message({
            "current_week": path["current_week"],
            "completion_percentage": path["completion_percentage"],
            "focus_area": path["primary_focus_area"],
            "journey_type": path["journey_type"]
        })

        return {
            "success": True,
            "path": path,
            "items": items_resp.data,
            "progress": progress,
            "coach_message": coach_message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{student_id}/adapt")
async def adapt_path(student_id: str):
    # Endpoint to force re-evaluation of the path (e.g., after new assessment)
    # For now, it just returns success. Future expansion can rebuild the path entirely.
    return {"success": True, "message": "Path adaptation triggered"}
