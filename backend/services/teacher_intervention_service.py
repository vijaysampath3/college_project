from typing import Dict, Any, List
from datetime import datetime, timedelta
from services.supabase_client import get_supabase_client
from fastapi import HTTPException
import uuid

class TeacherInterventionService:
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
        assignments = supabase.table('teacher_student_assignments')\
            .select('id')\
            .eq('teacher_id', teacher_profile_id)\
            .eq('student_id', student_id)\
            .execute()
        return len(assignments.data) > 0

    @staticmethod
    def _create_student_notification(student_id: str, title: str, message: str, type: str, source_type: str = None, source_id: str = None):
        supabase = get_supabase_client()
        data = {
            "student_id": student_id,
            "title": title,
            "message": message,
            "type": type,
            "source_type": source_type,
            "source_id": source_id
        }
        supabase.table('student_notifications').insert(data).execute()

    @staticmethod
    def get_assessment_overview(user_id: str) -> Dict[str, Any]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        student_uuids = [a['student_id'] for a in assignments.data]
        
        if not student_uuids:
            return {
                "totalAssessments": 0,
                "pendingActivities": 0,
                "pendingAssessments": 0,
                "requiringIntervention": 0
            }
            
        # Total assessments reviewed (just count all completed assessments)
        assessments_res = supabase.table('assessment_progress').select('id').in_('student_id', student_uuids).eq('status', 'completed').execute()
        total_assessments = len(assessments_res.data)
        
        # Pending Activities
        pending_act = supabase.table('teacher_assigned_activities').select('id').eq('teacher_id', teacher_profile_id).neq('status', 'completed').execute()
        
        # Pending Assessments
        pending_ass = supabase.table('teacher_assigned_assessments').select('id').eq('teacher_id', teacher_profile_id).neq('status', 'completed').execute()
        
        # Requiring intervention
        reports = supabase.table('student_reports').select('student_id, risk_analysis').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        latest_reports = {}
        for r in reports.data:
            if r['student_id'] not in latest_reports:
                latest_reports[r['student_id']] = r
                
        requiring_intervention = 0
        for sid, report in latest_reports.items():
            analysis = report.get('risk_analysis', {})
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Moderate' in levels or 'High' in levels or 'Severe' in levels:
                requiring_intervention += 1
                
        return {
            "totalAssessments": total_assessments,
            "pendingActivities": len(pending_act.data),
            "pendingAssessments": len(pending_ass.data),
            "requiringIntervention": requiring_intervention
        }

    @staticmethod
    def get_recent_assessments(user_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        if not assignments.data:
            return []
            
        student_uuids = [a['student_id'] for a in assignments.data]
        students = supabase.table('student_profiles').select('id, student_name, grade, section').in_('id', student_uuids).execute()
        student_map = {s['id']: s for s in students.data}
        
        # Fetch latest assessment per student per type
        results = supabase.table('assessment_results').select('id, student_id, assessment_type, result_data, created_at').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        
        latest_map = {}
        for r in results.data:
            key = f"{r['student_id']}_{r['assessment_type']}"
            if key not in latest_map:
                latest_map[key] = r
                
        final_list = []
        for r in latest_map.values():
            s = student_map.get(r['student_id'])
            if not s: continue
            
            score = r.get('result_data', {}).get('overallScore', 0)
            risk = r.get('result_data', {}).get('riskLevel', 'Low')
            
            final_list.append({
                "id": r['id'],
                "student_id": r['student_id'],
                "student_name": s['student_name'],
                "grade": s['grade'],
                "section": s['section'],
                "type": r['assessment_type'],
                "score": score,
                "risk": risk,
                "date": r['created_at']
            })
            
        # Sort by date desc
        final_list.sort(key=lambda x: x['date'], reverse=True)
        return final_list

    @staticmethod
    def get_intervention_queue(user_id: str) -> List[Dict[str, Any]]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        teacher_profile_id = teacher['id']
        supabase = get_supabase_client()
        
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_profile_id).execute()
        if not assignments.data:
            return []
            
        student_uuids = [a['student_id'] for a in assignments.data]
        students = supabase.table('student_profiles').select('id, student_name, grade, section').in_('id', student_uuids).execute()
        
        reports = supabase.table('student_reports').select('student_id, risk_analysis').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        latest_reports = {r['student_id']: r for r in reports.data} # this relies on descending order to get latest first eventually handled below
        # Correctly get latest
        latest_rep_map = {}
        for r in reports.data:
            if r['student_id'] not in latest_rep_map:
                latest_rep_map[r['student_id']] = r

        act_assignments = supabase.table('teacher_assigned_activities').select('student_id, status, due_date').in_('student_id', student_uuids).execute()
        ass_assignments = supabase.table('teacher_assigned_assessments').select('student_id, status, due_date').in_('student_id', student_uuids).execute()
        
        act_map = {}
        ass_map = {}
        has_overdue = {}
        
        now = datetime.utcnow().isoformat()
        
        for a in act_assignments.data:
            sid = a['student_id']
            if sid not in act_map: act_map[sid] = {'total': 0, 'completed': 0}
            act_map[sid]['total'] += 1
            if a['status'] == 'completed': act_map[sid]['completed'] += 1
            if a['status'] != 'completed' and a['due_date'] and a['due_date'] < now:
                has_overdue[sid] = True
                
        for a in ass_assignments.data:
            sid = a['student_id']
            if sid not in ass_map: ass_map[sid] = {'total': 0, 'completed': 0}
            ass_map[sid]['total'] += 1
            if a['status'] == 'completed': ass_map[sid]['completed'] += 1
            if a['status'] != 'completed' and a['due_date'] and a['due_date'] < now:
                has_overdue[sid] = True

        queue = []
        for s in students.data:
            sid = s['id']
            report = latest_rep_map.get(sid, {})
            analysis = report.get('risk_analysis', {})
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            
            risk_level = 'Low'
            if 'Severe' in levels: risk_level = 'Severe'
            elif 'High' in levels: risk_level = 'High'
            elif 'Moderate' in levels: risk_level = 'Moderate'
            
            sort_priority = 5
            if risk_level in ['Severe', 'High']: sort_priority = 1
            elif has_overdue.get(sid): sort_priority = 2
            elif risk_level == 'Moderate': sort_priority = 3
            
            queue.append({
                "student_id": sid,
                "student_name": s['student_name'],
                "grade": s['grade'],
                "section": s['section'],
                "risk_level": risk_level,
                "assigned_activities": act_map.get(sid, {}).get('total', 0),
                "completed_activities": act_map.get(sid, {}).get('completed', 0),
                "assigned_assessments": ass_map.get(sid, {}).get('total', 0),
                "completed_assessments": ass_map.get(sid, {}).get('completed', 0),
                "has_overdue": has_overdue.get(sid, False),
                "sort_priority": sort_priority
            })
            
        queue.sort(key=lambda x: x['sort_priority'])
        return queue

    @staticmethod
    def get_assessment_recommendations(user_id: str, student_id: str, assessment_id: str) -> Dict[str, Any]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        if not TeacherInterventionService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        ass_res = supabase.table('assessment_results').select('*').eq('id', assessment_id).execute()
        if not ass_res.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
            
        assessment = ass_res.data[0]
        atype = assessment['assessment_type']
        risk = assessment.get('result_data', {}).get('riskLevel', 'Low')
        
        # Dynamic recommendation logic
        activities = []
        assessments = []
        explanation = ""
        
        if atype == 'reading':
            explanation = f"Reading Assessment Risk is {risk}. Based on recent fluency and accuracy scores."
            if risk in ['High', 'Severe']:
                activities.append({"title": "Reading Fluency Practice", "code": "read_fluency_1", "category": "reading"})
                activities.append({"title": "Letter Recognition", "code": "letter_rec_1", "category": "reading"})
                assessments.append({"title": "Attention Assessment", "type": "attention"})
        elif atype == 'attention':
            explanation = f"Attention Assessment Risk is {risk}."
            if risk in ['High', 'Severe']:
                activities.append({"title": "Focus Training Exercise", "code": "focus_train_1", "category": "attention"})
        elif atype == 'typing':
            explanation = f"Typing Assessment Risk is {risk}."
            if risk in ['High', 'Severe']:
                activities.append({"title": "Keyboarding Practice", "code": "type_prac_1", "category": "typing"})
        
        if risk in ['Low', 'Moderate']:
            activities.append({"title": "Motivation Activity", "code": "motiv_1", "category": "general"})
            
        return {
            "assessment": assessment,
            "explanation": explanation,
            "recommended_activities": activities,
            "recommended_assessments": assessments
        }

    @staticmethod
    def assign_activity(user_id: str, student_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        if not TeacherInterventionService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        data = {
            "teacher_id": teacher['id'],
            "student_id": student_id,
            "activity_code": payload.get('activity_code'),
            "activity_title": payload.get('activity_title'),
            "activity_category": payload.get('activity_category', 'general'),
            "priority": payload.get('priority', 'Normal'),
            "teacher_note": payload.get('teacher_note'),
            "due_date": payload.get('due_date')
        }
        res = supabase.table('teacher_assigned_activities').insert(data).execute()
        
        # Notify student
        TeacherInterventionService._create_student_notification(
            student_id,
            "New Activity Assigned",
            f"Your teacher assigned a new activity: {payload.get('activity_title')}",
            "assignment",
            "teacher_assigned_activity",
            res.data[0]['id']
        )
        
        return res.data[0]

    @staticmethod
    def assign_assessment(user_id: str, student_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        if not TeacherInterventionService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        data = {
            "teacher_id": teacher['id'],
            "student_id": student_id,
            "assessment_type": payload.get('assessment_type'),
            "assessment_title": payload.get('assessment_title'),
            "reason": payload.get('reason'),
            "priority": payload.get('priority', 'Normal'),
            "teacher_note": payload.get('teacher_note'),
            "due_date": payload.get('due_date')
        }
        res = supabase.table('teacher_assigned_assessments').insert(data).execute()
        
        # Notify student
        TeacherInterventionService._create_student_notification(
            student_id,
            "New Assessment Assigned",
            f"Your teacher assigned a new assessment: {payload.get('assessment_title')}",
            "assignment",
            "teacher_assigned_assessment",
            res.data[0]['id']
        )
        
        return res.data[0]

    @staticmethod
    def get_student_assignments(user_id: str, student_id: str) -> Dict[str, Any]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        if not TeacherInterventionService._verify_student_access(teacher['id'], student_id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase = get_supabase_client()
        act = supabase.table('teacher_assigned_activities').select('*').eq('student_id', student_id).order('created_at', desc=True).execute()
        ass = supabase.table('teacher_assigned_assessments').select('*').eq('student_id', student_id).order('created_at', desc=True).execute()
        
        return {
            "activities": act.data,
            "assessments": ass.data
        }

    @staticmethod
    def get_all_assigned(user_id: str) -> Dict[str, Any]:
        teacher = TeacherInterventionService._get_teacher_context(user_id)
        supabase = get_supabase_client()
        act = supabase.table('teacher_assigned_activities').select('*, student_profiles(student_name)').eq('teacher_id', teacher['id']).order('created_at', desc=True).execute()
        ass = supabase.table('teacher_assigned_assessments').select('*, student_profiles(student_name)').eq('teacher_id', teacher['id']).order('created_at', desc=True).execute()
        
        return {
            "activities": act.data,
            "assessments": ass.data
        }
