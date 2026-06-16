import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone

class LearningPathEngine:
    @staticmethod
    def generate_learning_path(student_id: str, snapshot: Dict[str, Any], risks: Dict[str, Any], report_id: str) -> Dict[str, Any]:
        """
        Deterministic logic to generate a 4-week learning path.
        """
        # 1. Determine Primary Focus Area
        focus_area = "General Readiness"
        journey_type = "starter"
        
        # If we have some risks, we can upgrade from 'starter' to 'standard'
        if risks:
            journey_type = "standard"
            # Pick highest risk
            high_risks = [k for k, v in risks.items() if v.get("level") == "High"]
            med_risks = [k for k, v in risks.items() if v.get("level") == "Moderate"]
            
            if "reading_fluency" in high_risks or "reading_fluency" in med_risks:
                focus_area = "Reading & Comprehension"
            elif "attention_inconsistency" in high_risks or "concentration" in high_risks:
                focus_area = "Focus & Attention"
            elif "typing" in high_risks or "typing" in med_risks:
                focus_area = "Typing Speed & Accuracy"
            elif "learning_difficulties" in high_risks or "learning_engagement" in high_risks:
                focus_area = "Learning Behaviour & Executive Function"

        # 2. Build the Path
        path_record = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "path_name": f"{focus_area} Journey",
            "journey_type": journey_type,
            "primary_focus_area": focus_area,
            "status": "active",
            "current_week": 1,
            "completion_percentage": 0,
            "generated_from_report": report_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        # 3. Generate Activities
        items = []
        
        # Helper to add item
        def add_item(week: int, order: int, code: str, title: str, cat: str, diff: str = "Easy"):
            items.append({
                "id": str(uuid.uuid4()),
                "path_id": path_record["id"],
                "week_number": week,
                "order_index": order,
                "activity_code": code,
                "activity_title": title,
                "activity_category": cat,
                "difficulty": diff,
                "completed": False
            })

        if focus_area == "Reading & Comprehension":
            # Week 1
            add_item(1, 1, "READ_FLUENCY_001", "Timed Reading Practice", "reading", "Easy")
            add_item(1, 2, "READ_FLUENCY_002", "Repeated Reading Exercise", "reading", "Easy")
            # Week 2
            add_item(2, 1, "COMP_MAIN_001", "Main Idea Mastery", "comprehension", "Easy")
            add_item(2, 2, "READ_FLUENCY_001", "Timed Reading Practice", "reading", "Medium")
            # Week 3
            add_item(3, 1, "COMP_INFERENCE_001", "Inference Challenge", "comprehension", "Medium")
            add_item(3, 2, "COMP_VOCAB_001", "Vocabulary Builder", "comprehension", "Medium")
            # Week 4
            add_item(4, 1, "READ_ADV_001", "Advanced Vocabulary Builder", "reading", "Hard")
            add_item(4, 2, "COMP_CRITICAL_001", "Critical Thinking Questions", "comprehension", "Hard")

        elif focus_area == "Focus & Attention":
            # Week 1
            add_item(1, 1, "ATTENTION_FOCUS_001", "Focus Sprint", "focus", "Easy")
            add_item(1, 2, "ATTENTION_VISUAL_001", "Visual Search Challenge", "attention", "Easy")
            # Week 2
            add_item(2, 1, "ATTENTION_SCAN_001", "Rapid Scanning", "attention", "Medium")
            add_item(2, 2, "ATTENTION_FOCUS_001", "Focus Sprint", "focus", "Medium")
            # Week 3
            add_item(3, 1, "FOCUS_TRACKING_001", "Continuous Tracking", "focus", "Medium")
            add_item(3, 2, "EXEC_SORT_001", "Rule Switch Sorting", "executive_function", "Medium")
            # Week 4
            add_item(4, 1, "MEMORY_SEQ_001", "Sequence Memory", "memory", "Hard")
            add_item(4, 2, "ATTENTION_FOCUS_001", "Focus Sprint", "focus", "Hard")

        elif focus_area == "Typing Speed & Accuracy":
            # Week 1
            add_item(1, 1, "TYPING_ACCURACY_001", "Accuracy Builder", "typing", "Easy")
            add_item(1, 2, "TYPING_PATTERN_001", "Letter Pattern Drill", "typing", "Easy")
            # Week 2
            add_item(2, 1, "TYPING_SPEED_001", "Speed Builder", "typing", "Easy")
            add_item(2, 2, "TYPING_ACCURACY_001", "Accuracy Builder", "typing", "Medium")
            # Week 3
            add_item(3, 1, "TYPING_SPEED_001", "Speed Builder", "typing", "Medium")
            add_item(3, 2, "TYPING_PATTERN_001", "Letter Pattern Drill", "typing", "Medium")
            # Week 4
            add_item(4, 1, "TYPING_SPEED_001", "Speed Builder", "typing", "Hard")
            add_item(4, 2, "TYPING_ACCURACY_001", "Accuracy Builder", "typing", "Hard")
            
        elif focus_area == "Learning Behaviour & Executive Function":
            # Week 1
            add_item(1, 1, "BEHAVIOUR_GOALS_001", "Goal Breakdown Strategy", "behaviour", "Easy")
            add_item(1, 2, "BEHAVIOUR_PATTERN_001", "Pattern Recognition", "behaviour", "Easy")
            # Week 2
            add_item(2, 1, "EXEC_SORT_001", "Rule Switch Sorting", "executive_function", "Easy")
            add_item(2, 2, "MEMORY_SEQ_001", "Sequence Memory", "memory", "Easy")
            # Week 3
            add_item(3, 1, "BEHAVIOUR_PERSISTENCE_001", "Persistence Challenge", "behaviour", "Medium")
            add_item(3, 2, "BEHAVIOUR_GOALS_001", "Goal Breakdown Strategy", "behaviour", "Medium")
            # Week 4
            add_item(4, 1, "EXEC_SORT_001", "Rule Switch Sorting", "executive_function", "Hard")
            add_item(4, 2, "MEMORY_SEQ_001", "Sequence Memory", "memory", "Hard")

        else:
            # Starter / General
            add_item(1, 1, "READ_FLUENCY_001", "Timed Reading Practice", "reading", "Easy")
            add_item(1, 2, "TYPING_ACCURACY_001", "Accuracy Builder", "typing", "Easy")
            add_item(2, 1, "ATTENTION_VISUAL_001", "Visual Search Challenge", "attention", "Easy")
            add_item(2, 2, "BEHAVIOUR_PATTERN_001", "Pattern Recognition", "behaviour", "Easy")
            add_item(3, 1, "COMP_MAIN_001", "Main Idea Mastery", "comprehension", "Medium")
            add_item(3, 2, "MEMORY_SEQ_001", "Sequence Memory", "memory", "Medium")
            add_item(4, 1, "EXEC_SORT_001", "Rule Switch Sorting", "executive_function", "Medium")
            add_item(4, 2, "FOCUS_TRACKING_001", "Continuous Tracking", "focus", "Medium")

        return {"path": path_record, "items": items}

    @staticmethod
    def calculate_path_progress(path_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not items:
            return {"completion_percentage": 0, "completed": 0, "remaining": 0, "current_week": 1}

        total = len(items)
        completed = sum(1 for i in items if i.get("completed"))
        remaining = total - completed
        percentage = int((completed / total) * 100)
        
        # Current week logic: The highest week where not all activities are completed, or the max week if all completed
        current_week = 1
        for w in range(1, 5):
            week_items = [i for i in items if i["week_number"] == w]
            if week_items and not all(i.get("completed") for i in week_items):
                current_week = w
                break
            elif week_items:
                current_week = w # All completed in this week, so push it up

        return {
            "completion_percentage": percentage,
            "completed": completed,
            "remaining": remaining,
            "current_week": current_week
        }
