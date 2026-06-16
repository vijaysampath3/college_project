import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
import os
from dotenv import load_dotenv
from services.supabase_client import get_supabase_client
from services.risk_engine import RiskEngine

load_dotenv()
logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ReportGenerationService:
    @staticmethod
    def _fetch_assessment_snapshot(student_id: str) -> Dict[str, Any]:
        """
        Fetch the latest completed assessment results for each type.
        """
        supabase = get_supabase_client()
        response = supabase.table("assessment_results").select("*").eq("student_id", student_id).order("created_at", desc=True).execute()
        
        results = response.data
        snapshot = {}
        # Keep only the latest for each assessment type
        for r in results:
            a_type = r["assessment_type"]
            if a_type not in snapshot:
                snapshot[a_type] = r["result_data"]
                
        return snapshot

    @staticmethod
    def _calculate_readiness_score(snapshot: Dict[str, Any], risks: Dict[str, Any]) -> int:
        """
        Calculates an overall readiness score out of 100 based on snapshot and risks.
        """
        base_score = 100
        
        # Deduct based on risk levels
        penalty_map = {"High": 15, "Moderate": 5, "Low": 0}
        for risk_name, risk_data in risks.items():
            base_score -= penalty_map.get(risk_data["level"], 0)
            
        # Ensure it doesn't go below 20 just to be encouraging
        return max(20, min(100, base_score))

    @staticmethod
    def generate_report(student_id: str) -> Dict[str, Any]:
        """
        Generates a full intelligence report for the student, evaluating all risks 
        and using GPT for the textual insights. Saves to DB and returns.
        """
        snapshot = ReportGenerationService._fetch_assessment_snapshot(student_id)
        
        # Calculate Risks deterministically
        risks = RiskEngine.calculate_all_risks(snapshot)
        
        readiness_score = ReportGenerationService._calculate_readiness_score(snapshot, risks)
        
        # Extract learning profile from learning behaviour assessment
        learning_profile = "Pending"
        if "learning-behaviour" in snapshot and "profile" in snapshot["learning-behaviour"]:
            learning_profile = snapshot["learning-behaviour"]["profile"].get("dominantProfile", "Unknown")
            
        # Create Assessment Summary
        assessment_summary = {}
        for k, v in snapshot.items():
            if "metrics" in v:
                assessment_summary[k] = v["metrics"]
            elif "scores" in v:
                assessment_summary[k] = v["scores"]
            else:
                assessment_summary[k] = {"completed": True}
                
        # Generate AI Insights
        system_prompt = """
        You are an expert Educational Psychologist analyzing a student's cognitive and learning profile.
        You are given an assessment summary, a deterministic risk analysis, and a learning profile.
        
        CRITICAL RULES:
        1. NEVER use medical diagnoses (e.g., ADHD, Dyslexia, Disorder). Use ONLY "Indicators Observed", "Potential Risk", "Learning Support Considerations".
        2. Do NOT invent scores or new risks. Rely solely on the provided risk analysis and summary.
        3. Output MUST be valid JSON matching the exact schema below.

        Schema:
        {
            "executiveSummary": "A 3-4 sentence professional summary of the student's learning profile, readiness, and overall pattern.",
            "strengths": ["Strength 1", "Strength 2", "Strength 3"],
            "growthAreas": ["Area 1", "Area 2", "Area 3"],
            "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
        }
        """

        user_content = json.dumps({
            "readiness_score": readiness_score,
            "learning_profile": learning_profile,
            "risk_analysis": risks,
            "assessment_summary": assessment_summary
        })

        ai_insights = {
            "executiveSummary": "Insights could not be generated.",
            "strengths": [],
            "growthAreas": [],
            "recommendations": []
        }

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={ "type": "json_object" },
                temperature=0.3
            )
            ai_insights = json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Failed to generate AI insights: {e}")

        supabase = get_supabase_client()
        
        # Get latest report version to increment
        version_resp = supabase.table("student_reports").select("report_version").eq("student_id", student_id).order("report_version", desc=True).limit(1).execute()
        next_version = 1
        if version_resp.data:
            next_version = version_resp.data[0]["report_version"] + 1

        report_data = {
            "student_id": student_id,
            "report_version": next_version,
            "readiness_score": readiness_score,
            "learning_profile": learning_profile,
            "risk_analysis": risks,
            "ai_insights": ai_insights,
            "assessment_summary": assessment_summary,
            "assessment_snapshot": snapshot,
            "generated_from_assessments": len(snapshot)
        }
        
        insert_resp = supabase.table("student_reports").insert(report_data).execute()
        if not insert_resp.data:
            raise Exception("Failed to save student report to database")
            
        return insert_resp.data[0]
