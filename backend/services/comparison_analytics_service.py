from typing import Dict, Any, List
from services.supabase_client import get_supabase_client

class ComparisonAnalyticsService:
    @staticmethod
    def get_school_comparison() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_school_comparison').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching school comparison: {e}")
            return []

    @staticmethod
    def get_risk_comparison() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_risk_comparison').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching risk comparison: {e}")
            return []

    @staticmethod
    def get_teacher_comparison() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_teacher_comparison').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching teacher comparison: {e}")
            return []

    @staticmethod
    def get_assessment_analytics() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_assessment_analytics').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching assessment analytics: {e}")
            return []

    @staticmethod
    def get_intervention_analytics() -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_intervention_analytics').execute()
            return response.data if response.data else {"hasData": False, "message": "Failed to load intervention data."}
        except Exception as e:
            print(f"Error fetching intervention analytics: {e}")
            return {"hasData": False, "message": "Failed to load intervention data."}

    @staticmethod
    def get_school_rankings() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_school_rankings').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching school rankings: {e}")
            return []

    @staticmethod
    def get_platform_health() -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_platform_health_comparison').execute()
            return response.data if response.data else {
                "totalSchools": 0,
                "totalTeachers": 0,
                "totalStudents": 0,
                "totalParents": 0,
                "reportsGenerated": 0,
                "recommendationsGenerated": 0,
                "learningPathsGenerated": 0,
                "activitiesCompleted": 0
            }
        except Exception as e:
            print(f"Error fetching platform health comparison: {e}")
            return {
                "totalSchools": 0,
                "totalTeachers": 0,
                "totalStudents": 0,
                "totalParents": 0,
                "reportsGenerated": 0,
                "recommendationsGenerated": 0,
                "learningPathsGenerated": 0,
                "activitiesCompleted": 0
            }

comparison_analytics_service = ComparisonAnalyticsService()
