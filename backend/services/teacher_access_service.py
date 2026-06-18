from typing import Dict, Any, List
from datetime import datetime, timedelta
from services.supabase_client import get_supabase_client
from fastapi import HTTPException

class TeacherAccessService:
    @staticmethod
    def get_current_teacher(user_id: str) -> Dict[str, Any]:
        """Resolves the logged-in user to a teacher profile."""
        supabase = get_supabase_client()
        response = supabase.table('teacher_profiles').select('*, schools(school_name)').eq('user_id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized as a teacher.")
            
        teacher = response.data[0]
        return {
            "id": teacher["id"],
            "teacherId": teacher.get("teacher_id"),
            "teacherName": teacher.get("teacher_name"),
            "email": teacher.get("email"),
            "schoolId": teacher.get("school_id"),
            "schoolName": teacher.get("schools", {}).get("school_name", "Unknown School"),
            "department": teacher.get("department", ""),
            "designation": teacher.get("designation", "")
        }

    @staticmethod
    def get_assigned_students(teacher_id: str, school_id: str) -> List[Dict[str, Any]]:
        """Fetches students assigned to the teacher, ensuring they belong to the same school."""
        supabase = get_supabase_client()
        
        # Get assigned student IDs
        assignments = supabase.table('teacher_student_assignments')\
            .select('student_id')\
            .eq('teacher_id', teacher_id)\
            .eq('status', 'active')\
            .execute()
            
        if not assignments.data:
            return []
            
        student_ids = [a['student_id'] for a in assignments.data]
        
        # Fetch the actual students, enforcing school_id
        students_response = supabase.table('student_profiles')\
            .select('*')\
            .in_('id', student_ids)\
            .eq('school_id', school_id)\
            .eq('status', 'active')\
            .execute()
            
        return students_response.data

    @staticmethod
    def get_teacher_dashboard_stats(teacher_id: str, school_id: str) -> Dict[str, Any]:
        supabase = get_supabase_client()
        students = TeacherAccessService.get_assigned_students(teacher_id, school_id)
        total_students = len(students)
        
        if total_students == 0:
            return {
                "totalStudents": 0,
                "highRiskStudents": 0,
                "assessmentsCompleted": 0,
                "pendingReviews": 0
            }
            
        student_ids = [s['id'] for s in students]
        
        # High Risk Students (latest report contains Moderate or High risk)
        reports = supabase.table('student_reports')\
            .select('student_id, risk_analysis')\
            .in_('student_id', student_ids)\
            .order('created_at', desc=True)\
            .execute()
            
        def extract_overall_risk(analysis):
            if not analysis: return 'Low'
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels: return 'Severe'
            if 'High' in levels: return 'High'
            if 'Moderate' in levels: return 'Moderate'
            return 'Low'

        # Get latest report per student
        latest_reports = {}
        for r in reports.data:
            sid = r['student_id']
            if sid not in latest_reports:
                latest_reports[sid] = extract_overall_risk(r.get('risk_analysis', {}))
                
        high_risk_count = sum(1 for risk in latest_reports.values() if risk in ['Moderate', 'High', 'Severe'])
        
        # Assessments Completed
        assessments = supabase.table('assessment_progress')\
            .select('id, status')\
            .in_('student_id', student_ids)\
            .execute()
            
        completed_count = sum(1 for a in assessments.data if a.get('status') == 'completed')
        
        # Pending Reviews (In this system, maybe completed but not reviewed, or pending_review status)
        # Assuming status = 'pending_review' or similar. We'll use a placeholder logic or if 'needs_review' flag exists
        pending_count = sum(1 for a in assessments.data if a.get('status') == 'pending_review')
        
        return {
            "totalStudents": total_students,
            "highRiskStudents": high_risk_count,
            "assessmentsCompleted": completed_count,
            "pendingReviews": pending_count
        }

    @staticmethod
    def get_teacher_risk_distribution(teacher_id: str, school_id: str) -> Dict[str, int]:
        supabase = get_supabase_client()
        students = TeacherAccessService.get_assigned_students(teacher_id, school_id)
        if not students:
            return {"Low Risk": 0, "Moderate Risk": 0, "High Risk": 0}
            
        student_ids = [s['id'] for s in students]
        
        reports = supabase.table('student_reports')\
            .select('student_id, risk_analysis')\
            .in_('student_id', student_ids)\
            .order('created_at', desc=True)\
            .execute()
            
        def extract_overall_risk(analysis):
            if not analysis: return 'Low'
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels: return 'Severe'
            if 'High' in levels: return 'High'
            if 'Moderate' in levels: return 'Moderate'
            return 'Low'

        latest_reports = {}
        for r in reports.data:
            sid = r['student_id']
            if sid not in latest_reports:
                latest_reports[sid] = extract_overall_risk(r.get('risk_analysis', {}))
                
        dist = {"Low Risk": 0, "Moderate Risk": 0, "High Risk": 0}
        for risk in latest_reports.values():
            if risk == 'Low':
                dist["Low Risk"] += 1
            elif risk == 'Moderate':
                dist["Moderate Risk"] += 1
            elif risk in ['High', 'Severe']:
                dist["High Risk"] += 1
                
        return dist

    @staticmethod
    def get_recent_assessments(teacher_id: str, school_id: str) -> List[Dict[str, Any]]:
        supabase = get_supabase_client()
        students = TeacherAccessService.get_assigned_students(teacher_id, school_id)
        if not students:
            return []
            
        student_ids = [s['id'] for s in students]
        student_map = {s['id']: s for s in students}
        
        assessments = supabase.table('assessment_results')\
            .select('*')\
            .in_('student_id', student_ids)\
            .order('created_at', desc=True)\
            .limit(10)\
            .execute()
            
        result = []
        for a in assessments.data:
            a['student'] = student_map.get(a['student_id'], {})
            result.append(a)
            
        return result

    @staticmethod
    def get_teacher_alerts(teacher_id: str, school_id: str) -> List[Dict[str, Any]]:
        supabase = get_supabase_client()
        students = TeacherAccessService.get_assigned_students(teacher_id, school_id)
        alerts = []
        
        if not students:
            return alerts
            
        student_ids = [s['id'] for s in students]
        student_map = {s['id']: s for s in students}
        
        # High Risk Students
        reports = supabase.table('student_reports')\
            .select('student_id, risk_analysis, created_at')\
            .in_('student_id', student_ids)\
            .order('created_at', desc=True)\
            .execute()
            
        def extract_overall_risk(analysis):
            if not analysis: return 'Low'
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels: return 'Severe'
            if 'High' in levels: return 'High'
            if 'Moderate' in levels: return 'Moderate'
            return 'Low'

        latest_reports = {}
        for r in reports.data:
            sid = r['student_id']
            if sid not in latest_reports:
                r['risk_level'] = extract_overall_risk(r.get('risk_analysis', {}))
                latest_reports[sid] = r
                
        for sid, rep in latest_reports.items():
            if rep.get('risk_level') in ['High', 'Severe']:
                student_name = student_map[sid].get('student_name', 'Unknown')
                alerts.append({
                    "id": f"hr_{sid}",
                    "type": "high_risk",
                    "title": "High Risk Student",
                    "message": f"{student_name} has been identified as high risk.",
                    "date": rep.get('created_at')
                })
        
        # Inactivity (No activity for 7 days)
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        assessments = supabase.table('assessment_results')\
            .select('student_id, created_at')\
            .in_('student_id', student_ids)\
            .order('created_at', desc=True)\
            .execute()
            
        latest_activity = {}
        for a in assessments.data:
            sid = a['student_id']
            if sid not in latest_activity:
                latest_activity[sid] = a['created_at']
                
        for sid in student_ids:
            last_act = latest_activity.get(sid)
            if not last_act or last_act < seven_days_ago:
                student_name = student_map[sid].get('student_name', 'Unknown')
                alerts.append({
                    "id": f"inact_{sid}",
                    "type": "inactivity",
                    "title": "No Activity",
                    "message": f"{student_name} has not completed any assessments in the last 7 days.",
                    "date": datetime.utcnow().isoformat()
                })
                
        # TODO: Add more specific alerts (Assessment Overdue, Learning Path Stalled, Readiness Dropped, Intervention Not Started, New Report)
        
        alerts.sort(key=lambda x: x['date'], reverse=True)
        return alerts[:10]

    @staticmethod
    def get_teacher_analytics(teacher_id: str, school_id: str) -> Dict[str, Any]:
        supabase = get_supabase_client()
        students = TeacherAccessService.get_assigned_students(teacher_id, school_id)
        if not students:
            return {
                "goalsMet": "Insufficient Data",
                "engagement": "Insufficient Data",
                "weeklyImprovement": "Insufficient Data"
            }
            
        student_ids = [s['id'] for s in students]
        
        # Goals Met = Completed Activities / Assigned Activities
        # We look at student_activity_attempts
        activities = supabase.table('student_activity_attempts')\
            .select('completed')\
            .in_('student_id', student_ids)\
            .execute()
            
        if not activities.data:
            goals_met = "Insufficient Data"
        else:
            total_act = len(activities.data)
            completed_act = sum(1 for a in activities.data if a.get('completed') is True)
            goals_met = f"{int((completed_act / total_act) * 100)}%"
            
        # Engagement = Active Students (Last 7 Days) / Total Assigned Students
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        recent_assessments = supabase.table('assessment_results')\
            .select('student_id')\
            .in_('student_id', student_ids)\
            .gte('created_at', seven_days_ago)\
            .execute()
            
        active_student_ids = set(a['student_id'] for a in recent_assessments.data)
        if len(students) > 0:
            engagement = f"{int((len(active_student_ids) / len(students)) * 100)}%"
        else:
            engagement = "0%"
            
        # Weekly Improvement = Current Average Readiness - Previous Average Readiness
        # Fetch readiness scores
        reports = supabase.table('student_reports')\
            .select('student_id, readiness_score, created_at')\
            .in_('student_id', student_ids)\
            .order('created_at', desc=True)\
            .execute()
            
        # Group by student
        student_scores = {}
        for r in reports.data:
            sid = r['student_id']
            if sid not in student_scores:
                student_scores[sid] = []
            student_scores[sid].append(r)
            
        improvements = []
        for sid, rep_list in student_scores.items():
            if len(rep_list) >= 2:
                current_score = rep_list[0].get('readiness_score', 0)
                previous_score = rep_list[1].get('readiness_score', 0)
                if current_score is not None and previous_score is not None:
                    improvements.append(current_score - previous_score)
                    
        if improvements:
            avg_imp = sum(improvements) / len(improvements)
            weekly_improvement = f"{avg_imp:+.1f}%"
        else:
            weekly_improvement = "Insufficient Data"
            
        return {
            "goalsMet": goals_met,
            "engagement": engagement,
            "weeklyImprovement": weekly_improvement
        }

    @staticmethod
    def get_student_performance_overview(teacher_id: str, school_id: str) -> Dict[str, Any]:
        supabase = get_supabase_client()
        students = TeacherAccessService.get_assigned_students(teacher_id, school_id)
        if not students:
            return {
                "reading": 0,
                "attention": 0,
                "typing": 0,
                "learningBehaviour": 0,
                "comprehension": 0
            }
            
        student_ids = [s['id'] for s in students]
        
        # We need the latest completed assessment for each student within each category
        assessments = supabase.table('assessment_results')\
            .select('student_id, assessment_type, result_data')\
            .in_('student_id', student_ids)\
            .order('created_at', desc=True)\
            .execute()
            
        # Group by student and type to get the latest score
        # Since it's ordered by created_at DESC, the first one encountered for a student+type is the latest
        latest_scores = {
            'reading': {},
            'attention': {},
            'typing': {},
            'learning_behaviour': {},
            'comprehension': {}
        }
        
        for record in assessments.data:
            sid = record['student_id']
            # Ensure type maps to our keys. The database might use 'learning_behaviour' and others.
            # Assuming standard types: reading, attention, typing, learning_behaviour, cpt, comprehension
            atype = record.get('assessment_type')
            if atype in latest_scores:
                if sid not in latest_scores[atype]:
                    score = record.get('result_data', {}).get('overallScore', 0)
                    latest_scores[atype][sid] = score
                    
        def calc_avg(category_dict):
            if not category_dict:
                return 0
            return round(sum(category_dict.values()) / len(students)) # "Sum of Latest Student Scores ÷ Number of Assigned Students"
            
        return {
            "reading": calc_avg(latest_scores['reading']),
            "attention": calc_avg(latest_scores['attention']),
            "typing": calc_avg(latest_scores['typing']),
            "learningBehaviour": calc_avg(latest_scores['learning_behaviour']),
            "comprehension": calc_avg(latest_scores['comprehension'])
        }
