from typing import List, Dict, Any, Optional
from services.supabase_client import get_supabase_client
from datetime import datetime, timezone

class StudentService:
    @staticmethod
    def create_student(data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new student profile"""
        try:
            supabase = get_supabase_client()
            student_data = {
                "school_id": data.get("school_id"),
                "student_id": data.get("student_id"),
                "temporary_password": data.get("temporary_password"),
                "student_name": data.get("student_name"),
                "admission_number": data.get("admission_number"),
                "grade": data.get("grade"),
                "section": data.get("section"),
                "date_of_birth": data.get("date_of_birth"),
                "gender": data.get("gender"),
                "phone": data.get("phone"),
                "email": data.get("email"),
                "status": data.get("status", "active")
            }
            
            response = supabase.table('student_profiles').insert(student_data).execute()
            if not response.data:
                raise Exception("Failed to create student")
                
            return response.data[0]
        except Exception as e:
            print(f"Error creating student: {e}")
            raise Exception(f"Failed to create student: {str(e)}")

    @staticmethod
    def get_students() -> List[Dict[str, Any]]:
        """Get all students"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('student_profiles').select(
                '*, schools(school_name, school_code)'
            ).order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching students: {e}")
            return []

    @staticmethod
    def get_student_by_id(student_id: str) -> Optional[Dict[str, Any]]:
        """Get a student by ID"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('student_profiles').select(
                '*, schools(school_name, school_code)'
            ).eq('id', student_id).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching student: {e}")
            return None

    @staticmethod
    def get_students_by_school(school_id: str) -> List[Dict[str, Any]]:
        """Get all students in a specific school"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('student_profiles').select(
                '*, schools(school_name, school_code)'
            ).eq('school_id', school_id).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching students by school: {e}")
            return []

    @staticmethod
    def update_student(student_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a student"""
        try:
            supabase = get_supabase_client()
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            response = supabase.table('student_profiles').update(data).eq('id', student_id).execute()
            if not response.data:
                raise Exception("Student not found or update failed")
            return response.data[0]
        except Exception as e:
            print(f"Error updating student: {e}")
            raise Exception(f"Failed to update student: {str(e)}")

    @staticmethod
    def deactivate_student(student_id: str) -> Dict[str, Any]:
        """Soft delete a student by setting status to inactive"""
        return StudentService.update_student(student_id, {"status": "inactive"})

student_service = StudentService()
