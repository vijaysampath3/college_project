from typing import List, Dict, Any, Optional
from services.supabase_client import get_supabase_client
from uuid import UUID

class TeacherService:
    @staticmethod
    def create_teacher(data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new teacher"""
        try:
            supabase = get_supabase_client()
            # Create the auth user first
            auth_response = supabase.auth.admin.create_user({
                "email": data.get("email"),
                "password": data.get("temp_password"),
                "email_confirm": True,
                "user_metadata": {
                    "role": "teacher",
                    "full_name": data.get("teacher_name"),
                    "teacher_id": data.get("teacher_id")
                }
            })
            
            user_id = auth_response.user.id
            
            teacher_data = {
                "user_id": user_id,
                "school_id": data.get("school_id"),
                "teacher_id": data.get("teacher_id"),
                "employee_id": data.get("employee_id"),
                "teacher_name": data.get("teacher_name"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "department": data.get("department"),
                "designation": data.get("designation"),
                "qualification": data.get("qualification"),
                "joining_date": data.get("joining_date"),
                "temp_password": data.get("temp_password"),
                "status": data.get("status", "active")
            }
            
            response = supabase.table('teacher_profiles').insert(teacher_data).execute()
            if not response.data:
                raise Exception("Failed to create teacher")
                
            return response.data[0]
        except Exception as e:
            print(f"Error creating teacher: {e}")
            raise Exception(f"Failed to create teacher: {str(e)}")

    @staticmethod
    def get_teachers() -> List[Dict[str, Any]]:
        """Get all teachers"""
        try:
            supabase = get_supabase_client()
            # Fetch teachers with basic school info
            response = supabase.table('teacher_profiles').select(
                '*, schools (school_name, school_code)'
            ).execute()
            
            return response.data
        except Exception as e:
            print(f"Error fetching teachers: {e}")
            return []

    @staticmethod
    def get_teacher_by_id(teacher_id: str) -> Optional[Dict[str, Any]]:
        """Get a teacher by ID"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('teacher_profiles').select(
                '*, schools (school_name, school_code)'
            ).eq('id', teacher_id).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching teacher: {e}")
            return None

    @staticmethod
    def get_teachers_by_school(school_id: str) -> List[Dict[str, Any]]:
        """Get all teachers assigned to a specific school"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('teacher_profiles').select(
                '*'
            ).eq('school_id', school_id).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching teachers by school: {e}")
            return []

    @staticmethod
    def update_teacher(teacher_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a teacher"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('teacher_profiles').update(data).eq('id', teacher_id).execute()
            if not response.data:
                raise Exception("Teacher not found or update failed")
            return response.data[0]
        except Exception as e:
            print(f"Error updating teacher: {e}")
            raise Exception(f"Failed to update teacher: {str(e)}")

    @staticmethod
    def deactivate_teacher(teacher_id: str) -> Dict[str, Any]:
        """Soft delete a teacher by setting status to inactive"""
        return TeacherService.update_teacher(teacher_id, {"status": "inactive"})

    @staticmethod
    def delete_teacher(teacher_id: str) -> bool:
        """Permanently delete a teacher"""
        try:
            supabase = get_supabase_client()
            # First get the teacher to find the user_id
            teacher_response = supabase.table('teacher_profiles').select('user_id').eq('id', teacher_id).execute()
            
            response = supabase.table('teacher_profiles').delete().eq('id', teacher_id).execute()
            
            # Delete the auth user if it exists
            if teacher_response.data and teacher_response.data[0].get('user_id'):
                try:
                    supabase.auth.admin.delete_user(teacher_response.data[0]['user_id'])
                except Exception as e:
                    print(f"Failed to delete auth user, maybe already deleted: {e}")
                    
            # If successful, data should contain the deleted row(s) or we just check if it threw an error
            return True
        except Exception as e:
            print(f"Error deleting teacher: {e}")
            raise Exception(f"Failed to delete teacher: {str(e)}")

    @staticmethod
    def get_teacher_stats(teacher_id: str) -> Dict[str, int]:
        """Get stats for a teacher"""
        try:
            supabase = get_supabase_client()
            
            # Fetch assigned students count
            assignments_resp = supabase.table('teacher_student_assignments').select(
                'id', count='exact'
            ).eq('teacher_id', teacher_id).eq('status', 'active').execute()
            
            assigned_students_count = assignments_resp.count if assignments_resp.count is not None else 0
            
            # Placeholders for future phases
            return {
                "assignedStudents": assigned_students_count,
                "completedAssessments": 0,
                "generatedReports": 0,
                "activeInterventions": 0
            }
        except Exception as e:
            print(f"Error fetching teacher stats: {e}")
            return {
                "assignedStudents": 0,
                "completedAssessments": 0,
                "generatedReports": 0,
                "activeInterventions": 0
            }

teacher_service = TeacherService()
