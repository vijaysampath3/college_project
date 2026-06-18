from typing import Dict, Any, List
from datetime import datetime, timedelta
from services.supabase_client import get_supabase_client
from fastapi import HTTPException
import uuid

class TeacherMonitoringService:
    @staticmethod
    def _get_teacher_context(user_id: str) -> Dict[str, Any]:
        supabase = get_supabase_client()
        response = supabase.table('teacher_profiles').select('*').eq('user_id', user_id).execute()
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized as a teacher.")
        return response.data[0]

    @staticmethod
    def _verify_student_access(teacher_profile_id: str, student_id: str) -> bool:
        supabase = get_supabase_client()
        # Ensure student is assigned to teacher
        assignments = supabase.table('teacher_student_assignments')\
            .select('id')\
            .eq('teacher_id', teacher_profile_id)\
            .eq('student_id', student_id)\
            .execute()
        return len(assignments.data) > 0

    @staticmethod
    def get_monitoring_summary(user_id: str) -> Dict[str, Any]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        # Get assigned students
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        student_uuids = [a['student_id'] for a in assignments.data]
        
        if not student_uuids:
            return {
                "totalStudents": 0,
                "requiringIntervention": 0,
                "inactiveStudents": 0,
                "pendingRecommendations": 0,
                "activeLearningPaths": 0,
                "assessmentsOverdue": 0
            }
            
        # Get latest reports for risk and readiness
        reports = supabase.table('student_reports')\
            .select('student_id, risk_analysis')\
            .in_('student_id', student_uuids)\
            .order('created_at', desc=True)\
            .execute()
            
        latest_reports = {}
        for r in reports.data:
            sid = r['student_id']
            if sid not in latest_reports:
                latest_reports[sid] = r
                
        requiring_intervention = 0
        for sid, report in latest_reports.items():
            analysis = report.get('risk_analysis', {})
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Moderate' in levels or 'High' in levels or 'Severe' in levels:
                requiring_intervention += 1
                
        # Inactive Students (No activity in 7 days)
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        
        # Get latest activity attempt for each student
        activities = supabase.table('student_activity_attempts')\
            .select('student_id, created_at')\
            .in_('student_id', student_uuids)\
            .order('created_at', desc=True)\
            .execute()
            
        latest_activity = {}
        for a in activities.data:
            sid = a['student_id']
            if sid not in latest_activity:
                latest_activity[sid] = a['created_at']
                
        inactive_students = 0
        for sid in student_uuids:
            last_act = latest_activity.get(sid)
            if not last_act or last_act < seven_days_ago:
                inactive_students += 1
                
        # Pending recommendations
        recommendations = supabase.table('student_recommendations')\
            .select('id')\
            .in_('student_id', student_uuids)\
            .eq('status', 'pending')\
            .execute()
        pending_recs = len(recommendations.data)
        
        # Active learning paths
        paths = supabase.table('student_learning_paths')\
            .select('id')\
            .in_('student_id', student_uuids)\
            .eq('status', 'active')\
            .execute()
        active_paths = len(paths.data)
        
        # Assessments Overdue (Using 14 days logic on assessment_progress)
        fourteen_days_ago = (datetime.utcnow() - timedelta(days=14)).isoformat()
        assessments_overdue_res = supabase.table('assessment_progress')\
            .select('id')\
            .in_('student_id', student_uuids)\
            .neq('status', 'completed')\
            .lt('updated_at', fourteen_days_ago)\
            .execute()
        assessments_overdue = len(assessments_overdue_res.data)

        return {
            "totalStudents": len(student_uuids),
            "requiringIntervention": requiring_intervention,
            "inactiveStudents": inactive_students,
            "pendingRecommendations": pending_recs,
            "activeLearningPaths": active_paths,
            "assessmentsOverdue": assessments_overdue
        }

    @staticmethod
    def get_intervention_students(user_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        if not assignments.data:
            return []
            
        student_uuids = [a['student_id'] for a in assignments.data]
        students = supabase.table('student_profiles').select('*').in_('id', student_uuids).execute()
        
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        fourteen_days_ago = (datetime.utcnow() - timedelta(days=14)).isoformat()
        
        # Fetch related data
        reports = supabase.table('student_reports').select('student_id, risk_analysis, readiness_score, created_at').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        activities = supabase.table('student_activity_attempts').select('student_id, created_at').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        paths = supabase.table('student_learning_paths').select('student_id, completion_percentage').in_('student_id', student_uuids).eq('status', 'active').execute()
        recommendations = supabase.table('student_recommendations').select('student_id, status').in_('student_id', student_uuids).execute()
        assessments = supabase.table('assessment_progress').select('student_id, status, updated_at').in_('student_id', student_uuids).execute()

        # Build maps
        latest_reports = {}
        for r in reports.data:
            if r['student_id'] not in latest_reports:
                latest_reports[r['student_id']] = r
                
        latest_activities = {}
        for a in activities.data:
            if a['student_id'] not in latest_activities:
                latest_activities[a['student_id']] = a['created_at']
                
        active_paths_map = {p['student_id']: p['completion_percentage'] for p in paths.data}
        
        recs_map = {}
        for r in recommendations.data:
            sid = r['student_id']
            if sid not in recs_map:
                recs_map[sid] = {'total': 0, 'completed': 0}
            recs_map[sid]['total'] += 1
            if r['status'] == 'completed':
                recs_map[sid]['completed'] += 1
                
        assessments_map = {}
        for a in assessments.data:
            sid = a['student_id']
            if sid not in assessments_map:
                assessments_map[sid] = []
            assessments_map[sid].append(a)

        result = []
        for s in students.data:
            sid = s['id']
            report = latest_reports.get(sid, {})
            
            # Risk Level
            analysis = report.get('risk_analysis', {})
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            risk_level = 'Low'
            if 'Severe' in levels: risk_level = 'Severe'
            elif 'High' in levels: risk_level = 'High'
            elif 'Moderate' in levels: risk_level = 'Moderate'
            
            # Activity
            last_activity = latest_activities.get(sid)
            is_inactive = not last_activity or last_activity < seven_days_ago
            
            # Assessments overdue
            student_assessments = assessments_map.get(sid, [])
            has_overdue_assessments = any(a['status'] != 'completed' and a['updated_at'] < fourteen_days_ago for a in student_assessments)
            
            # Build sort priority
            sort_priority = 5 # Low
            if risk_level in ['Severe', 'High']: sort_priority = 1
            elif risk_level == 'Moderate': sort_priority = 2
            elif has_overdue_assessments: sort_priority = 3
            elif is_inactive: sort_priority = 4
            
            # Status tag for UI
            status_tags = []
            if has_overdue_assessments: status_tags.append("Overdue Assessments")
            if is_inactive: status_tags.append("Inactive")
            
            result.append({
                "id": sid,
                "student_id": s['student_id'],
                "student_name": s['student_name'],
                "grade": s['grade'],
                "section": s['section'],
                "risk_level": risk_level,
                "readiness_score": report.get('readiness_score', 0),
                "path_progress": active_paths_map.get(sid, 0),
                "recs_completed": recs_map.get(sid, {}).get('completed', 0),
                "recs_total": recs_map.get(sid, {}).get('total', 0),
                "last_activity": last_activity,
                "sort_priority": sort_priority,
                "status_tags": status_tags
            })
            
        result.sort(key=lambda x: x['sort_priority'])
        return result

    @staticmethod
    def get_student_monitoring(user_id: str, student_id: str) -> Dict[str, Any]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        if not TeacherMonitoringService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized to monitor this student")
            
        supabase = get_supabase_client()
        student_res = supabase.table('student_profiles').select('*').eq('id', student_id).execute()
        student = student_res.data[0]
        
        reports = supabase.table('student_reports').select('risk_analysis, readiness_score').eq('student_id', student_id).order('created_at', desc=True).limit(1).execute()
        risk_level = 'Low'
        readiness_score = 0
        if reports.data:
            analysis = reports.data[0].get('risk_analysis', {})
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels: risk_level = 'Severe'
            elif 'High' in levels: risk_level = 'High'
            elif 'Moderate' in levels: risk_level = 'Moderate'
            readiness_score = reports.data[0].get('readiness_score', 0)
            
        # Parent info
        parents_res = supabase.table('student_parent_relationships')\
            .select('relationship, is_primary_parent, parent_profiles!inner(parent_name, email, phone)')\
            .eq('student_id', student_id)\
            .execute()
            
        return {
            "student": student,
            "risk_level": risk_level,
            "readiness_score": readiness_score,
            "parents": parents_res.data
        }

    @staticmethod
    def get_student_assessments(user_id: str, student_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        if not TeacherMonitoringService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        
        # We need latest 2 results per type to calculate trend
        results = supabase.table('assessment_results')\
            .select('assessment_type, result_data, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .execute()
            
        grouped = {}
        for r in results.data:
            atype = r['assessment_type']
            if atype not in grouped:
                grouped[atype] = []
            grouped[atype].append(r)
            
        assessments = []
        for atype, items in grouped.items():
            latest = items[0]
            latest_score = latest.get('result_data', {}).get('overallScore', 0)
            latest_risk = latest.get('result_data', {}).get('riskLevel', 'Low')
            
            trend_val = None
            trend_display = "Insufficient Data"
            
            if len(items) >= 2:
                prev = items[1]
                prev_score = prev.get('result_data', {}).get('overallScore', 0)
                trend_val = latest_score - prev_score
                if trend_val > 0:
                    trend_display = f"Improving ↑ (+{trend_val})"
                elif trend_val < 0:
                    trend_display = f"Declining ↓ ({trend_val})"
                else:
                    trend_display = "Stable"
            
            assessments.append({
                "type": atype,
                "score": latest_score,
                "risk": latest_risk,
                "date": latest['created_at'],
                "trend": trend_display,
                "trend_value": trend_val
            })
            
        return assessments

    @staticmethod
    def get_student_learning_path(user_id: str, student_id: str) -> Dict[str, Any]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        if not TeacherMonitoringService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        paths = supabase.table('student_learning_paths').select('*').eq('student_id', student_id).eq('status', 'active').order('created_at', desc=True).limit(1).execute()
        
        # Add new assignment tracking to monitoring
        act = supabase.table('teacher_assigned_activities').select('*').eq('student_id', student_id).order('created_at', desc=True).execute()
        ass = supabase.table('teacher_assigned_assessments').select('*').eq('student_id', student_id).order('created_at', desc=True).execute()

        active_path = paths.data[0] if paths.data else None
        
        return {
            "learning_path": active_path,
            "assigned_activities": act.data,
            "assigned_assessments": ass.data
        }

    @staticmethod
    def get_student_recommendations(user_id: str, student_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        if not TeacherMonitoringService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        recs = supabase.table('student_recommendations').select('*').eq('student_id', student_id).order('created_at', desc=True).execute()
        return recs.data

    @staticmethod
    def get_student_activities(user_id: str, student_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        if not TeacherMonitoringService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        acts = supabase.table('student_activity_attempts').select('id, score, time_spent_seconds, created_at, learning_activities!inner(title, type)').eq('student_id', student_id).order('created_at', desc=True).execute()
        return acts.data

    @staticmethod
    def create_teacher_note(user_id: str, student_id: str, note: str) -> Dict[str, Any]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        if not TeacherMonitoringService._verify_student_access(teacher_profile_id, student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        data = {
            "teacher_id": teacher_profile_id,
            "student_id": student_id,
            "note": note
        }
        res = supabase.table('teacher_student_notes').insert(data).execute()
        return res.data[0]

    @staticmethod
    def get_teacher_notes(user_id: str, student_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherMonitoringService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        if not TeacherMonitoringService._verify_student_access(teacher_profile_id, student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        notes = supabase.table('teacher_student_notes').select('*').eq('student_id', student_id).eq('teacher_id', teacher_profile_id).order('created_at', desc=True).execute()
        return notes.data
