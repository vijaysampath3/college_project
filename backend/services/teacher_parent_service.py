from typing import Dict, Any, List
from datetime import datetime
from services.supabase_client import get_supabase_client
from fastapi import HTTPException
import uuid

class TeacherParentService:
    @staticmethod
    def _get_teacher_context(user_id: str) -> Dict[str, Any]:
        supabase = get_supabase_client()
        response = supabase.table('teacher_profiles').select('*').eq('user_id', user_id).execute()
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized as a teacher.")
        return response.data[0]

    @staticmethod
    def generate_parent_id() -> str:
        supabase = get_supabase_client()
        response = supabase.table('parent_profiles')\
            .select('parent_id')\
            .like('parent_id', 'PAR%')\
            .order('parent_id', desc=True)\
            .limit(1)\
            .execute()
            
        if not response.data:
            return "PAR001"
            
        latest_id = response.data[0]['parent_id']
        try:
            num = int(latest_id.replace('PAR', ''))
            return f"PAR{(num + 1):03d}"
        except:
            return f"PAR{uuid.uuid4().hex[:6].upper()}"

    @staticmethod
    def create_parent(user_id: str, parent_data: Dict[str, Any]) -> Dict[str, Any]:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        
        supabase = get_supabase_client()
        
        parent_id = parent_data.get('parent_id')
        if not parent_id:
            parent_id = TeacherParentService.generate_parent_id()
            
        temp_password = parent_data.get('temporary_password', 'Par@123')
        
        # Check if parent ID exists
        existing = supabase.table('parent_profiles').select('id').eq('parent_id', parent_id).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Parent ID already exists")

        # Create Supabase Auth User using internal email
        internal_email = f"{parent_id.lower()}@parent.neurolearn.com"
        
        try:
            auth_response = supabase.auth.admin.create_user({
                "email": internal_email,
                "password": temp_password,
                "email_confirm": True,
                "user_metadata": {
                    "role": "parent",
                    "parent_id": parent_id
                }
            })
            new_user_id = auth_response.user.id
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create auth user: {str(e)}")

        # Create Parent Profile
        profile_insert = {
            "user_id": new_user_id,
            "parent_id": parent_id,
            "parent_name": parent_data['parent_name'],
            "email": parent_data.get('email'),
            "phone": parent_data.get('phone'),
            "occupation": parent_data.get('occupation'),
            "address": parent_data.get('address'),
            "status": parent_data.get('status', 'active'),
            "created_by_teacher": teacher_profile_id
        }
        
        profile_res = supabase.table('parent_profiles').insert(profile_insert).execute()
        if not profile_res.data:
            raise HTTPException(status_code=500, detail="Failed to create parent profile")
            
        new_parent = profile_res.data[0]
        
        return {
            "parent": new_parent,
            "temporary_password": temp_password
        }

    @staticmethod
    def update_parent(user_id: str, parent_id_str: str, parent_data: Dict[str, Any]) -> Dict[str, Any]:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        # Verify ownership
        existing = supabase.table('parent_profiles').select('*').eq('parent_id', parent_id_str).eq('created_by_teacher', teacher_profile_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Parent not found or not authorized")
            
        update_data = {
            "parent_name": parent_data.get('parent_name', existing.data[0]['parent_name']),
            "email": parent_data.get('email', existing.data[0]['email']),
            "phone": parent_data.get('phone', existing.data[0]['phone']),
            "occupation": parent_data.get('occupation', existing.data[0]['occupation']),
            "address": parent_data.get('address', existing.data[0]['address']),
            "status": parent_data.get('status', existing.data[0]['status']),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        res = supabase.table('parent_profiles').update(update_data).eq('parent_id', parent_id_str).execute()
        return res.data[0]

    @staticmethod
    def get_parents_by_teacher(user_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        parents_res = supabase.table('parent_profiles').select('*').eq('created_by_teacher', teacher_profile_id).order('created_at', desc=True).execute()
        
        parents = parents_res.data
        if not parents:
            return []
            
        parent_uuids = [p['id'] for p in parents]
        
        # Get linked student count for each parent
        links_res = supabase.table('student_parent_relationships').select('parent_id, student_id').in_('parent_id', parent_uuids).execute()
        
        counts = {}
        for link in links_res.data:
            pid = link['parent_id']
            counts[pid] = counts.get(pid, 0) + 1
            
        for p in parents:
            p['linked_students_count'] = counts.get(p['id'], 0)
            
        return parents

    @staticmethod
    def get_parent_by_id(user_id: str, parent_id_str: str) -> Dict[str, Any]:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        # Verify ownership
        parents_res = supabase.table('parent_profiles').select('*').eq('parent_id', parent_id_str).eq('created_by_teacher', teacher_profile_id).execute()
        if not parents_res.data:
            raise HTTPException(status_code=404, detail="Parent not found or not authorized")
            
        parent = parents_res.data[0]
        
        # Get linked students
        links_res = supabase.table('student_parent_relationships').select('id, relationship, is_primary_parent, student_id, student_profiles!inner(*)').eq('parent_id', parent['id']).execute()
        
        parent['linked_students'] = []
        for link in links_res.data:
            student_info = link.get('student_profiles', {})
            parent['linked_students'].append({
                "relationship_id": link['id'],
                "relationship": link['relationship'],
                "is_primary_parent": link['is_primary_parent'],
                "student_id": student_info.get('student_id'),
                "student_name": student_info.get('student_name'),
                "grade": student_info.get('grade'),
                "section": student_info.get('section')
            })
            
        return parent

    @staticmethod
    def deactivate_parent(user_id: str, parent_id_str: str) -> Dict[str, Any]:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        existing = supabase.table('parent_profiles').select('*').eq('parent_id', parent_id_str).eq('created_by_teacher', teacher_profile_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Parent not found or not authorized")
            
        res = supabase.table('parent_profiles').update({"status": "inactive", "updated_at": datetime.utcnow().isoformat()}).eq('parent_id', parent_id_str).execute()
        return res.data[0]

    @staticmethod
    def reset_parent_password(user_id: str, parent_id_str: str, new_password: str) -> bool:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        existing = supabase.table('parent_profiles').select('*').eq('parent_id', parent_id_str).eq('created_by_teacher', teacher_profile_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Parent not found or not authorized")
            
        parent_user_id = existing.data[0]['user_id']
        
        if not parent_user_id:
             raise HTTPException(status_code=400, detail="Parent account not fully setup (missing user_id)")
             
        try:
            supabase.auth.admin.update_user_by_id(parent_user_id, {"password": new_password})
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to reset password: {str(e)}")

    @staticmethod
    def get_parent_stats(user_id: str) -> Dict[str, Any]:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        parents_res = supabase.table('parent_profiles').select('id, status').eq('created_by_teacher', teacher_profile_id).execute()
        parents = parents_res.data
        
        if not parents:
            return {
                "total_parents": 0,
                "active_parents": 0,
                "linked_parents": 0,
                "unlinked_parents": 0,
                "children_linked": 0
            }
            
        parent_uuids = [p['id'] for p in parents]
        
        links_res = supabase.table('student_parent_relationships').select('parent_id, student_id').in_('parent_id', parent_uuids).execute()
        
        linked_parent_ids = set([link['parent_id'] for link in links_res.data])
        
        return {
            "total_parents": len(parents),
            "active_parents": sum(1 for p in parents if p.get('status') == 'active'),
            "linked_parents": len(linked_parent_ids),
            "unlinked_parents": len(parents) - len(linked_parent_ids),
            "children_linked": len(links_res.data)
        }

    @staticmethod
    def get_available_students_for_assignment(user_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        if not assignments.data:
            return []
            
        student_uuids = [a['student_id'] for a in assignments.data]
        students = supabase.table('student_profiles').select('id, student_id, student_name, grade, section').in_('id', student_uuids).eq('status', 'active').execute()
        
        return students.data

    @staticmethod
    def assign_students_to_parent(user_id: str, parent_id_str: str, assignments: List[Dict[str, Any]]) -> bool:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        # Verify parent ownership
        parent_res = supabase.table('parent_profiles').select('id').eq('parent_id', parent_id_str).eq('created_by_teacher', teacher_profile_id).execute()
        if not parent_res.data:
            raise HTTPException(status_code=404, detail="Parent not found or not authorized")
        parent_uuid = parent_res.data[0]['id']
        
        # Verify students belong to teacher
        teacher_assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        teacher_student_uuids = set([a['student_id'] for a in teacher_assignments.data])
        
        for a in assignments:
            if a['student_id'] not in teacher_student_uuids:
                raise HTTPException(status_code=403, detail=f"Not authorized to assign student {a['student_id']}")
                
        # Insert or update assignments
        for a in assignments:
            # Check if relationship already exists
            existing = supabase.table('student_parent_relationships').select('id').eq('parent_id', parent_uuid).eq('student_id', a['student_id']).execute()
            
            if existing.data:
                # Update
                supabase.table('student_parent_relationships').update({
                    "relationship": a['relationship'],
                    "is_primary_parent": a.get('is_primary_parent', False),
                    "updated_at": datetime.utcnow().isoformat()
                }).eq('id', existing.data[0]['id']).execute()
            else:
                # Insert
                supabase.table('student_parent_relationships').insert({
                    "parent_id": parent_uuid,
                    "student_id": a['student_id'],
                    "relationship": a['relationship'],
                    "is_primary_parent": a.get('is_primary_parent', False),
                    "linked_by_teacher": teacher_profile_id
                }).execute()
                
        return True

    @staticmethod
    def remove_relationship(user_id: str, relationship_id: str) -> bool:
        teacher = TeacherParentService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        # Verify the relationship is linked by this teacher or parent created by this teacher
        rel_res = supabase.table('student_parent_relationships').select('parent_id').eq('id', relationship_id).execute()
        if not rel_res.data:
            raise HTTPException(status_code=404, detail="Relationship not found")
            
        parent_uuid = rel_res.data[0]['parent_id']
        parent_res = supabase.table('parent_profiles').select('id').eq('id', parent_uuid).eq('created_by_teacher', teacher_profile_id).execute()
        if not parent_res.data:
            raise HTTPException(status_code=403, detail="Not authorized to remove this relationship")
            
        supabase.table('student_parent_relationships').delete().eq('id', relationship_id).execute()
        return True
