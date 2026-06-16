import os
import json
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

class LearningCoachService:
    @staticmethod
    def generate_coach_message(progress_data: dict) -> dict:
        api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GITHUB_TOKEN")
        if not api_key:
            return {
                "message": f"You are doing great on week {progress_data.get('current_week', 1)}! Keep up the good work and stay focused.",
                "reflection": "Consistent practice leads to lasting improvement."
            }
            
        try:
            client = OpenAI(
                base_url="https://models.inference.ai.azure.com",
                api_key=api_key
            )
            
            system_prompt = """
            You are an encouraging AI Learning Coach for a student using a cognitive training platform.
            You are given their learning path progress.
            
            RULES:
            1. Provide a short, motivational message (2-3 sentences).
            2. Provide a 1-sentence reflection on their progress.
            3. Do NOT generate activities or change their path.
            4. Output strictly valid JSON matching this schema:
            {
                "message": "motivational text",
                "reflection": "reflection text"
            }
            """
            
            user_content = json.dumps(progress_data)
            
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model="gpt-4o-mini",
                response_format={ "type": "json_object" }
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Failed to generate coach message: {e}")
            return {
                "message": "Keep pushing forward! Every activity builds your cognitive skills.",
                "reflection": "Persistence is key."
            }
