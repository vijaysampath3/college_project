from fastapi import APIRouter, HTTPException
from services.admin_dashboard_service import admin_dashboard_service

router = APIRouter()

@router.get("/stats")
async def get_stats():
    try:
        return admin_dashboard_service.get_platform_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/platform-usage")
async def get_platform_usage():
    try:
        return admin_dashboard_service.get_platform_usage()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/risk-distribution")
async def get_risk_distribution():
    try:
        return admin_dashboard_service.get_risk_distribution()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/school-overview")
async def get_school_overview():
    try:
        return admin_dashboard_service.get_school_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent-users")
async def get_recent_users():
    try:
        return admin_dashboard_service.get_recent_users()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def get_health():
    try:
        return admin_dashboard_service.get_health()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
