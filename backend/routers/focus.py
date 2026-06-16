from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.focus_scoring_service import FocusScoringService

router = APIRouter(prefix="/api/focus", tags=["focus"])
scoring_service = FocusScoringService()

class FocusMetricsPayload(BaseModel):
    facePresencePercent: float
    screenFocusPercent: float
    lookAwayCount: int
    averageLookAwayDuration: float
    headMovementScore: float
    taskAccuracy: float
    faceLostEvents: int
    gazeTrackingEnabled: bool = False
    gazeMetrics: Optional[dict] = None

@router.post("/score")
async def score_focus(payload: FocusMetricsPayload):
    try:
        # Calculate raw scores
        scores = scoring_service.calculate_scores(payload.model_dump())
        
        # Generate AI insights
        insights = await scoring_service.generate_insights(scores)
        
        return {
            "scores": scores,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
