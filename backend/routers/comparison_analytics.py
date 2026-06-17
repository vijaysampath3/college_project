from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from services.comparison_analytics_service import comparison_analytics_service

router = APIRouter()

@router.get("/schools", response_model=List[Dict[str, Any]])
async def get_school_comparison():
    try:
        return comparison_analytics_service.get_school_comparison()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/risk", response_model=List[Dict[str, Any]])
async def get_risk_comparison():
    try:
        return comparison_analytics_service.get_risk_comparison()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/teachers", response_model=List[Dict[str, Any]])
async def get_teacher_comparison():
    try:
        return comparison_analytics_service.get_teacher_comparison()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessments", response_model=List[Dict[str, Any]])
async def get_assessment_analytics():
    try:
        return comparison_analytics_service.get_assessment_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interventions", response_model=Dict[str, Any])
async def get_intervention_analytics():
    try:
        return comparison_analytics_service.get_intervention_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rankings", response_model=List[Dict[str, Any]])
async def get_school_rankings():
    try:
        return comparison_analytics_service.get_school_rankings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/platform-health", response_model=Dict[str, Any])
async def get_platform_health_comparison():
    try:
        return comparison_analytics_service.get_platform_health()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
