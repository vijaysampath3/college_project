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
    def get_students(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all students with optional filtering"""
        try:
            supabase = get_supabase_client()
            query = supabase.table('student_profiles').select(
                '*, schools(school_name, school_code), teacher_student_assignments(teacher_id, status, teacher_profiles(teacher_name))'
            )
            
            if filters:
                if filters.get('school_id'):
                    query = query.eq('school_id', filters['school_id'])
                if filters.get('grade'):
                    query = query.eq('grade', filters['grade'])
                if filters.get('section'):
                    query = query.eq('section', filters['section'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                # Name or ID search is often better handled on client or with ilike,
                # For now we'll do ilike if search is provided
                if filters.get('search'):
                    search_term = f"%{filters['search']}%"
                    query = query.or_(f"student_name.ilike.{search_term},student_id.ilike.{search_term}")
                    
            response = query.order('created_at', desc=True).execute()
            students = response.data
            
            # Post-process for teacher filter and active assignment
            filtered_students = []
            for student in students:
                assignments = student.get('teacher_student_assignments', [])
                active_assignment = next((a for a in assignments if a.get('status') == 'active'), None)
                
                # Assign derived fields for ease of use
                student['assignmentStatus'] = 'Assigned' if active_assignment else 'Unassigned'
                if active_assignment and active_assignment.get('teacher_profiles'):
                    student['assigned_teacher'] = active_assignment['teacher_profiles'].get('teacher_name')
                    student['assigned_teacher_id'] = active_assignment.get('teacher_id')
                else:
                    student['assigned_teacher'] = None
                    student['assigned_teacher_id'] = None
                
                # We don't have created_by_teacher in student_profiles currently, we'll leave it empty or map it if it exists.
                student['created_by_teacher'] = None
                
                # Apply teacher filter if provided
                if filters and filters.get('teacher_id'):
                    if student['assigned_teacher_id'] != filters['teacher_id']:
                        continue
                        
                filtered_students.append(student)

            return filtered_students
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
    def get_student_details_by_id(student_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed student profile with assignments and placeholders"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('student_profiles').select(
                '*, schools(school_name, school_code), teacher_student_assignments(teacher_id, status, created_at, teacher_profiles(teacher_name))'
            ).eq('id', student_id).execute()
            
            if not response.data:
                return None
                
            student = response.data[0]
            
            # Find active assignment
            assignments = student.get('teacher_student_assignments', [])
            active_assignment = next((a for a in assignments if a.get('status') == 'active'), None)
            
            student['assignmentStatus'] = 'Assigned' if active_assignment else 'Unassigned'
            if active_assignment and active_assignment.get('teacher_profiles'):
                student['assigned_teacher'] = active_assignment['teacher_profiles'].get('teacher_name')
                student['assigned_teacher_id'] = active_assignment.get('teacher_id')
            else:
                student['assigned_teacher'] = None
                student['assigned_teacher_id'] = None
                
            student['created_by_teacher'] = None # To be implemented when teacher tracking is added
            
            # Structure for placeholders
            student['assessmentSummary'] = {
                "completionPercentage": 0,
                "latestAssessmentDate": None
            }
            student['riskOverview'] = {
                "learningDifficultiesRisk": "Unknown",
                "dyslexiaIndicators": "Unknown",
                "readingFluencyProblems": "Unknown",
                "attentionInconsistency": "Unknown",
                "concentrationProblems": "Unknown",
                "cognitiveOverload": "Unknown",
                "riskLevel": "Unknown"
            }
            student['learningJourneySummary'] = {
                "currentJourney": None,
                "completionPercentage": 0,
                "activitiesCompleted": 0
            }
            
            return student
        except Exception as e:
            print(f"Error fetching student details: {e}")
            return None

    @staticmethod
    def deactivate_student(student_id: str) -> Dict[str, Any]:
        """Soft delete a student by setting status to inactive"""
        return StudentService.update_student(student_id, {"status": "inactive"})

    @staticmethod
    def get_student_stats() -> Dict[str, Any]:
        """Get stats for all students for Admin Dashboard"""
        try:
            supabase = get_supabase_client()
            
            # To get accurate stats, we should probably fetch all or use RPC. 
            # Given current scale, we can fetch all or just do multiple counts.
            # Let's fetch all student_profiles for basic counts.
            response = supabase.table('student_profiles').select('id, status, school_id, schools(school_name)').execute()
            students = response.data
            
            total = len(students)
            active = sum(1 for s in students if s.get('status') == 'active')
            inactive = sum(1 for s in students if s.get('status') == 'inactive')
            
            # Group by school
            school_counts = {}
            for s in students:
                school_name = s.get('schools', {}).get('school_name', 'Unknown') if s.get('schools') else 'Unknown'
                school_counts[school_name] = school_counts.get(school_name, 0) + 1
                
            school_distribution = [{"schoolName": name, "totalStudents": count} for name, count in school_counts.items()]
            
            # For assigned/unassigned, we query active assignments
            assignments_resp = supabase.table('teacher_student_assignments').select('student_id').eq('status', 'active').execute()
            assigned_student_ids = {a['student_id'] for a in assignments_resp.data}
            
            assigned = len(assigned_student_ids)
            unassigned = total - assigned
            
            return {
                "totalStudents": total,
                "activeStudents": active,
                "inactiveStudents": inactive,
                "assignedStudents": assigned,
                "unassignedStudents": unassigned,
                "schoolDistribution": school_distribution
            }
        except Exception as e:
            print(f"Error fetching student stats: {e}")
            return {
                "totalStudents": 0,
                "activeStudents": 0,
                "inactiveStudents": 0,
                "assignedStudents": 0,
                "unassignedStudents": 0,
                "schoolDistribution": []
            }

student_service = StudentService()
