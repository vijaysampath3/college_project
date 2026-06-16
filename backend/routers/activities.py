from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from services.supabase_client import get_supabase_client
from datetime import datetime, timezone

router = APIRouter(
    prefix="/api/activities",
    tags=["Activities"]
)

class ActivityAttempt(BaseModel):
    student_id: str
    activity_code: str
    recommendation_id: Optional[str] = None
    score: Optional[float] = None
    accuracy_percentage: Optional[float] = None
    time_spent_seconds: int
    reaction_time_ms: Optional[float] = None
    mistake_count: Optional[int] = None
    difficulty: Optional[str] = None
    activity_type: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

def calculate_xp(difficulty: str, score: float, is_first_attempt: bool, streak: int, time_spent_seconds: int) -> int:
    # Minimum participation requirement (e.g. 10 seconds)
    if time_spent_seconds < 10:
        return 0

    xp = 10
    if difficulty.lower() == 'medium': xp = 20
    elif difficulty.lower() == 'hard': xp = 35
    
    # Bonuses
    if score >= 100: xp += 10 # Perfect score
    if is_first_attempt and score >= 80: xp += 5
    if streak >= 7: xp += 15 # Weekly streak
    
    return xp

def determine_quality(score: float) -> str:
    if score >= 90: return "Excellent"
    if score >= 70: return "Good"
    return "Needs Practice"

@router.get("/")
async def get_activities():
    supabase = get_supabase_client()
    resp = supabase.table("learning_activities").select("*").execute()
    return {"success": True, "activities": resp.data}

@router.get("/{activity_code}")
async def get_activity(activity_code: str):
    supabase = get_supabase_client()
    resp = supabase.table("learning_activities").select("*").eq("activity_code", activity_code).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"success": True, "activity": resp.data[0]}

@router.post("/attempt")
async def save_attempt(req: ActivityAttempt):
    try:
        supabase = get_supabase_client()
        now = datetime.now(timezone.utc).isoformat()
        
        # Get activity info
        act_resp = supabase.table("learning_activities").select("*").eq("activity_code", req.activity_code).execute()
        if not act_resp.data:
            raise HTTPException(status_code=404, detail="Activity not found")
        activity = act_resp.data[0]
        
        # Get previous attempts
        prev_attempts = supabase.table("student_activity_attempts").select("id").eq("student_id", req.student_id).eq("activity_code", req.activity_code).execute()
        is_first_attempt = len(prev_attempts.data) == 0
        attempt_number = len(prev_attempts.data) + 1
        
        # Get user streak (simplified logic, usually fetched from student_rewards)
        # Table doesn't exist yet in the database so defaulting to 0
        streak = 0
        
        # Calculate score and quality
        final_score = req.score if req.score is not None else req.accuracy_percentage or 0
        xp_earned = calculate_xp(activity["difficulty"], final_score, is_first_attempt, streak, req.time_spent_seconds)
        quality = determine_quality(final_score)
        
        attempt_record = {
            "student_id": req.student_id,
            "activity_code": req.activity_code,
            "recommendation_id": req.recommendation_id,
            "score": final_score,
            "accuracy_percentage": req.accuracy_percentage,
            "completion_quality": quality,
            "xp_earned": xp_earned,
            "completed": True,
            "time_spent_seconds": req.time_spent_seconds,
            "attempt_number": attempt_number,
            "difficulty": req.difficulty or activity["difficulty"],
            "activity_type": req.activity_type or activity["activity_type"],
            "metrics": req.metrics or {
                "reaction_time_ms": req.reaction_time_ms,
                "mistake_count": req.mistake_count
            }
        }
        
        supabase.table("student_activity_attempts").insert(attempt_record).execute()
        
        # Update recommendation progress if linked
        rec_completed = False
        if req.recommendation_id:
            rec_resp = supabase.table("student_recommendations").select("*").eq("id", req.recommendation_id).execute()
            if rec_resp.data:
                rec = rec_resp.data[0]
                new_count = rec.get("completed_count", 0) + 1
                target = rec.get("target_count", 1)
                
                updates = {"completed_count": new_count}
                if new_count >= target:
                    updates["completed"] = True
                    updates["status"] = "completed"
                    updates["completed_at"] = now
                    rec_completed = True
                    
                supabase.table("student_recommendations").update(updates).eq("id", req.recommendation_id).execute()
                
        return {
            "success": True, 
            "xp_earned": xp_earned, 
            "quality": quality, 
            "recommendation_completed": rec_completed
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
