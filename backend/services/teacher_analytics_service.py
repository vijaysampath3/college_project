from typing import Dict, Any, List
from datetime import datetime, timedelta
from collections import defaultdict
from services.supabase_client import get_supabase_client
from fastapi import HTTPException
import statistics

class TeacherAnalyticsService:
    @staticmethod
    def _get_teacher_context(user_id: str) -> Dict[str, Any]:
        supabase = get_supabase_client()
        response = supabase.table('teacher_profiles').select('*').eq('user_id', user_id).execute()
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized as a teacher.")
        return response.data[0]

    @staticmethod
    def _get_assigned_students(teacher_id: str) -> List[str]:
        supabase = get_supabase_client()
        assignments = supabase.table('teacher_student_assignments').select('student_id').eq('teacher_id', teacher_id).execute()
        return [a['student_id'] for a in assignments.data]

    @staticmethod
    def get_overview_metrics(user_id: str) -> Dict[str, Any]:
        teacher = TeacherAnalyticsService._get_teacher_context(user_id)
        student_uuids = TeacherAnalyticsService._get_assigned_students(teacher['id'])
        if not student_uuids:
            return {"empty": True}
            
        supabase = get_supabase_client()
        
        # Readiness
        reports = supabase.table('student_reports').select('student_id, readiness_score').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        latest_reports = {}
        for r in reports.data:
            if r['student_id'] not in latest_reports:
                latest_reports[r['student_id']] = r['readiness_score']
                
        avg_readiness = sum(latest_reports.values()) / len(latest_reports) if latest_reports else 0
        
        # Assessment Score
        assessments = supabase.table('assessment_results').select('student_id, result_data').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        latest_ass = {}
        for a in assessments.data:
            k = f"{a['student_id']}_{a.get('assessment_type')}"
            if k not in latest_ass:
                latest_ass[k] = a.get('result_data', {}).get('overallScore', 0)
        
        avg_assessment = sum(latest_ass.values()) / len(latest_ass) if latest_ass else 0
        
        # Activity Completion
        acts = supabase.table('teacher_assigned_activities').select('status').in_('student_id', student_uuids).execute()
        total_acts = len(acts.data)
        comp_acts = len([a for a in acts.data if a['status'] == 'completed'])
        act_rate = (comp_acts / total_acts * 100) if total_acts > 0 else 0
        
        # Assessment Completion
        t_ass = supabase.table('teacher_assigned_assessments').select('status').in_('student_id', student_uuids).execute()
        total_t_ass = len(t_ass.data)
        comp_t_ass = len([a for a in t_ass.data if a['status'] == 'completed'])
        ass_rate = (comp_t_ass / total_t_ass * 100) if total_t_ass > 0 else 0
        
        # Intervention Success Rate
        success_data = TeacherAnalyticsService.get_intervention_effectiveness(user_id)
        total_interventions = 0
        successful = 0
        if not success_data.get('empty'):
            for act in success_data.get('activities', []):
                total_interventions += act['assigned']
                successful += act['improved']
        intervention_success = (successful / total_interventions * 100) if total_interventions > 0 else 0
        
        # Active Paths
        paths = supabase.table('student_learning_paths').select('id').in_('student_id', student_uuids).eq('status', 'active').execute()
        active_paths = len(paths.data)
        
        return {
            "empty": False,
            "avgReadiness": round(avg_readiness),
            "avgAssessment": round(avg_assessment),
            "activityCompletion": round(act_rate),
            "assessmentCompletion": round(ass_rate),
            "interventionSuccess": round(intervention_success),
            "activePaths": active_paths
        }

    @staticmethod
    def get_risk_analytics(user_id: str) -> Dict[str, Any]:
        teacher = TeacherAnalyticsService._get_teacher_context(user_id)
        student_uuids = TeacherAnalyticsService._get_assigned_students(teacher['id'])
        if not student_uuids:
            return {"empty": True}
            
        supabase = get_supabase_client()
        reports = supabase.table('student_reports').select('student_id, risk_analysis, created_at').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        
        if not reports.data:
            return {"empty": True}

        # Current Risk Distribution (latest report per student)
        latest_reports = {}
        for r in reports.data:
            if r['student_id'] not in latest_reports:
                latest_reports[r['student_id']] = r
                
        risk_counts = {"Low": 0, "Moderate": 0, "High": 0}
        total_students = len(latest_reports)
        
        for r in latest_reports.values():
            analysis = r.get('risk_analysis') or {}
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels or 'High' in levels:
                risk_counts['High'] += 1
            elif 'Moderate' in levels:
                risk_counts['Moderate'] += 1
            else:
                risk_counts['Low'] += 1
                
        # 30-Day Trend
        now = datetime.utcnow()
        weeks = []
        for i in range(4):
            week_end = now - timedelta(days=i*7)
            week_start = week_end - timedelta(days=7)
            
            # get the latest report for each student within this timeframe
            week_reports = {}
            for r in reports.data:
                dt = datetime.fromisoformat(r['created_at'].replace('Z', '+00:00'))
                dt = dt.replace(tzinfo=None)
                if dt <= week_end:
                    if r['student_id'] not in week_reports:
                        week_reports[r['student_id']] = r
            
            week_counts = {"Low": 0, "Moderate": 0, "High": 0}
            for r in week_reports.values():
                analysis = r.get('risk_analysis') or {}
                levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
                if 'Severe' in levels or 'High' in levels:
                    week_counts['High'] += 1
                elif 'Moderate' in levels:
                    week_counts['Moderate'] += 1
                else:
                    week_counts['Low'] += 1
                    
            weeks.append({
                "week": f"Week {4-i}",
                "Low": week_counts['Low'],
                "Moderate": week_counts['Moderate'],
                "High": week_counts['High']
            })
            
        weeks.reverse()

        return {
            "empty": False,
            "counts": risk_counts,
            "distribution": {
                "Low": round((risk_counts['Low']/total_students)*100) if total_students else 0,
                "Moderate": round((risk_counts['Moderate']/total_students)*100) if total_students else 0,
                "High": round((risk_counts['High']/total_students)*100) if total_students else 0
            },
            "trend": weeks
        }

    @staticmethod
    def get_assessment_analytics(user_id: str) -> Dict[str, Any]:
        teacher = TeacherAnalyticsService._get_teacher_context(user_id)
        student_uuids = TeacherAnalyticsService._get_assigned_students(teacher['id'])
        if not student_uuids:
            return {"empty": True}
            
        supabase = get_supabase_client()
        results = supabase.table('assessment_results').select('student_id, assessment_type, result_data, created_at').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        
        types = ['reading', 'attention', 'typing', 'learning_behaviour', 'cpt']
        analytics = []
        
        for t in types:
            type_results = [r for r in results.data if r['assessment_type'] == t]
            if not type_results:
                analytics.append({"type": t, "hasData": False})
                continue
                
            # Latest vs Previous for improvement
            student_history = defaultdict(list)
            for r in type_results:
                student_history[r['student_id']].append(r.get('result_data', {}).get('overallScore', 0))
                
            scores = []
            improvements = []
            for sid, h in student_history.items():
                if len(h) > 0: scores.append(h[0]) # latest
                if len(h) > 1:
                    imp = h[0] - h[1]
                    improvements.append(imp)
                    
            avg_score = sum(scores) / len(scores) if scores else 0
            avg_imp = sum(improvements) / len(improvements) if improvements else 0
            comp_rate = (len(scores) / len(student_uuids) * 100)
            
            analytics.append({
                "type": t,
                "hasData": True,
                "avgScore": round(avg_score),
                "completionRate": round(comp_rate),
                "improvement": round(avg_imp)
            })
            
        return {"empty": False, "assessments": analytics}

    @staticmethod
    def get_student_improvements(user_id: str) -> Dict[str, Any]:
        teacher = TeacherAnalyticsService._get_teacher_context(user_id)
        student_uuids = TeacherAnalyticsService._get_assigned_students(teacher['id'])
        if not student_uuids:
            return {"empty": True}
            
        supabase = get_supabase_client()
        reports = supabase.table('student_reports').select('student_id, readiness_score').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        
        profiles = supabase.table('student_profiles').select('id, student_name').in_('id', student_uuids).execute()
        name_map = {p['id']: p['student_name'] for p in profiles.data}
        
        history = defaultdict(list)
        for r in reports.data:
            history[r['student_id']].append({
                "score": r['readiness_score'],
                "name": name_map.get(r['student_id'], 'Unknown')
            })
            
        improved = []
        declining = []
        
        for sid, h in history.items():
            if len(h) > 1:
                latest = h[0]['score']
                prev = h[1]['score']
                change = latest - prev
                name = h[0]['name']
                
                item = {
                    "student_id": sid,
                    "student_name": name,
                    "previous_score": prev,
                    "current_score": latest,
                    "change": change
                }
                
                if change > 0:
                    improved.append(item)
                elif change < 0:
                    declining.append(item)
                    
        improved.sort(key=lambda x: x['change'], reverse=True)
        declining.sort(key=lambda x: x['change']) # most negative first
        
        return {
            "empty": len(improved) == 0 and len(declining) == 0,
            "improved": improved[:5],
            "declining": declining[:5]
        }

    @staticmethod
    def get_learning_path_analytics(user_id: str) -> Dict[str, Any]:
        teacher = TeacherAnalyticsService._get_teacher_context(user_id)
        student_uuids = TeacherAnalyticsService._get_assigned_students(teacher['id'])
        if not student_uuids:
            return {"empty": True}
            
        supabase = get_supabase_client()
        paths = supabase.table('student_learning_paths').select('*').in_('student_id', student_uuids).execute()
        
        if not paths.data:
            return {"empty": True}
            
        active = 0
        completed = 0
        comps = []
        week_dist = {1: 0, 2: 0, 3: 0, 4: 0}
        
        for p in paths.data:
            if p['status'] == 'active': active += 1
            if p['status'] == 'completed': completed += 1
            comps.append(p['completion_percentage'])
            w = p['current_week']
            if w in week_dist: week_dist[w] += 1
            
        avg_comp = sum(comps) / len(comps) if comps else 0
        
        total_w = sum(week_dist.values())
        week_rates = {f"Week {k}": round((v/total_w)*100) if total_w else 0 for k, v in week_dist.items()}
        
        return {
            "empty": False,
            "activePaths": active,
            "completedPaths": completed,
            "avgCompletion": round(avg_comp),
            "weekDistribution": week_rates
        }

    @staticmethod
    def get_intervention_effectiveness(user_id: str) -> Dict[str, Any]:
        teacher = TeacherAnalyticsService._get_teacher_context(user_id)
        student_uuids = TeacherAnalyticsService._get_assigned_students(teacher['id'])
        if not student_uuids:
            return {"empty": True}
            
        supabase = get_supabase_client()
        acts = supabase.table('teacher_assigned_activities').select('*').in_('student_id', student_uuids).execute()
        results = supabase.table('assessment_results').select('student_id, result_data, created_at').in_('student_id', student_uuids).order('created_at', desc=True).execute()
        
        if not acts.data:
            return {"empty": True}
            
        # Group acts by title
        activity_stats = defaultdict(lambda: {"assigned": 0, "completed": 0, "improved": 0})
        
        for a in acts.data:
            t = a['activity_title']
            activity_stats[t]['assigned'] += 1
            if a['status'] == 'completed':
                activity_stats[t]['completed'] += 1
                
                # Check for improvement (simplified heuristic for Phase T6)
                sid = a['student_id']
                comp_date = a.get('completed_at') or a['updated_at']
                comp_dt = datetime.fromisoformat(comp_date.replace('Z', '+00:00')).replace(tzinfo=None)
                
                s_results = [r for r in results.data if r['student_id'] == sid]
                # Find score before comp_dt and score after
                before_scores = [r.get('result_data', {}).get('overallScore', 0) for r in s_results if datetime.fromisoformat(r['created_at'].replace('Z', '+00:00')).replace(tzinfo=None) <= comp_dt]
                after_scores = [r.get('result_data', {}).get('overallScore', 0) for r in s_results if datetime.fromisoformat(r['created_at'].replace('Z', '+00:00')).replace(tzinfo=None) > comp_dt]
                
                if before_scores and after_scores:
                    if after_scores[0] > before_scores[0]:
                        activity_stats[t]['improved'] += 1
        
        final_stats = []
        for t, stats in activity_stats.items():
            sr = round((stats['improved'] / stats['completed'] * 100)) if stats['completed'] > 0 else 0
            final_stats.append({
                "activity_name": t,
                "assigned": stats['assigned'],
                "completed": stats['completed'],
                "improved": stats['improved'],
                "success_rate": sr
            })
            
        final_stats.sort(key=lambda x: x['success_rate'], reverse=True)
        return {"empty": False, "activities": final_stats}

    @staticmethod
    def get_parent_engagement_analytics(user_id: str) -> Dict[str, Any]:
        teacher = TeacherAnalyticsService._get_teacher_context(user_id)
        student_uuids = TeacherAnalyticsService._get_assigned_students(teacher['id'])
        if not student_uuids:
            return {"empty": True}
            
        supabase = get_supabase_client()
        rels = supabase.table('student_parent_relationships').select('student_id').in_('student_id', student_uuids).execute()
        
        linked_students = set(r['student_id'] for r in rels.data)
        unlinked_students = set(student_uuids) - linked_students
        
        # Per definitions:
        # Active Parent = account exists + linked (for now all linked are active)
        active_parents = len(linked_students) 
        inactive_parents = 0 # No login tracking yet
        
        return {
            "empty": False,
            "linkedParents": active_parents,
            "activeParents": active_parents,
            "inactiveParents": inactive_parents,
            "studentsWithoutLinks": len(unlinked_students)
        }
