from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.typing_insights_service import generate_typing_insights
from services.typing_scoring_service import calculate_typing_metrics, TypingScoreRequest

router = APIRouter()

class TypingInsightsRequest(BaseModel):
    metrics: Dict[str, Any]
    difficulty: str

@router.post("/insights")
async def get_typing_insights(request: TypingInsightsRequest):
    try:
        insights = generate_typing_insights(request.metrics, request.difficulty)
        
        # We can also return a simulated 'ai' metadata object if needed by frontend
        return {
            "insights": insights,
            "ai": {
                "model": "gpt-4o-mini",
                "provider": "GitHub Models"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/score")
async def score_typing(request: TypingScoreRequest):
    try:
        metrics = calculate_typing_metrics(request)
        return {"metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
