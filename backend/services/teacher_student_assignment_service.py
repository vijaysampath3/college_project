from typing import List, Dict, Any, Optional
from services.supabase_client import get_supabase_client
from datetime import datetime, timezone

class TeacherStudentAssignmentService:
    
    @staticmethod
    def assign_students(teacher_id: str, student_ids: List[str], assigned_by: Optional[str] = None) -> List[Dict[str, Any]]:
        """Assign multiple students to a teacher"""
        try:
            supabase = get_supabase_client()
            
            # Deactivate previous assignments for these students
            supabase.table('teacher_student_assignments').update(
                {"status": "inactive"}
            ).in_("student_id", student_ids).eq("status", "active").execute()
            
            # Create new assignments
            assignments = []
            now = datetime.now(timezone.utc).isoformat()
            
            for student_id in student_ids:
                assignments.append({
                    "teacher_id": teacher_id,
                    "student_id": student_id,
                    "assigned_by": assigned_by,
                    "status": "active",
                    "assigned_at": now
                })
                
            response = supabase.table('teacher_student_assignments').insert(assignments).execute()
            return response.data
            
        except Exception as e:
            print(f"Error assigning students: {e}")
            raise Exception(f"Failed to assign students: {str(e)}")

    @staticmethod
    def reassign_student(student_id: str, new_teacher_id: str, assigned_by: Optional[str] = None) -> Dict[str, Any]:
        """Reassign a single student to a new teacher"""
        try:
            res = TeacherStudentAssignmentService.assign_students(new_teacher_id, [student_id], assigned_by)
            return res[0] if res else None
        except Exception as e:
            print(f"Error reassigning student: {e}")
            raise Exception(f"Failed to reassign student: {str(e)}")

    @staticmethod
    def remove_assignment(assignment_id: str) -> Dict[str, Any]:
        """Deactivate an assignment"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('teacher_student_assignments').update(
                {"status": "inactive", "updated_at": datetime.now(timezone.utc).isoformat()}
            ).eq("id", assignment_id).execute()
            
            if not response.data:
                raise Exception("Assignment not found or update failed")
            return response.data[0]
        except Exception as e:
            print(f"Error removing assignment: {e}")
            raise Exception(f"Failed to remove assignment: {str(e)}")

    @staticmethod
    def get_students_for_teacher(teacher_id: str) -> List[Dict[str, Any]]:
        """Get all active assigned students for a specific teacher"""
        try:
            supabase = get_supabase_client()
            # Fetch assignments joined with student profiles
            response = supabase.table('teacher_student_assignments').select(
                '*, student_profiles(*, schools(school_name, school_code))'
            ).eq('teacher_id', teacher_id).eq('status', 'active').execute()
            
            return response.data
        except Exception as e:
            print(f"Error fetching students for teacher: {e}")
            return []

    @staticmethod
    def get_teachers_student_count(school_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get workload/student count for teachers, optionally filtered by school"""
        try:
            supabase = get_supabase_client()
            
            # Since Supabase PostgREST doesn't directly support GROUP BY easily without RPC, 
            # we will fetch active assignments and group in Python for now.
            # In production with large data, an RPC should be used.
            
            query = supabase.table('teacher_student_assignments').select(
                'teacher_id, teacher_profiles!inner(school_id)'
            ).eq('status', 'active')
            
            if school_id:
                query = query.eq('teacher_profiles.school_id', school_id)
                
            response = query.execute()
            
            counts = {}
            for row in response.data:
                tid = row['teacher_id']
                counts[tid] = counts.get(tid, 0) + 1
                
            result = [{"teacher_id": tid, "count": c} for tid, c in counts.items()]
            return result
        except Exception as e:
            print(f"Error fetching teacher student counts: {e}")
            return []

    @staticmethod
    def get_assigned_teacher_for_student(student_id: str) -> Optional[Dict[str, Any]]:
        """Get the currently assigned teacher for a student"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('teacher_student_assignments').select(
                '*, teacher_profiles(*)'
            ).eq('student_id', student_id).eq('status', 'active').execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching teacher for student: {e}")
            return None

assignment_service = TeacherStudentAssignmentService()
