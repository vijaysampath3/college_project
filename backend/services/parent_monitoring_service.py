from typing import Dict, Any, List
from datetime import datetime
from services.supabase_client import get_supabase_client
from fastapi import HTTPException
from collections import defaultdict

class ParentMonitoringService:
    @staticmethod
    def _validate_access(parent_id: str, student_id: str) -> bool:
        supabase = get_supabase_client()
        response = supabase.table('student_parent_relationships')\
            .select('*')\
            .eq('parent_id', parent_id)\
            .eq('student_id', student_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized to access this student's data.")
        return True

    @staticmethod
    def get_monitoring_overview(parent_id: str, student_id: str) -> Dict[str, Any]:
        ParentMonitoringService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        # Get latest report
        report_res = supabase.table('student_reports')\
            .select('readiness_score, risk_analysis, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
            
        # Get teacher info via parent relationships or directly from student if available
        # We can just get the teacher who linked the parent or the one assigned to the student
        teacher_res = supabase.table('teacher_student_assignments')\
            .select('teacher_profiles(teacher_name)')\
            .eq('student_id', student_id)\
            .limit(1)\
            .execute()
            
        teacher_name = "Not Assigned"
        if teacher_res.data and teacher_res.data[0].get('teacher_profiles'):
            teacher_name = teacher_res.data[0]['teacher_profiles'].get('teacher_name', "Not Assigned")
            
        if not report_res.data:
            return {
                "riskStatus": "No Data",
                "readinessScore": 0,
                "overallTrend": "Stable",
                "lastAssessmentDate": None,
                "assignedTeacher": teacher_name
            }
            
        report = report_res.data[0]
        risk_data = report.get('risk_analysis', {})
        risk_level = risk_data.get('risk_level', 'Unknown')
        
        if risk_level == 'low':
            risk_status = "Low Risk"
        elif risk_level == 'moderate':
            risk_status = "Moderate Risk"
        elif risk_level == 'high':
            risk_status = "High Risk"
        else:
            risk_status = "Unknown"
            
        return {
            "riskStatus": risk_status,
            "readinessScore": report.get('readiness_score', 0),
            "overallTrend": report.get('overall_trend', 'Stable'),
            "lastAssessmentDate": report.get('created_at'),
            "assignedTeacher": teacher_name
        }

    @staticmethod
    def get_risk_analysis(parent_id: str, student_id: str) -> Dict[str, Any]:
        ParentMonitoringService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        report_res = supabase.table('student_reports')\
            .select('risk_analysis')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
            
        if not report_res.data or not report_res.data[0].get('risk_analysis'):
            return {
                "riskCategory": "None",
                "riskLevel": "Low Risk",
                "riskExplanation": "No significant risks detected.",
                "confidence": "N/A"
            }
            
        risk_data = report_res.data[0]['risk_analysis']
        risk_level = risk_data.get('risk_level', 'low')
        category = risk_data.get('category', 'None')
        
        level_str = "Low Risk"
        if risk_level == 'moderate':
            level_str = "Moderate Risk"
        elif risk_level == 'high':
            level_str = "High Risk"
            
        # Parent friendly explanation instead of raw data
        explanation = "Performance is meeting expectations."
        if level_str == "High Risk":
            if "attention" in category.lower():
                explanation = "Attention Support Recommended. Focus and engagement may need additional support at home."
            elif "reading" in category.lower():
                explanation = "Reading Support Recommended. Additional reading practice at home is highly encouraged."
            elif "typing" in category.lower():
                explanation = "Typing Support Recommended. Keyboard familiarity exercises would be beneficial."
            else:
                explanation = "Academic Support Recommended. Consistent practice and monitoring is advised."
        elif level_str == "Moderate Risk":
            if "attention" in category.lower():
                explanation = "Attention consistency is improving but requires continued monitoring."
            elif "reading" in category.lower():
                explanation = "Reading fluency shows potential but requires steady practice."
            elif "typing" in category.lower():
                explanation = "Typing speed is developing, regular practice will help."
            else:
                explanation = "Steady progress is being made, continue current support strategies."
        
        return {
            "riskCategory": category.capitalize() if category else "None",
            "riskLevel": level_str,
            "riskExplanation": explanation,
            "confidence": "High" # Omit raw numbers for parents
        }

    @staticmethod
    def get_strengths(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentMonitoringService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        assessments = supabase.table('assessment_results')\
            .select('assessment_type, result_data')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .limit(20)\
            .execute()
            
        if not assessments.data:
            return []
            
        scores = defaultdict(list)
        for a in assessments.data:
            type_str = a['assessment_type'].capitalize()
            res = a.get('result_data', {})
            score = res.get('overall_score', res.get('accuracy', res.get('wpm', 0)))
            if isinstance(score, (int, float)):
                scores[type_str].append(score)
                
        averages = {k: sum(v)/len(v) for k, v in scores.items() if v}
        sorted_areas = sorted(averages.items(), key=lambda x: x[1], reverse=True)
        
        strengths = []
        for area, score in sorted_areas[:3]:
            if score >= 70:
                strengths.append({
                    "area": area,
                    "score": round(score),
                    "description": f"Excellent performance in {area}."
                })
                
        return strengths

    @staticmethod
    def get_support_areas(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentMonitoringService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        assessments = supabase.table('assessment_results')\
            .select('assessment_type, result_data')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .limit(20)\
            .execute()
            
        if not assessments.data:
            return []
            
        scores = defaultdict(list)
        for a in assessments.data:
            type_str = a['assessment_type'].capitalize()
            res = a.get('result_data', {})
            score = res.get('overall_score', res.get('accuracy', res.get('wpm', 0)))
            if isinstance(score, (int, float)):
                scores[type_str].append(score)
                
        averages = {k: sum(v)/len(v) for k, v in scores.items() if v}
        sorted_areas = sorted(averages.items(), key=lambda x: x[1])
        
        support_areas = []
        for area, score in sorted_areas[:3]:
            if score < 70:
                support_areas.append({
                    "area": area,
                    "score": round(score),
                    "guidance": "Additional practice recommended."
                })
                
        return support_areas

    @staticmethod
    def get_intervention_status(parent_id: str, student_id: str) -> Dict[str, Any]:
        ParentMonitoringService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        activities = supabase.table('teacher_assigned_activities')\
            .select('*')\
            .eq('student_id', student_id)\
            .execute()
            
        assessments = supabase.table('teacher_assigned_assessments')\
            .select('*')\
            .eq('student_id', student_id)\
            .execute()
            
        all_items = []
        
        pending_count = 0
        completed_count = 0
        overdue_count = 0
        
        now = datetime.now()
        
        for act in activities.data:
            status = act.get('status', 'pending')
            due = act.get('due_date')
            due_date = datetime.fromisoformat(due.replace('Z', '+00:00')) if due else None
            
            if status == 'completed':
                completed_count += 1
            elif due_date and due_date < now:
                status = 'overdue'
                overdue_count += 1
            else:
                pending_count += 1
                
            all_items.append({
                "id": act['id'],
                "title": act['activity_title'],
                "type": "Activity",
                "status": status,
                "dueDate": act.get('due_date'),
                "progress": act.get('progress', 0)
            })
            
        for ast in assessments.data:
            status = ast.get('status', 'pending')
            due = ast.get('due_date')
            due_date = datetime.fromisoformat(due.replace('Z', '+00:00')) if due else None
            
            if status == 'completed':
                completed_count += 1
            elif due_date and due_date < now:
                status = 'overdue'
                overdue_count += 1
            else:
                pending_count += 1
                
            all_items.append({
                "id": ast['id'],
                "title": ast['assessment_title'],
                "type": "Assessment",
                "status": status,
                "dueDate": ast.get('due_date'),
                "progress": ast.get('progress', 0)
            })
            
        # Sort by due date (nulls last)
        all_items.sort(key=lambda x: x['dueDate'] or "9999-12-31")
            
        return {
            "items": all_items,
            "summary": {
                "pending": pending_count,
                "completed": completed_count,
                "overdue": overdue_count
            }
        }

    @staticmethod
    def get_parent_visible_notes(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentMonitoringService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        try:
            # Only fetch where visibility is parent_visible or admin_visible (maybe just parent_visible)
            notes = supabase.table('teacher_student_notes')\
                .select('id, note, created_at, teacher_profiles(teacher_name)')\
                .eq('student_id', student_id)\
                .eq('visibility', 'parent_visible')\
                .order('created_at', desc=True)\
                .execute()
                
            formatted_notes = []
            for n in notes.data:
                teacher_name = "Teacher"
                if n.get('teacher_profiles'):
                    teacher_name = n['teacher_profiles'].get('teacher_name', 'Teacher')
                formatted_notes.append({
                    "id": n['id'],
                    "note": n['note'],
                    "date": n['created_at'],
                    "author": teacher_name
                })
                
            return formatted_notes
        except Exception as e:
            print(f"Error fetching teacher notes (migration might be missing): {e}")
            return []

    @staticmethod
    def get_home_support_summary(parent_id: str, student_id: str) -> Dict[str, Any]:
        """
        Generates a summary based on assessments, learning paths, visible notes, and assigned activities.
        """
        ParentMonitoringService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        strengths = ParentMonitoringService.get_strengths(parent_id, student_id)
        support = ParentMonitoringService.get_support_areas(parent_id, student_id)
        interventions = ParentMonitoringService.get_intervention_status(parent_id, student_id)
        
        improving_areas = [s['area'] for s in strengths]
        attention_areas = [s['area'] for s in support]
        
        improving_str = ", ".join(improving_areas) if improving_areas else "Continuing to develop foundational skills."
        attention_str = ", ".join(attention_areas) if attention_areas else "General monitoring and support."
        
        actionable = []
        pending_items = [i for i in interventions['items'] if i['status'] in ['pending', 'overdue']]
        
        if pending_items:
            actionable.append(f"Ensure {len(pending_items)} pending assignments are completed.")
            
        if "Reading" in attention_areas:
            actionable.append("Encourage 15 minutes of daily reading practice.")
        if "Typing" in attention_areas:
            actionable.append("Practice keyboard familiarity for 10 minutes a day.")
        if "Attention" in attention_areas:
            actionable.append("Try to break tasks into smaller 15-minute chunks.")
            
        if not actionable:
            actionable.append("Continue monitoring progress and offering positive reinforcement.")
            
        return {
            "improving": improving_str,
            "attention": attention_str,
            "actions": actionable
        }
