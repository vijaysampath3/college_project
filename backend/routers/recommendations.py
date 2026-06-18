from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.supabase_client import get_supabase_client
from services.recommendation_engine import RecommendationEngine
from services.recommendation_ai_service import RecommendationAIService
from datetime import datetime, timezone

router = APIRouter(
    tags=["Recommendations"]
)

class GenerateRecRequest(BaseModel):
    student_id: str
    report_id: str

@router.post("/generate")
async def generate_recommendations(req: GenerateRecRequest):
    try:
        supabase = get_supabase_client()
        
        # 1. Fetch the report
        report_resp = supabase.table("student_reports").select("*").eq("id", req.report_id).execute()
        if not report_resp.data:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report = report_resp.data[0]
        snapshot = report.get("assessment_snapshot", {})
        risks = report.get("risk_analysis", {})
        learning_profile = report.get("learning_profile", "Unknown")

        # 2. Deterministic Generation
        recs = RecommendationEngine.generate_recommendations(snapshot, risks, req.report_id)
        
        # Assign student_id to all
        for r in recs:
            r["student_id"] = req.student_id

        # 3. AI Personalization
        ai_msg = RecommendationAIService.personalize_recommendations(recs, learning_profile, risks)
        
        # 4. Save to DB
        if recs:
            supabase.table("student_recommendations").insert(recs).execute()
            
        ai_record = {
            "student_id": req.student_id,
            "recommendation_batch_id": recs[0]["recommendation_batch_id"] if recs else None,
            "coach_message": ai_msg["coachMessage"],
            "motivation": ai_msg["motivation"],
            "strategy_explanation": ai_msg["strategyExplanation"]
        }
        if ai_record["recommendation_batch_id"]:
            supabase.table("recommendation_ai_messages").insert(ai_record).execute()

        return {"success": True, "batch_id": ai_record["recommendation_batch_id"]}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{student_id}")
async def get_recommendations(student_id: str):
    try:
        supabase = get_supabase_client()
        
        # Get pending recs
        recs_resp = supabase.table("student_recommendations").select("*").eq("student_id", student_id).eq("completed", False).order("impact_score", desc=True).execute()
        recs = recs_resp.data

        # Get latest AI message
        if recs:
            batch_id = recs[0]["recommendation_batch_id"]
            ai_resp = supabase.table("recommendation_ai_messages").select("*").eq("recommendation_batch_id", batch_id).execute()
            ai_message = ai_resp.data[0] if ai_resp.data else None
        else:
            ai_message = None

        return {
            "success": True, 
            "recommendations": recs,
            "ai_message": ai_message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{rec_id}/complete")
async def complete_recommendation(rec_id: str):
    try:
        supabase = get_supabase_client()
        now = datetime.now(timezone.utc).isoformat()
        
        resp = supabase.table("student_recommendations").update({
            "completed": True,
            "status": "completed",
            "completed_at": now
        }).eq("id", rec_id).execute()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{student_id}/reset")
async def reset_recommendations(student_id: str):
    try:
        supabase = get_supabase_client()
        
        # Reset all recommendations for this student
        resp = supabase.table("student_recommendations").update({
            "completed": False,
            "status": "pending",
            "completed_at": None
        }).eq("student_id", student_id).execute()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{student_id}/action-plan")
async def get_action_plan(student_id: str):
    try:
        supabase = get_supabase_client()
        # Fetch all pending
        recs_resp = supabase.table("student_recommendations").select("*").eq("student_id", student_id).eq("completed", False).execute()
        
        # Build weekly plan
        plan = RecommendationEngine.generate_weekly_plan(recs_resp.data)
        return {"success": True, "plan": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
