from typing import Dict, Any, List, Optional
from datetime import datetime
from services.supabase_client import get_supabase_client
from fastapi import HTTPException

class ParentAccessService:
    @staticmethod
    def get_current_parent(user_id: str) -> Dict[str, Any]:
        """Resolves the logged-in user to a parent profile."""
        supabase = get_supabase_client()
        response = supabase.table('parent_profiles').select('*').eq('user_id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized as a parent.")
            
        parent = response.data[0]
        
        # Get linked student count
        count_res = supabase.table('student_parent_relationships').select('student_id', count='exact').eq('parent_id', parent['id']).execute()
        linked_student_count = count_res.count if count_res.count is not None else 0
        
        return {
            "id": parent["id"],
            "parentId": parent.get("parent_id"),
            "parentName": parent.get("parent_name"),
            "email": parent.get("email"),
            "phone": parent.get("phone", ""),
            "linkedStudentCount": linked_student_count
        }

    @staticmethod
    def get_linked_students(parent_id: str) -> List[Dict[str, Any]]:
        """Fetches students linked to the parent."""
        supabase = get_supabase_client()
        
        relationships = supabase.table('student_parent_relationships')\
            .select('student_id')\
            .eq('parent_id', parent_id)\
            .execute()
            
        if not relationships.data:
            return []
            
        student_ids = [r['student_id'] for r in relationships.data]
        
        # We need Student Profile, Teacher Name, Teacher Department, School Name
        # Assuming student_profiles joins with schools and teacher_student_assignments
        students_response = supabase.table('student_profiles')\
            .select('*, schools(school_name)')\
            .in_('id', student_ids)\
            .eq('status', 'active')\
            .execute()
            
        students_data = students_response.data
        
        # Get assigned teachers for these students
        assignments = supabase.table('teacher_student_assignments')\
            .select('student_id, teacher_id')\
            .in_('student_id', student_ids)\
            .eq('status', 'active')\
            .execute()
            
        teacher_ids = [a['teacher_id'] for a in assignments.data]
        
        teacher_map = {}
        if teacher_ids:
            teachers_res = supabase.table('teacher_profiles')\
                .select('teacher_id, teacher_name, department')\
                .in_('teacher_id', teacher_ids)\
                .execute()
            for t in teachers_res.data:
                teacher_map[t['teacher_id']] = t
                
        # Map teacher to student
        student_teacher_map = {}
        for a in assignments.data:
            student_teacher_map[a['student_id']] = teacher_map.get(a['teacher_id'], {})
            
        result = []
        for student in students_data:
            sid = student['id']
            t_info = student_teacher_map.get(sid, {})
            result.append({
                "id": sid,
                "studentId": student.get('student_id'),
                "studentName": student.get('student_name'),
                "grade": student.get('grade'),
                "schoolName": student.get('schools', {}).get('school_name', 'Unknown School'),
                "assignedTeacherName": t_info.get('teacher_name', 'Unassigned'),
                "teacherDepartment": t_info.get('department', 'Unassigned')
            })
            
        return result

    @staticmethod
    def get_parent_dashboard_summary(parent_id: str, student_id: str) -> Dict[str, Any]:
        """Fetches dashboard summary for a specific student, ensuring the parent has access."""
        supabase = get_supabase_client()
        
        # 1. Validate Access
        rel = supabase.table('student_parent_relationships')\
            .select('id')\
            .eq('parent_id', parent_id)\
            .eq('student_id', student_id)\
            .execute()
            
        if not rel.data:
            raise HTTPException(status_code=403, detail="Not authorized to access this student's data.")
            
        # Initialize default response
        summary = {
            "readingScore": 0,
            "attentionScore": 0,
            "learningScore": 0,
            "latestAssessmentDate": "No Data",
            "riskStatus": "Unknown",
            "progressSummary": "No data available",
            "assignedActivitiesCount": 0,
            "pendingAssessmentsCount": 0,
            "learningPathCompletion": 0,
            "latestRecommendation": "None",
            "progressHistory": []
        }
        
        # 2. Get latest scores from assessment_results
        assessments = supabase.table('assessment_results')\
            .select('assessment_type, result_data, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .execute()
            
        latest_scores = {}
        if assessments.data:
            summary["latestAssessmentDate"] = assessments.data[0]['created_at'][:10]
            for record in assessments.data:
                atype = record.get('assessment_type')
                if atype not in latest_scores:
                    latest_scores[atype] = record.get('result_data', {}).get('overallScore', 0)
                    
            summary["readingScore"] = latest_scores.get('reading', 0)
            summary["attentionScore"] = latest_scores.get('attention', 0)
            summary["learningScore"] = latest_scores.get('learning_behaviour', 0)

            # Group assessments by month for progress history
            # format: { 'Jan': { 'reading': 60, 'attention': 65, 'behaviour': 70 } }
            monthly_data = {}
            for record in assessments.data:
                try:
                    date_obj = datetime.fromisoformat(record['created_at'].replace('Z', '+00:00'))
                    month_str = date_obj.strftime('%b') # 'Jan', 'Feb'
                except Exception:
                    continue
                
                if month_str not in monthly_data:
                    monthly_data[month_str] = {"month": month_str, "reading": 0, "attention": 0, "behaviour": 0}
                    
                atype = record.get('assessment_type')
                score = record.get('result_data', {}).get('overallScore', 0)
                
                if atype == 'reading' and monthly_data[month_str]["reading"] == 0:
                    monthly_data[month_str]["reading"] = score
                elif atype == 'attention' and monthly_data[month_str]["attention"] == 0:
                    monthly_data[month_str]["attention"] = score
                elif atype == 'learning_behaviour' and monthly_data[month_str]["behaviour"] == 0:
                    monthly_data[month_str]["behaviour"] = score
                    
            # Reverse to be chronological
            summary["progressHistory"] = list(reversed(list(monthly_data.values())))
            
        # 3. Get Risk Status from student_reports
        reports = supabase.table('student_reports')\
            .select('risk_analysis')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
            
        if reports.data and reports.data[0].get('risk_analysis'):
            analysis = reports.data[0]['risk_analysis']
            levels = [v.get('level', 'Low') for v in analysis.values() if isinstance(v, dict)]
            if 'Severe' in levels: summary["riskStatus"] = 'Severe'
            elif 'High' in levels: summary["riskStatus"] = 'High'
            elif 'Moderate' in levels: summary["riskStatus"] = 'Moderate'
            else: summary["riskStatus"] = 'Low'
            
            # Simple progress summary logic based on risk
            if summary["riskStatus"] in ['Low', 'Moderate']:
                summary["progressSummary"] = "Consistent progress"
            else:
                summary["progressSummary"] = "Needs more attention"
                
        # 4. Teacher Assigned Activities & Pending Assessments
        try:
            activities = supabase.table('teacher_assigned_activities')\
                .select('id', count='exact')\
                .eq('student_id', student_id)\
                .eq('status', 'assigned')\
                .execute()
            summary["assignedActivitiesCount"] = activities.count if activities.count is not None else 0
        except Exception:
            pass
        
        try:
            pending_ass = supabase.table('teacher_assigned_assessments')\
                .select('id', count='exact')\
                .eq('student_id', student_id)\
                .eq('status', 'pending')\
                .execute()
            summary["pendingAssessmentsCount"] = pending_ass.count if pending_ass.count is not None else 0
        except Exception:
            pass
        
        # 5. Learning Path Completion
        try:
            lpath = supabase.table('learning_path_progress')\
                .select('completion_percentage')\
                .eq('student_id', student_id)\
                .order('updated_at', desc=True)\
                .limit(1)\
                .execute()
                
            if lpath.data:
                summary["learningPathCompletion"] = lpath.data[0].get('completion_percentage', 0)
        except Exception:
            pass
            
        # 6. Latest Recommendation
        # from student_recommendations if exists
        try:
            recs = supabase.table('student_recommendations')\
                .select('recommendation_text')\
                .eq('student_id', student_id)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
            if recs.data:
                summary["latestRecommendation"] = recs.data[0].get('recommendation_text')
        except Exception:
            pass # Table might not exist or be accessible
            
        return summary
