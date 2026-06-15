from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from services.adhd_scoring_service import calculate_cpt_metrics, CPTScoreRequest
from services.adhd_inference_service import run_adhd_inference, generate_adhd_insights

router = APIRouter()

@router.post("/score")
async def score_cpt(request: CPTScoreRequest):
    try:
        metrics = calculate_cpt_metrics(request)
        inference = run_adhd_inference(metrics)
        return {
            "metrics": metrics,
            "inference": inference
        }
    except Exception as e:
        print(f"Error in /score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class CPTInsightsRequest(BaseModel):
    metrics: Dict[str, Any]
    inference: Dict[str, Any]

@router.post("/insights")
async def insights_cpt(request: CPTInsightsRequest):
    try:
        insights = generate_adhd_insights(request.metrics, request.inference)
        return {"insights": insights}
    except Exception as e:
        print(f"Error in /insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))
