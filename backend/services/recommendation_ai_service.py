import os
import json
import logging
from typing import Dict, Any, List
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

logger = logging.getLogger(__name__)

class RecommendationAIService:
    @staticmethod
    def personalize_recommendations(recommendations: List[Dict[str, Any]], learning_profile: str, risks: Dict[str, Any]) -> Dict[str, str]:
        token = os.environ.get("GITHUB_TOKEN")
        
        fallback_msg = {
            "coachMessage": "Here is your personalized action plan based on your recent assessments.",
            "motivation": "Consistent practice leads to lasting improvement!",
            "strategyExplanation": "We prioritized the activities that will yield the highest impact for your specific learning profile."
        }
        
        if not token or token == "your_token_here" or not OpenAI:
            logger.warning("GitHub token missing. Using fallback coach message.")
            return fallback_msg

        client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=token,
        )

        system_prompt = """
You are an encouraging Educational AI Coach.
Your task is to review the student's predetermined action plan and generate a personalized, motivating message.
        
CRITICAL GUARDRAILS:
1. DO NOT create new activities.
2. DO NOT change the priorities or the recommendations.
3. DO NOT invent risks or give medical diagnoses (e.g., no ADHD, Dyslexia).
4. ONLY explain the strategy behind the provided recommendations and motivate the student.

Output MUST be exactly this JSON schema:
{
  "coachMessage": "A friendly greeting and overview of their personalized path (2-3 sentences).",
  "motivation": "A short, highly encouraging motivational statement.",
  "strategyExplanation": "A 2-3 sentence explanation of WHY these specific tasks were chosen based on their learning profile and priorities."
}
"""

        rec_summary = [{"title": r["title"], "priority": r["priority"]} for r in recommendations]

        user_content = json.dumps({
            "learningProfile": learning_profile,
            "risks_summary": {k: v["level"] for k, v in risks.items() if v["level"] in ["High", "Moderate"]},
            "assigned_recommendations": rec_summary
        })

        try:
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                temperature=0.4
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Failed to generate AI Coach message: {e}")
            return fallback_msg
