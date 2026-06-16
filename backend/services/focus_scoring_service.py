import os
import json
from openai import OpenAI

class FocusScoringService:
    def __init__(self):
        # Configure GitHub Models client
        token = os.environ.get("GITHUB_TOKEN")
        self.client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=token,
        ) if token else None

    def calculate_scores(self, metrics: dict) -> dict:
        """
        Calculate Focus Score, Engagement Score, and Attention Stability
        based on raw webcam telemetry.
        """
        # Extract inputs with defaults
        screen_focus = metrics.get('screenFocusPercent', 0)
        face_presence = metrics.get('facePresencePercent', 0)
        head_stability = metrics.get('headMovementScore', 0)
        task_accuracy = metrics.get('taskAccuracy', 0)
        
        look_away_count = metrics.get('lookAwayCount', 0)
        avg_look_away_dur = metrics.get('averageLookAwayDuration', 0.0)
        face_lost_events = metrics.get('faceLostEvents', 0)

        # Focus Score: 40% Screen Focus, 30% Face Presence, 20% Head Stability, 10% Task Accuracy
        focus_score = (
            (screen_focus * 0.40) +
            (face_presence * 0.30) +
            (head_stability * 0.20) +
            (task_accuracy * 0.10)
        )

        # Engagement Score: Punish high look-away counts and long durations
        # Base 100, subtract points for lost events and look-aways
        engagement_penalty = (look_away_count * 2) + (avg_look_away_dur * 5) + (face_lost_events * 4)
        engagement_score = max(0, min(100, 100 - engagement_penalty))

        # Attention Stability: Relies heavily on head stability and lack of look-aways
        stability_score = max(0, min(100, head_stability - (look_away_count * 1.5)))

        return {
            "focusScore": round(focus_score),
            "engagementScore": round(engagement_score),
            "attentionStability": round(stability_score),
            "screenFocusPercent": screen_focus,
            "facePresencePercent": face_presence,
            "lookAwayCount": look_away_count,
            "averageLookAwayDuration": avg_look_away_dur,
            "faceLostEvents": face_lost_events,
            "headMovementScore": head_stability,
            "taskAccuracy": task_accuracy
        }

    async def generate_insights(self, scores: dict) -> dict:
        """
        Generates AI insights (Strengths, Areas for Improvement, 3 Actionable Recommendations)
        using GPT-4o-mini via GitHub Models.
        """
        if not self.client:
            return self._generate_fallback_insights(scores)

        prompt = f"""
        You are an educational AI assistant analyzing a student's Focus & Engagement Assessment results.
        This test tracked webcam telemetry (face presence, look-aways, screen focus, head stability).
        
        Scores:
        - Focus Score: {scores['focusScore']}/100
        - Engagement Score: {scores['engagementScore']}/100
        - Attention Stability: {scores['attentionStability']}/100
        
        Telemetry:
        - Screen Focus Percent: {scores['screenFocusPercent']}%
        - Face Presence Percent: {scores['facePresencePercent']}%
        - Look Away Count: {scores['lookAwayCount']}
        - Average Look Away Duration: {scores['averageLookAwayDuration']} seconds
        - Face Lost Events: {scores['faceLostEvents']}
        - Task Accuracy: {scores['taskAccuracy']}%

        Constraints:
        1. DO NOT mention ADHD, Dyslexia, or any medical diagnosis.
        2. Keep the tone encouraging, educational, and behavioral.
        3. Output MUST be valid JSON with this exact structure:
        {{
            "strengths": ["string", "string"],
            "areasForImprovement": ["string", "string"],
            "actionableRecommendations": ["string", "string", "string"]
        }}
        Provide exactly 3 actionable recommendations.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful educational AI."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" },
                temperature=0.7,
                max_tokens=500
            )

            result_content = response.choices[0].message.content
            return json.loads(result_content)

        except Exception as e:
            print(f"Error calling GitHub Models: {e}")
            return self._generate_fallback_insights(scores)

    def _generate_fallback_insights(self, scores: dict) -> dict:
        return {
            "strengths": [
                "Completed the focus assessment successfully.",
                f"Maintained face presence for {scores['facePresencePercent']}% of the time."
            ],
            "areasForImprovement": [
                f"Had {scores['lookAwayCount']} look-away events." if scores['lookAwayCount'] > 2 else "Maintain current focus strategies."
            ],
            "actionableRecommendations": [
                "Try to keep your eyes on the screen during tasks.",
                "Minimize background distractions before starting.",
                "Practice taking short breaks between intense focus sessions."
            ]
        }
