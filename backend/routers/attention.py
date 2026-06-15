from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.attention_scoring_service import process_attention_assessment

router = APIRouter(prefix="/api/attention", tags=["attention"])

class AttentionMetricsPayload(BaseModel):
    task1: Dict[str, Any]
    task2: Dict[str, Any]
    task3: Dict[str, Any]
    task4: Dict[str, Any]

@router.post("/score")
async def score_attention(payload: AttentionMetricsPayload):
    try:
        metrics = payload.model_dump()
        result = process_attention_assessment(metrics)
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error scoring attention: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
