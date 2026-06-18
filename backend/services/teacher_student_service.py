from typing import Dict, Any, List
from datetime import datetime
from services.supabase_client import get_supabase_client
from fastapi import HTTPException
import uuid

class TeacherStudentService:
    @staticmethod
    def _get_teacher_context(user_id: str) -> Dict[str, Any]:
        supabase = get_supabase_client()
        response = supabase.table('teacher_profiles').select('*').eq('user_id', user_id).execute()
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized as a teacher.")
        return response.data[0]

    @staticmethod
    def generate_student_id() -> str:
        supabase = get_supabase_client()
        response = supabase.table('student_profiles')\
            .select('student_id')\
            .like('student_id', 'STU%')\
            .order('student_id', desc=True)\
            .limit(1)\
            .execute()
            
        if not response.data:
            return "STU001"
            
        latest_id = response.data[0]['student_id']
        try:
            num = int(latest_id.replace('STU', ''))
            return f"STU{(num + 1):03d}"
        except:
            return f"STU{uuid.uuid4().hex[:6].upper()}"

    @staticmethod
    def create_student(user_id: str, student_data: Dict[str, Any]) -> Dict[str, Any]:
        teacher = TeacherStudentService._get_teacher_context(user_id)
        school_id = teacher['school_id']
        teacher_profile_id = teacher['id']
        
        supabase = get_supabase_client()
        
        student_id = student_data.get('student_id')
        if not student_id:
            student_id = TeacherStudentService.generate_student_id()
            
        temp_password = student_data.get('temporary_password', 'Stu@123')
        
        # Check if student ID exists
        existing = supabase.table('student_profiles').select('id').eq('student_id', student_id).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Student ID already exists")

        # Create Supabase Auth User using internal email
        internal_email = f"{student_id.lower()}@student.neurolearn.com"
        
        try:
            auth_response = supabase.auth.admin.create_user({
                "email": internal_email,
                "password": temp_password,
                "email_confirm": True,
                "user_metadata": {
                    "role": "student",
                    "student_id": student_id
                }
            })
            new_user_id = auth_response.user.id
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create auth user: {str(e)}")

        # Create Student Profile
        profile_insert = {
            "user_id": new_user_id,
            "student_id": student_id,
            "school_id": school_id,
            "student_name": student_data['student_name'],
            "grade": student_data.get('grade'),
            "section": student_data.get('section'),
            "date_of_birth": student_data.get('date_of_birth'),
            "gender": student_data.get('gender'),
            "phone": student_data.get('phone'),
            "email": student_data.get('email'), # Optional real email
            "address": student_data.get('address'),
            "status": "active",
            "enrollment_date": student_data.get('enrollment_date', datetime.utcnow().date().isoformat()),
            "created_by_teacher": teacher_profile_id,
            "emergency_contact_name": student_data.get('emergency_contact_name'),
            "emergency_contact_number": student_data.get('emergency_contact_number')
        }
        
        profile_res = supabase.table('student_profiles').insert(profile_insert).execute()
        if not profile_res.data:
            raise HTTPException(status_code=500, detail="Failed to create student profile")
            
        new_student = profile_res.data[0]
        
        # Assign to teacher
        supabase.table('teacher_student_assignments').insert({
            'teacher_id': teacher_profile_id,
            'student_id': new_student['id'],
            'status': 'active'
        }).execute()
        
        return new_student

    @staticmethod
    def update_student(user_id: str, student_uuid: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        teacher = TeacherStudentService._get_teacher_context(user_id)
        school_id = teacher['school_id']
        teacher_profile_id = teacher['id']
        
        supabase = get_supabase_client()
        
        # Verify access
        student = supabase.table('student_profiles').select('*').eq('id', student_uuid).execute()
        if not student.data:
            raise HTTPException(status_code=404, detail="Student not found")
            
        s = student.data[0]
        if s['school_id'] != school_id:
            raise HTTPException(status_code=403, detail="Cross-school access denied")
            
        # Verify assignment or created by teacher
        assignment = supabase.table('teacher_student_assignments').select('*').eq('student_id', student_uuid).eq('teacher_id', teacher_profile_id).execute()
        if not assignment.data and s.get('created_by_teacher') != teacher_profile_id:
            raise HTTPException(status_code=403, detail="Student not assigned to you")
            
        allowed_fields = ['student_name', 'grade', 'address', 'date_of_birth', 'gender', 'phone', 'email', 'emergency_contact_name', 'emergency_contact_number']
        update_payload = {k: v for k, v in update_data.items() if k in allowed_fields}
        update_payload['updated_at'] = datetime.utcnow().isoformat()
        
        res = supabase.table('student_profiles').update(update_payload).eq('id', student_uuid).execute()
        return res.data[0]

    @staticmethod
    def get_students_by_teacher(user_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherStudentService._get_teacher_context(user_id)
        school_id = teacher['school_id']
        teacher_profile_id = teacher['id']
        
        supabase = get_supabase_client()
        
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        assigned_ids = [a['student_id'] for a in assignments.data]
        
        if not assigned_ids:
            return []
            
        students = supabase.table('student_profiles').select('*').in_('id', assigned_ids).eq('school_id', school_id).execute()
        
        # Fetch risk levels
        student_ids = [s['id'] for s in students.data]
        reports = supabase.table('student_reports').select('student_id, risk_analysis').in_('student_id', student_ids).order('created_at', desc=True).execute()
        
        def extract_overall_risk(analysis):
            if not analysis: return 'Low'
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels: return 'Severe'
            if 'High' in levels: return 'High'
            if 'Moderate' in levels: return 'Moderate'
            return 'Low'
            
        latest_risk = {}
        for r in reports.data:
            if r['student_id'] not in latest_risk:
                latest_risk[r['student_id']] = extract_overall_risk(r.get('risk_analysis', {}))
                
        result = []
        for s in students.data:
            s['risk_level'] = latest_risk.get(s['id'], 'Unknown')
            result.append(s)
            
        return result

    @staticmethod
    def get_student_by_id(user_id: str, student_uuid: str) -> Dict[str, Any]:
        teacher = TeacherStudentService._get_teacher_context(user_id)
        school_id = teacher['school_id']
        teacher_profile_id = teacher['id']
        
        supabase = get_supabase_client()
        
        student = supabase.table('student_profiles').select('*').eq('id', student_uuid).execute()
        if not student.data:
            raise HTTPException(status_code=404, detail="Student not found")
            
        s = student.data[0]
        if s['school_id'] != school_id:
            raise HTTPException(status_code=403, detail="Cross-school access denied")
            
        assignment = supabase.table('teacher_student_assignments').select('*').eq('student_id', student_uuid).eq('teacher_id', teacher_profile_id).execute()
        if not assignment.data and s.get('created_by_teacher') != teacher_profile_id:
            raise HTTPException(status_code=403, detail="Student not assigned to you")
            
        return s

    @staticmethod
    def deactivate_student(user_id: str, student_uuid: str, status: str) -> Dict[str, Any]:
        teacher = TeacherStudentService._get_teacher_context(user_id)
        school_id = teacher['school_id']
        teacher_profile_id = teacher['id']
        
        supabase = get_supabase_client()
        
        student = supabase.table('student_profiles').select('school_id, created_by_teacher').eq('id', student_uuid).execute()
        if not student.data or student.data[0]['school_id'] != school_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        assignment = supabase.table('teacher_student_assignments').select('*').eq('student_id', student_uuid).eq('teacher_id', teacher_profile_id).execute()
        if not assignment.data and student.data[0].get('created_by_teacher') != teacher_profile_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        res = supabase.table('student_profiles').update({'status': status, 'updated_at': datetime.utcnow().isoformat()}).eq('id', student_uuid).execute()
        return res.data[0]

    @staticmethod
    def reset_student_password(user_id: str, student_uuid: str, new_password: str) -> Dict[str, str]:
        teacher = TeacherStudentService._get_teacher_context(user_id)
        school_id = teacher['school_id']
        teacher_profile_id = teacher['id']
        
        supabase = get_supabase_client()
        
        student = supabase.table('student_profiles').select('user_id, school_id, created_by_teacher').eq('id', student_uuid).execute()
        if not student.data or student.data[0]['school_id'] != school_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        s = student.data[0]
        assignment = supabase.table('teacher_student_assignments').select('*').eq('student_id', student_uuid).eq('teacher_id', teacher_profile_id).execute()
        if not assignment.data and s.get('created_by_teacher') != teacher_profile_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        if not s['user_id']:
            raise HTTPException(status_code=400, detail="Student has no associated auth user")
            
        try:
            supabase.auth.admin.update_user_by_id(s['user_id'], {"password": new_password})
            return {"message": "Password updated successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to reset password: {str(e)}")
