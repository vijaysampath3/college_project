from typing import Dict, Any, List
import uuid

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(snapshot: Dict[str, Any], risks: Dict[str, Any], report_id: str) -> List[Dict[str, Any]]:
        recommendations = []
        
        # 1. Reading Fluency
        rf_risk = risks.get("reading_fluency", {}).get("level", "Low")
        if rf_risk in ["High", "Moderate"]:
            recommendations.append({
                "recommendation_type": "reading_fluency",
                "category": "reading",
                "priority": "High" if rf_risk == "High" else "Medium",
                "impact_score": 90 if rf_risk == "High" else 75,
                "title": "Timed Reading Practice",
                "description": "Practice reading aloud for 10 minutes daily to build speed and accuracy smoothly.",
                "estimated_minutes": 10,
                "activity_data": {"activityCode": "READ_FLUENCY_001"}
            })
            recommendations.append({
                "recommendation_type": "repeated_reading",
                "category": "reading",
                "priority": "Medium" if rf_risk == "High" else "Low",
                "impact_score": 80 if rf_risk == "High" else 60,
                "title": "Repeated Reading Exercise",
                "description": "Read the same short passage 3-4 times to improve word recognition and confidence.",
                "estimated_minutes": 15,
                "activity_data": {"activityCode": "READ_FLUENCY_002"}
            })

        # 2. Comprehension
        learning_diff_risk = risks.get("learning_difficulties", {}).get("level", "Low")
        comp_metrics = snapshot.get("comprehension", {}).get("metrics", {})
        if learning_diff_risk in ["High", "Moderate"] or comp_metrics.get("totalScore", 100) < 80:
            recommendations.append({
                "recommendation_type": "main_idea_practice",
                "category": "comprehension",
                "priority": "High" if learning_diff_risk == "High" else "Medium",
                "impact_score": 95 if learning_diff_risk == "High" else 70,
                "title": "Main Idea Mastery",
                "description": "Read short paragraphs and practice identifying the single most important idea.",
                "estimated_minutes": 15,
                "activity_data": {"activityCode": "COMP_MAIN_001"}
            })
            
        # 3. Attention & Focus (ADHD Indicators/Attention Inconsistency)
        attention_risk = risks.get("attention_inconsistency", {}).get("level", "Low")
        concentration_risk = risks.get("concentration", {}).get("level", "Low")
        
        if attention_risk in ["High", "Moderate"] or concentration_risk in ["High", "Moderate"]:
            priority = "High" if "High" in [attention_risk, concentration_risk] else "Medium"
            recommendations.append({
                "recommendation_type": "focus_sprints",
                "category": "focus",
                "priority": priority,
                "impact_score": 85 if priority == "High" else 65,
                "title": "Focus Sprints (Pomodoro)",
                "description": "Work in highly focused 15-minute bursts, followed by a mandatory 3-minute physical break.",
                "estimated_minutes": 20,
                "activity_data": {"activityCode": "ATTENTION_FOCUS_001"}
            })
            recommendations.append({
                "recommendation_type": "visual_search",
                "category": "attention",
                "priority": "Medium" if priority == "High" else "Low",
                "impact_score": 75 if priority == "High" else 50,
                "title": "Visual Search Challenge",
                "description": "Engage in visual tracking exercises to build sustained attention and scanning speed.",
                "estimated_minutes": 10,
                "activity_data": {"activityCode": "ATTENTION_VISUAL_001"}
            })

        # 4. Typing Accuracy
        typing_metrics = snapshot.get("typing", {}).get("metrics", {})
        if typing_metrics.get("accuracy", 100) < 90:
            recommendations.append({
                "recommendation_type": "typing_accuracy",
                "category": "typing",
                "priority": "Medium",
                "impact_score": 60,
                "title": "Keyboard Accuracy Drills",
                "description": "Focus entirely on accuracy over speed. Practice hitting the correct keys without looking down.",
                "estimated_minutes": 10,
                "activity_data": {"activityCode": "TYPING_ACCURACY_001"}
            })

        # 5. Learning Behaviour / Engagement
        engagement_risk = risks.get("learning_engagement", {}).get("level", "Low")
        if engagement_risk in ["High", "Moderate"]:
            recommendations.append({
                "recommendation_type": "goal_breakdown",
                "category": "behaviour",
                "priority": "High" if engagement_risk == "High" else "Medium",
                "impact_score": 80,
                "title": "Goal Breakdown Strategy",
                "description": "Take one large assignment and break it down into 3-4 micro-tasks to reduce feeling overwhelmed.",
                "estimated_minutes": 15,
                "activity_data": {"activityCode": "BEHAVIOUR_GOALS_001"}
            })

        # Ensure we always have at least 1-2 generic recommendations if they scored perfect
        if not recommendations:
            recommendations.append({
                "recommendation_type": "advanced_reading",
                "category": "reading",
                "priority": "Low",
                "impact_score": 40,
                "title": "Advanced Vocabulary Builder",
                "description": "Challenge yourself with higher-grade reading material to expand vocabulary.",
                "estimated_minutes": 20,
                "activity_data": {"activityCode": "READ_ADV_001"}
            })

        # Add tracking data to each
        batch_id = str(uuid.uuid4())
        for rec in recommendations:
            rec["recommendation_batch_id"] = batch_id
            rec["generated_from_report"] = report_id
            
            # Set target counts for progressive completion
            if rec["priority"] == "High":
                rec["target_count"] = 5
            elif rec["priority"] == "Medium":
                rec["target_count"] = 3
            else:
                rec["target_count"] = 1
            rec["completed_count"] = 0

        return recommendations

    @staticmethod
    def generate_weekly_plan(recommendations: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        # Sort by impact score descending
        sorted_recs = sorted(recommendations, key=lambda x: x["impact_score"], reverse=True)
        
        plan = {
            "week1": [],
            "week2": [],
            "week3": [],
            "week4": []
        }
        
        # Week 1: High Priority Only (Top 2-3)
        high_recs = [r for r in sorted_recs if r["priority"] == "High"]
        med_recs = [r for r in sorted_recs if r["priority"] == "Medium"]
        low_recs = [r for r in sorted_recs if r["priority"] == "Low"]

        # Allocate
        plan["week1"] = high_recs[:3] if high_recs else med_recs[:2]
        
        week2_pool = high_recs[3:] + med_recs
        plan["week2"] = week2_pool[:3] if week2_pool else low_recs[:2]
        
        week3_pool = week2_pool[3:] + low_recs
        plan["week3"] = week3_pool[:3]
        
        # Week 4 is review/maintenance
        plan["week4"] = plan["week1"][:1] + plan["week2"][:1]

        return plan
