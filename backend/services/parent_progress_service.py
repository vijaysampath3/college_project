from typing import Dict, Any, List, Optional
from datetime import datetime
from collections import defaultdict
from services.supabase_client import get_supabase_client
from fastapi import HTTPException

class ParentProgressService:
    @staticmethod
    def _validate_access(parent_id: str, student_id: str):
        supabase = get_supabase_client()
        rel = supabase.table('student_parent_relationships')\
            .select('id')\
            .eq('parent_id', parent_id)\
            .eq('student_id', student_id)\
            .execute()
            
        if not rel.data:
            raise HTTPException(status_code=403, detail="Not authorized to access this student's data.")
        return supabase

    @staticmethod
    def get_student_progress_summary(parent_id: str, student_id: str) -> Dict[str, Any]:
        supabase = ParentProgressService._validate_access(parent_id, student_id)
        
        # 1. Get basic info
        student_data = supabase.table('student_profiles')\
            .select('student_name, grade, schools(school_name)')\
            .eq('id', student_id)\
            .execute()
            
        if not student_data.data:
            raise HTTPException(status_code=404, detail="Student not found.")
            
        s_info = student_data.data[0]
        
        # 2. Get assigned teacher
        assignment = supabase.table('teacher_student_assignments')\
            .select('teacher_profiles(teacher_name)')\
            .eq('student_id', student_id)\
            .eq('status', 'active')\
            .limit(1)\
            .execute()
            
        teacher_name = "Unassigned"
        if assignment.data and assignment.data[0].get('teacher_profiles'):
            teacher_name = assignment.data[0]['teacher_profiles'].get('teacher_name', 'Unassigned')
            
        # 3. Get Risk Status
        risk_status = "Unknown"
        reports = supabase.table('student_reports')\
            .select('risk_analysis')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
            
        if reports.data and reports.data[0].get('risk_analysis'):
            analysis = reports.data[0]['risk_analysis']
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels: risk_status = 'Severe'
            elif 'High' in levels: risk_status = 'High'
            elif 'Moderate' in levels: risk_status = 'Moderate'
            else: risk_status = 'Low'
            
        # 4. Overall Readiness Score & Trend
        overall_score = 0
        overall_trend = "Stable"
        assessments = supabase.table('assessment_results')\
            .select('result_data, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .execute()
            
        if assessments.data:
            # Simple overall score logic: average of latest assessments
            scores = [r.get('result_data', {}).get('overallScore', 0) for r in assessments.data[:5]]
            if scores:
                overall_score = round(sum(scores) / len(scores))
                
                if len(scores) >= 2:
                    if scores[0] > scores[1] + 5: overall_trend = "Improving"
                    elif scores[0] < scores[1] - 5: overall_trend = "Declining"
                    
        return {
            "studentName": s_info.get('student_name'),
            "grade": s_info.get('grade'),
            "schoolName": s_info.get('schools', {}).get('school_name', 'Unknown School') if s_info.get('schools') else 'Unknown School',
            "assignedTeacher": teacher_name,
            "riskStatus": risk_status,
            "overallScore": overall_score,
            "overallTrend": overall_trend
        }

    @staticmethod
    def get_assessment_history(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        supabase = ParentProgressService._validate_access(parent_id, student_id)
        
        assessments = supabase.table('assessment_results')\
            .select('assessment_type, result_data, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .execute()
            
        history = []
        # Group by type to calculate improvement
        last_scores = {}
        # We need to process from oldest to newest to calculate improvement accurately, but we want to return newest first
        # So we reverse, calculate, then reverse back
        reversed_data = list(reversed(assessments.data))
        
        for record in reversed_data:
            atype = record.get('assessment_type', 'Unknown')
            score = record.get('result_data', {}).get('overallScore', 0)
            date_str = record.get('created_at')[:10] if record.get('created_at') else 'Unknown'
            
            improvement = 0
            if atype in last_scores:
                improvement = score - last_scores[atype]
                
            last_scores[atype] = score
            
            history.append({
                "type": atype.replace('_', ' ').title(),
                "date": date_str,
                "score": score,
                "improvement": improvement
            })
            
        return list(reversed(history))

    @staticmethod
    def get_progress_trends(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        supabase = ParentProgressService._validate_access(parent_id, student_id)
        
        assessments = supabase.table('assessment_results')\
            .select('assessment_type, result_data, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=False)\
            .execute()
            
        trends = defaultdict(dict)
        categories = set()
        
        for record in assessments.data:
            try:
                date_obj = datetime.fromisoformat(record['created_at'].replace('Z', '+00:00'))
                month_str = date_obj.strftime('%b %Y')
            except Exception:
                continue
                
            atype = record.get('assessment_type', 'unknown').replace('_', ' ').title()
            score = record.get('result_data', {}).get('overallScore', 0)
            
            categories.add(atype)
            trends[month_str][atype] = score
            trends[month_str]['date'] = month_str
            
        # Ensure all categories have a value for each month (carry forward previous or use 0)
        result = []
        last_values = {c: 0 for c in categories}
        
        for month_str, data in trends.items():
            entry = {"date": month_str}
            for c in categories:
                if c in data:
                    last_values[c] = data[c]
                entry[c] = last_values[c]
            result.append(entry)
            
        return result

    @staticmethod
    def get_learning_path_progress(parent_id: str, student_id: str) -> Dict[str, Any]:
        supabase = ParentProgressService._validate_access(parent_id, student_id)
        
        try:
            path = supabase.table('student_learning_paths')\
                .select('*')\
                .eq('student_id', student_id)\
                .eq('status', 'active')\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
                
            if not path.data:
                return {
                    "currentPath": "No active path",
                    "completionPercentage": 0,
                    "currentWeek": 0,
                    "completedActivities": 0,
                    "remainingActivities": 0
                }
                
            path_data = path.data[0]
            path_id = path_data['id']
            
            items = supabase.table('learning_path_items')\
                .select('id', count='exact')\
                .eq('path_id', path_id)\
                .execute()
            total_items = items.count if items.count is not None else 0
            
            # Since there's no completed status directly on learning_path_items conceptually, 
            # we'll approximate using completion percentage or mock it based on total
            completion = path_data.get('completion_percentage', 0)
            completed_count = int(total_items * (completion / 100))
            
            return {
                "currentPath": path_data.get('path_name', 'Active Path'),
                "completionPercentage": completion,
                "currentWeek": path_data.get('current_week', 1),
                "completedActivities": completed_count,
                "remainingActivities": max(0, total_items - completed_count)
            }
        except Exception:
            return {
                "currentPath": "Not Available",
                "completionPercentage": 0,
                "currentWeek": 0,
                "completedActivities": 0,
                "remainingActivities": 0
            }

    @staticmethod
    def get_strength_areas(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        supabase = ParentProgressService._validate_access(parent_id, student_id)
        return ParentProgressService._analyze_areas(supabase, student_id, "strength")

    @staticmethod
    def get_improvement_areas(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        supabase = ParentProgressService._validate_access(parent_id, student_id)
        return ParentProgressService._analyze_areas(supabase, student_id, "improvement")
        
    @staticmethod
    def _analyze_areas(supabase, student_id: str, type: str) -> List[Dict[str, Any]]:
        assessments = supabase.table('assessment_results')\
            .select('assessment_type, result_data')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .limit(20)\
            .execute()
            
        category_scores = defaultdict(list)
        for r in assessments.data:
            atype = r.get('assessment_type', 'unknown').replace('_', ' ').title()
            score = r.get('result_data', {}).get('overallScore', 0)
            category_scores[atype].append(score)
            
        averages = []
        for cat, scores in category_scores.items():
            if scores:
                averages.append({"category": cat, "score": sum(scores)/len(scores)})
                
        averages.sort(key=lambda x: x['score'], reverse=True)
        
        if type == "strength":
            target = [a for a in averages if a['score'] >= 70][:3]
        else:
            target = [a for a in reversed(averages) if a['score'] < 70][:3]
            
        result = []
        for a in target:
            result.append({
                "category": a['category'],
                "score": round(a['score']),
                "description": f"Consistently showing {'strong' if type == 'strength' else 'lower'} performance in {a['category'].lower()}"
            })
            
        return result

    @staticmethod
    def get_achievement_timeline(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        supabase = ParentProgressService._validate_access(parent_id, student_id)
        
        timeline = []
        
        # 1. Completed Activities
        try:
            activities = supabase.table('teacher_assigned_activities')\
                .select('activity_title, completed_at, status')\
                .eq('student_id', student_id)\
                .eq('status', 'completed')\
                .execute()
            for a in activities.data:
                if a.get('completed_at'):
                    timeline.append({
                        "id": f"act_{a['activity_title']}_{a['completed_at']}",
                        "title": "Activity Completed",
                        "description": a['activity_title'],
                        "date": a['completed_at'],
                        "type": "activity"
                    })
        except Exception:
            pass
            
        # 2. Completed Assessments
        try:
            assessments = supabase.table('teacher_assigned_assessments')\
                .select('assessment_title, completed_at, status')\
                .eq('student_id', student_id)\
                .eq('status', 'completed')\
                .execute()
            for a in assessments.data:
                if a.get('completed_at'):
                    timeline.append({
                        "id": f"ass_{a['assessment_title']}_{a['completed_at']}",
                        "title": "Assessment Completed",
                        "description": a['assessment_title'],
                        "date": a['completed_at'],
                        "type": "assessment"
                    })
        except Exception:
            pass
            
        # 3. Recommendations
        try:
            recs = supabase.table('student_recommendations')\
                .select('id, recommendation_text, created_at')\
                .eq('student_id', student_id)\
                .execute()
            for r in recs.data:
                if r.get('created_at'):
                    timeline.append({
                        "id": f"rec_{r['id']}",
                        "title": "New Recommendation",
                        "description": r['recommendation_text'],
                        "date": r['created_at'],
                        "type": "recommendation"
                    })
        except Exception:
            pass
            
        # Sort timeline by date descending
        timeline.sort(key=lambda x: x['date'], reverse=True)
        
        # Format dates
        for t in timeline:
            t['date'] = t['date'][:10]
            
        return timeline[:20] # Return top 20 events
