from typing import Dict, Any, List
from datetime import datetime, timezone
import logging
from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

class SchoolService:
    @staticmethod
    def get_schools() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            resp = supabase.table("schools").select("*").order("created_at", desc=True).execute()
            return resp.data
        except Exception as e:
            logger.error(f"Failed to get schools: {e}")
            raise

    @staticmethod
    def get_school_by_id(school_id: str) -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            resp = supabase.table("schools").select("*").eq("id", school_id).execute()
            if not resp.data:
                return None
            return resp.data[0]
        except Exception as e:
            logger.error(f"Failed to get school {school_id}: {e}")
            raise

    @staticmethod
    def create_school(data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            resp = supabase.table("schools").insert(data).execute()
            return resp.data[0]
        except Exception as e:
            logger.error(f"Failed to create school: {e}")
            raise

    @staticmethod
    def update_school(school_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            resp = supabase.table("schools").update(data).eq("id", school_id).execute()
            if not resp.data:
                return None
            return resp.data[0]
        except Exception as e:
            logger.error(f"Failed to update school {school_id}: {e}")
            raise

    @staticmethod
    def deactivate_school(school_id: str) -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            data = {
                "status": "inactive",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            resp = supabase.table("schools").update(data).eq("id", school_id).execute()
            if not resp.data:
                return None
            return resp.data[0]
        except Exception as e:
            logger.error(f"Failed to deactivate school {school_id}: {e}")
            raise

    @staticmethod
    def get_school_stats(school_id: str) -> Dict[str, Any]:
        # Currently a placeholder that returns 0. 
        # Future phases will run COUNT() queries on linked tables.
        try:
            # We would eventually query here:
            # supabase = get_supabase_client()
            # teachers_count = ...
            return {
                "teachers": 0,
                "students": 0,
                "parents": 0,
                "assessments": 0,
                "highRiskStudents": 0
            }
        except Exception as e:
            logger.error(f"Failed to get stats for school {school_id}: {e}")
            raise
