from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.learning_behaviour_service import LearningBehaviourService

router = APIRouter(prefix="/api/learning-behaviour", tags=["learning_behaviour"])
service = LearningBehaviourService()

class PatternMetrics(BaseModel):
    patternAccuracy: float
    averageDecisionTimeMs: float
    consistencyScore: float

class RuleMetrics(BaseModel):
    ruleRetention: float
    adaptationSpeedMs: float
    ruleSwitchRecovery: float
    instructionAccuracy: float

class PersistenceMetrics(BaseModel):
    completionRate: float
    retryRate: float
    skipRate: float
    timeSpentOnDifficultItemsMs: float
    abandonmentRate: float
    challengePersistence: float

class LearningBehaviourPayload(BaseModel):
    task1: PatternMetrics
    task2: RuleMetrics
    task3: PersistenceMetrics

@router.post("/score")
async def score_learning_behaviour(payload: LearningBehaviourPayload):
    try:
        metrics = payload.model_dump()
        scores_data, profile_data = service.calculate_scores(metrics)
        
        insights_data = await service.generate_insights(scores_data, profile_data)
        
        return {
            "scores": scores_data,
            "profile": profile_data,
            "insights": insights_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
