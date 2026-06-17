from typing import Dict, Any, List
from services.supabase_client import get_supabase_client

class AdminDashboardService:
    @staticmethod
    def get_platform_stats() -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_platform_stats').execute()
            return response.data if response.data else {
                "totalStudents": 0,
                "totalTeachers": 0,
                "totalParents": 0,
                "totalSchools": 0,
                "totalAssessments": 0,
                "assignedStudents": 0
            }
        except Exception as e:
            print(f"Error fetching platform stats: {e}")
            return {
                "totalStudents": 0,
                "totalTeachers": 0,
                "totalParents": 0,
                "totalSchools": 0,
                "totalAssessments": 0,
                "assignedStudents": 0
            }

    @staticmethod
    def get_platform_usage() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_platform_usage').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching platform usage: {e}")
            return []

    @staticmethod
    def get_risk_distribution() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_risk_distribution').execute()
            data = response.data if response.data else {"Low Risk": 0, "Moderate Risk": 0, "High Risk": 0, "total": 0}
            
            total = data.get("total", 0)
            if total == 0:
                return [
                    {"name": "Low Risk", "value": 0, "color": "#10B981"},
                    {"name": "Moderate Risk", "value": 0, "color": "#F59E0B"},
                    {"name": "High Risk", "value": 0, "color": "#EF4444"}
                ]
                
            return [
                {"name": "Low Risk", "value": round((data.get("Low Risk", 0) / total) * 100), "color": "#10B981"},
                {"name": "Moderate Risk", "value": round((data.get("Moderate Risk", 0) / total) * 100), "color": "#F59E0B"},
                {"name": "High Risk", "value": round((data.get("High Risk", 0) / total) * 100), "color": "#EF4444"}
            ]
        except Exception as e:
            print(f"Error fetching risk distribution: {e}")
            return []

    @staticmethod
    def get_school_overview() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_school_overview').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching school overview: {e}")
            return []

    @staticmethod
    def get_recent_users() -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_recent_users').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching recent users: {e}")
            return []

    @staticmethod
    def get_health() -> Dict[str, Any]:
        try:
            supabase = get_supabase_client()
            response = supabase.rpc('get_admin_health_stats').execute()
            return response.data if response.data else {
                "totalStudents": 0,
                "studentsWithReports": 0,
                "studentsWithoutReports": 0,
                "activeTeachers": 0,
                "activeSchools": 0
            }
        except Exception as e:
            print(f"Error fetching health stats: {e}")
            return {
                "totalStudents": 0,
                "studentsWithReports": 0,
                "studentsWithoutReports": 0,
                "activeTeachers": 0,
                "activeSchools": 0
            }

admin_dashboard_service = AdminDashboardService()
