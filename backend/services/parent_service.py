from typing import List, Dict, Any, Optional
from services.supabase_client import get_supabase_client
from datetime import datetime, timezone

class ParentService:
    @staticmethod
    def get_parents(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all parents with optional filtering"""
        try:
            supabase = get_supabase_client()
            query = supabase.table('parent_profiles').select(
                '*, teacher_profiles(id, teacher_name, schools(id, school_name)), student_parent_relationships(relationship, student_profiles(id, student_name, student_id, grade, section))'
            )
            
            if filters:
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('search'):
                    search_term = f"%{filters['search']}%"
                    query = query.or_(f"parent_name.ilike.{search_term},parent_id.ilike.{search_term},phone.ilike.{search_term},email.ilike.{search_term}")
                    
            response = query.order('created_at', desc=True).execute()
            parents = response.data
            
            filtered_parents = []
            for parent in parents:
                # Resolve School from the creator teacher
                creator_teacher = parent.get('teacher_profiles') or {}
                parent['created_by_teacher_name'] = creator_teacher.get('teacher_name')
                
                school = creator_teacher.get('schools') or {}
                parent['school_id'] = school.get('id')
                parent['school_name'] = school.get('school_name')

                # Apply school and teacher filters
                if filters and filters.get('school_id') and parent['school_id'] != filters['school_id']:
                    continue
                if filters and filters.get('teacher_id') and parent.get('created_by_teacher') != filters['teacher_id']:
                    continue

                # Process relationships
                relationships = parent.get('student_parent_relationships', [])
                
                # Apply relationship filter
                if filters and filters.get('relationship'):
                    has_rel = any(r.get('relationship') == filters['relationship'] for r in relationships)
                    if not has_rel:
                        continue
                
                # Apply student filter
                if filters and filters.get('student_id'):
                    has_student = any(r.get('student_profiles', {}).get('id') == filters['student_id'] for r in relationships)
                    if not has_student:
                        continue
                
                # Flatten relationships for the table view
                parent['linked_students'] = [
                    {
                        "relationship": r.get('relationship'),
                        "student_name": r.get('student_profiles', {}).get('student_name'),
                        "student_id": r.get('student_profiles', {}).get('student_id'),
                        "grade": r.get('student_profiles', {}).get('grade'),
                        "section": r.get('student_profiles', {}).get('section')
                    }
                    for r in relationships if r.get('student_profiles')
                ]
                
                filtered_parents.append(parent)

            return filtered_parents
        except Exception as e:
            print(f"Error fetching parents: {e}")
            return []

    @staticmethod
    def get_parent_details_by_id(parent_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed parent profile with students and hierarchy"""
        try:
            supabase = get_supabase_client()
            response = supabase.table('parent_profiles').select(
                '*, teacher_profiles(id, teacher_name, employee_id, schools(id, school_name, district, status)), student_parent_relationships(relationship, linked_by_teacher, student_profiles(id, student_name, student_id, grade, section, status, teacher_student_assignments(status, teacher_profiles(teacher_name))))'
            ).eq('id', parent_id).execute()
            
            if not response.data:
                return None
                
            parent = response.data[0]
            
            # Resolve creator teacher and school
            creator_teacher = parent.get('teacher_profiles') or {}
            parent['created_by_teacher_name'] = creator_teacher.get('teacher_name')
            parent['created_by_teacher_employee_id'] = creator_teacher.get('employee_id')
            
            school = creator_teacher.get('schools') or {}
            parent['school_id'] = school.get('id')
            parent['school_name'] = school.get('school_name')
            parent['school_district'] = school.get('district')
            parent['school_status'] = school.get('status')
            
            # Process relationships and linked students' assigned teachers
            relationships = parent.get('student_parent_relationships', [])
            linked_students = []
            for r in relationships:
                sp = r.get('student_profiles')
                if not sp: continue
                
                assigned_teacher = None
                assignments = sp.get('teacher_student_assignments', [])
                active_assignment = next((a for a in assignments if a.get('status') == 'active'), None)
                if active_assignment and active_assignment.get('teacher_profiles'):
                    assigned_teacher = active_assignment['teacher_profiles'].get('teacher_name')
                
                linked_students.append({
                    "relationship": r.get('relationship'),
                    "linked_by_teacher": r.get('linked_by_teacher'),
                    "student_name": sp.get('student_name'),
                    "student_system_id": sp.get('id'),
                    "student_id": sp.get('student_id'),
                    "grade": sp.get('grade'),
                    "section": sp.get('section'),
                    "status": sp.get('status'),
                    "assigned_teacher": assigned_teacher,
                    "school_name": parent['school_name'] # Inherited from parent's school
                })
            
            parent['linked_students'] = linked_students
            
            # Future placeholders
            parent['communicationSummary'] = {
                "lastLogin": None,
                "portalUsage": "Unknown",
                "messagesSent": 0,
                "notificationsViewed": 0
            }
            
            return parent
        except Exception as e:
            print(f"Error fetching parent details: {e}")
            return None

    @staticmethod
    def deactivate_parent(parent_id: str) -> Dict[str, Any]:
        """Soft delete a parent by setting status to inactive"""
        try:
            supabase = get_supabase_client()
            data = {"status": "inactive", "updated_at": datetime.now(timezone.utc).isoformat()}
            response = supabase.table('parent_profiles').update(data).eq('id', parent_id).execute()
            if not response.data:
                raise Exception("Parent not found or update failed")
            return response.data[0]
        except Exception as e:
            print(f"Error deactivating parent: {e}")
            raise Exception(f"Failed to deactivate parent: {str(e)}")

    @staticmethod
    def get_parent_stats() -> Dict[str, Any]:
        """Get stats for all parents"""
        try:
            supabase = get_supabase_client()
            
            response = supabase.table('parent_profiles').select(
                'id, status, teacher_profiles(schools(school_name)), student_parent_relationships(relationship)'
            ).execute()
            parents = response.data
            
            total = len(parents)
            active = sum(1 for p in parents if p.get('status') == 'active')
            inactive = sum(1 for p in parents if p.get('status') == 'inactive')
            
            school_counts = {}
            linked = 0
            
            relationship_stats = {
                "Fathers": 0,
                "Mothers": 0,
                "Guardians": 0,
                "Others": 0
            }
            
            for p in parents:
                # School distribution
                school_name = p.get('teacher_profiles', {}).get('schools', {}).get('school_name') if p.get('teacher_profiles') and p['teacher_profiles'].get('schools') else 'Unknown'
                school_counts[school_name] = school_counts.get(school_name, 0) + 1
                
                # Link status
                rels = p.get('student_parent_relationships', [])
                if len(rels) > 0:
                    linked += 1
                    
                # Relationship types
                for r in rels:
                    rel_type = r.get('relationship', '')
                    if rel_type == 'Father': relationship_stats['Fathers'] += 1
                    elif rel_type == 'Mother': relationship_stats['Mothers'] += 1
                    elif rel_type == 'Guardian': relationship_stats['Guardians'] += 1
                    else: relationship_stats['Others'] += 1
                
            school_distribution = [{"schoolName": name, "totalParents": count} for name, count in school_counts.items()]
            unlinked = total - linked
            
            return {
                "totalParents": total,
                "activeParents": active,
                "inactiveParents": inactive,
                "linkedParents": linked,
                "unlinkedParents": unlinked,
                "schoolDistribution": school_distribution,
                "relationshipSummary": relationship_stats
            }
        except Exception as e:
            print(f"Error fetching parent stats: {e}")
            return {
                "totalParents": 0,
                "activeParents": 0,
                "inactiveParents": 0,
                "linkedParents": 0,
                "unlinkedParents": 0,
                "schoolDistribution": [],
                "relationshipSummary": {
                    "Fathers": 0,
                    "Mothers": 0,
                    "Guardians": 0,
                    "Others": 0
                }
            }

parent_service = ParentService()
