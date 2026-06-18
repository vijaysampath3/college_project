from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from services.supabase_client import get_supabase_client
from fastapi import HTTPException

class ParentRecommendationsService:
    @staticmethod
    def _validate_access(parent_id: str, student_id: str) -> bool:
        supabase = get_supabase_client()
        response = supabase.table('student_parent_relationships')\
            .select('id')\
            .eq('parent_id', parent_id)\
            .eq('student_id', student_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=403, detail="Not authorized to access this student's data.")
        return True

    @staticmethod
    def get_teacher_assigned_activities(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentRecommendationsService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        try:
            activities = supabase.table('teacher_assigned_activities')\
                .select('id, activity_name, due_date, status, priority, teacher_id, teacher_profiles(teacher_name)')\
                .eq('student_id', student_id)\
                .order('due_date', desc=False)\
                .execute()
                
            formatted = []
            for a in activities.data:
                formatted.append({
                    "id": a['id'],
                    "name": a['activity_name'],
                    "teacherName": a.get('teacher_profiles', {}).get('teacher_name', 'Teacher') if a.get('teacher_profiles') else 'Teacher',
                    "priority": a.get('priority', 'Medium'),
                    "dueDate": a.get('due_date'),
                    "status": a.get('status', 'pending')
                })
            return formatted
        except Exception as e:
            print(f"Error fetching assigned activities: {e}")
            return []

    @staticmethod
    def get_teacher_assigned_assessments(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentRecommendationsService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        try:
            assessments = supabase.table('teacher_assigned_assessments')\
                .select('id, assessment_type, due_date, status, teacher_id, teacher_profiles(teacher_name)')\
                .eq('student_id', student_id)\
                .order('due_date', desc=False)\
                .execute()
                
            formatted = []
            for a in assessments.data:
                name_map = {
                    "reading": "Reading Assessment",
                    "attention": "Focus Assessment",
                    "learning_behaviour": "Behaviour Assessment"
                }
                atype = a.get('assessment_type', '')
                name = name_map.get(atype, atype.capitalize() + " Assessment" if atype else "Assessment")
                
                formatted.append({
                    "id": a['id'],
                    "name": name,
                    "teacherName": a.get('teacher_profiles', {}).get('teacher_name', 'Teacher') if a.get('teacher_profiles') else 'Teacher',
                    "dueDate": a.get('due_date'),
                    "status": a.get('status', 'pending')
                })
            return formatted
        except Exception as e:
            print(f"Error fetching assigned assessments: {e}")
            return []

    @staticmethod
    def get_teacher_recommendations(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentRecommendationsService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        try:
            recs = supabase.table('student_recommendations')\
                .select('id, recommendation_text, created_at, teacher_id, teacher_profiles(teacher_name)')\
                .eq('student_id', student_id)\
                .order('created_at', desc=True)\
                .execute()
                
            formatted = []
            for r in recs.data:
                formatted.append({
                    "id": r['id'],
                    "text": r.get('recommendation_text', ''),
                    "teacherName": r.get('teacher_profiles', {}).get('teacher_name', 'Teacher') if r.get('teacher_profiles') else 'Teacher',
                    "date": r.get('created_at'),
                    "priority": "High"  # Teacher recommendations are usually high priority
                })
            return formatted
        except Exception as e:
            print(f"Error fetching teacher recommendations: {e}")
            return []

    @staticmethod
    def get_home_support_activities(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentRecommendationsService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        # Determine risks from student_reports to generate activities
        activities = []
        try:
            reports = supabase.table('student_reports')\
                .select('risk_analysis')\
                .eq('student_id', student_id)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
                
            risk_areas = []
            if reports.data and reports.data[0].get('risk_analysis'):
                analysis = reports.data[0]['risk_analysis']
                for key, val in analysis.items():
                    if isinstance(val, dict) and val.get('level') in ['High', 'Severe']:
                        risk_areas.append(key)
            
            # Map risks to specific home activities
            if 'reading' in risk_areas or 'dyslexia' in risk_areas:
                activities.append({"id": "ha-1", "name": "Read together for 15 minutes", "category": "Reading", "estimatedMinutes": 15})
                activities.append({"id": "ha-2", "name": "Vocabulary flashcards", "category": "Reading", "estimatedMinutes": 10})
            if 'attention' in risk_areas or 'adhd' in risk_areas:
                activities.append({"id": "ha-3", "name": "Focus exercise (Pomodoro)", "category": "Attention", "estimatedMinutes": 20})
            if 'learning_behaviour' in risk_areas:
                activities.append({"id": "ha-4", "name": "Memory challenge game", "category": "Cognitive", "estimatedMinutes": 15})
                
            # Defaults if no specific risks
            if not activities:
                activities = [
                    {"id": "ha-d1", "name": "Review school topics", "category": "General", "estimatedMinutes": 15},
                    {"id": "ha-d2", "name": "Organize tomorrow's bag", "category": "Organization", "estimatedMinutes": 5}
                ]
                
            return activities
        except Exception as e:
            print(f"Error generating home support activities: {e}")
            return []

    @staticmethod
    def get_priority_recommendations(parent_id: str, student_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Groups all assigned activities, assessments, and teacher recommendations into priority levels.
        Teacher assignments take precedence.
        """
        ParentRecommendationsService._validate_access(parent_id, student_id)
        
        high_priority = []
        medium_priority = []
        optional = []
        upcoming_deadlines = []
        
        now = datetime.now()
        next_week = now + timedelta(days=7)
        
        activities = ParentRecommendationsService.get_teacher_assigned_activities(parent_id, student_id)
        for a in activities:
            if a['status'] in ['completed']:
                continue
                
            item = {"id": f"act-{a['id']}", "title": a['name'], "type": "Activity", "source": a['teacherName'], "dueDate": a['dueDate']}
            
            due_date = None
            if a['dueDate']:
                try:
                    due_date = datetime.fromisoformat(a['dueDate'].replace('Z', '+00:00')[:19])
                except:
                    pass
            
            if due_date and due_date <= next_week:
                upcoming_deadlines.append(item)
                
            if a['priority'].lower() == 'high' or (due_date and due_date < now):
                high_priority.append(item)
            elif a['priority'].lower() == 'medium':
                medium_priority.append(item)
            else:
                optional.append(item)
                
        assessments = ParentRecommendationsService.get_teacher_assigned_assessments(parent_id, student_id)
        for a in assessments:
            if a['status'] in ['completed']:
                continue
                
            item = {"id": f"ass-{a['id']}", "title": a['name'], "type": "Assessment", "source": a['teacherName'], "dueDate": a['dueDate']}
            due_date = None
            if a['dueDate']:
                try:
                    due_date = datetime.fromisoformat(a['dueDate'].replace('Z', '+00:00')[:19])
                except:
                    pass
            
            if due_date and due_date <= next_week:
                upcoming_deadlines.append(item)
                
            # Assessments are usually high priority
            high_priority.append(item)
            
        teacher_recs = ParentRecommendationsService.get_teacher_recommendations(parent_id, student_id)
        for r in teacher_recs:
            item = {"id": f"rec-{r['id']}", "title": r['text'][:50] + "...", "type": "Recommendation", "source": r['teacherName'], "dueDate": None}
            medium_priority.append(item)
            
        home_acts = ParentRecommendationsService.get_home_support_activities(parent_id, student_id)
        for h in home_acts:
            item = {"id": h['id'], "title": h['name'], "type": "Home Support", "source": "System", "dueDate": None}
            optional.append(item)
            
        return {
            "high": high_priority,
            "medium": medium_priority,
            "optional": optional,
            "upcoming": upcoming_deadlines
        }

    @staticmethod
    def get_daily_support_plan(parent_id: str, student_id: str) -> Dict[str, Any]:
        """
        Dynamically forms Today's Focus and Action steps based on pending tasks and risks.
        """
        ParentRecommendationsService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        focus = "General Review"
        goal = "Complete pending tasks"
        actions = []
        
        try:
            # Check for high priority tasks
            priorities = ParentRecommendationsService.get_priority_recommendations(parent_id, student_id)
            if priorities.get('upcoming'):
                focus = "Upcoming Deadlines"
                goal = f"Complete {len(priorities['upcoming'])} tasks due soon"
                for item in priorities['upcoming'][:3]:
                    actions.append(f"Ensure {item['title']} is completed.")
            else:
                # Fallback to risk areas
                reports = supabase.table('student_reports').select('risk_analysis').eq('student_id', student_id).order('created_at', desc=True).limit(1).execute()
                if reports.data and reports.data[0].get('risk_analysis'):
                    analysis = reports.data[0]['risk_analysis']
                    risks = [k for k, v in analysis.items() if isinstance(v, dict) and v.get('level') in ['High', 'Severe']]
                    if 'reading' in risks:
                        focus = "Reading Support"
                        goal = "Improve reading comprehension"
                        actions = ["Read for 15 minutes together", "Review class reading materials"]
                    elif 'attention' in risks:
                        focus = "Focus and Attention"
                        goal = "Build sustained attention"
                        actions = ["Do a 15-minute focused activity", "Minimize distractions during homework"]
                        
            # If still no actions, generic ones
            if not actions:
                actions = ["Review what they learned today", "Check for any unsigned forms", "Prepare backpack for tomorrow"]
                
            return {
                "todaysFocus": focus,
                "thisWeeksGoal": goal,
                "actionSteps": actions
            }
        except Exception as e:
            print(f"Error generating daily plan: {e}")
            return {
                "todaysFocus": "System Error",
                "thisWeeksGoal": "Check back later",
                "actionSteps": []
            }

    @staticmethod
    def create_home_activity_log(parent_id: str, student_id: str, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        ParentRecommendationsService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        try:
            log_data = {
                "parent_id": parent_id,
                "student_id": student_id,
                "activity_name": activity_data.get('activity_name', 'Unknown Activity'),
                "activity_category": activity_data.get('activity_category', 'General'),
                "completed": True,
                "completed_at": datetime.utcnow().isoformat(),
                "parent_notes": activity_data.get('parent_notes', '')
            }
            
            res = supabase.table('parent_home_activity_logs').insert(log_data).execute()
            return res.data[0] if res.data else {}
        except Exception as e:
            print(f"Error creating home activity log: {e}")
            raise HTTPException(status_code=500, detail="Failed to log home activity")

    @staticmethod
    def get_home_activity_logs(parent_id: str, student_id: str) -> List[Dict[str, Any]]:
        ParentRecommendationsService._validate_access(parent_id, student_id)
        supabase = get_supabase_client()
        
        try:
            logs = supabase.table('parent_home_activity_logs')\
                .select('*')\
                .eq('student_id', student_id)\
                .eq('parent_id', parent_id)\
                .order('completed_at', desc=True)\
                .execute()
                
            formatted = []
            for l in logs.data:
                formatted.append({
                    "id": l['id'],
                    "activityName": l['activity_name'],
                    "category": l.get('activity_category'),
                    "completedAt": l.get('completed_at'),
                    "notes": l.get('parent_notes')
                })
            return formatted
        except Exception as e:
            print(f"Error fetching home activity logs: {e}")
            return []
