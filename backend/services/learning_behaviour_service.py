import os
import json
from openai import OpenAI

class LearningBehaviourService:
    def __init__(self):
        token = os.environ.get("GITHUB_TOKEN")
        self.client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=token,
        ) if token else None

    def calculate_scores(self, metrics: dict) -> dict:
        task1 = metrics.get('task1', {})
        task2 = metrics.get('task2', {})
        task3 = metrics.get('task3', {})

        # Task 1: Pattern Learning
        pattern_acc = task1.get('patternAccuracy', 0)
        pattern_time = task1.get('averageDecisionTimeMs', 0)
        pattern_consist = task1.get('consistencyScore', 0)

        # Task 2: Rule Application
        rule_retention = task2.get('ruleRetention', 0)
        adaptation_speed = task2.get('adaptationSpeedMs', 0)
        rule_recovery = task2.get('ruleSwitchRecovery', 0)
        instruction_acc = task2.get('instructionAccuracy', 0)

        # Task 3: Persistence
        completion_rate = task3.get('completionRate', 0)
        retry_rate = task3.get('retryRate', 0)
        skip_rate = task3.get('skipRate', 0)
        hard_time_spent = task3.get('timeSpentOnDifficultItemsMs', 0)
        abandonment_rate = task3.get('abandonmentRate', 0)
        challenge_persistence = task3.get('challengePersistence', 0)

        # 1. Persistence Score
        # High persistence: high completion, high challenge persistence, low abandonment
        persistence_score = max(0, min(100, (completion_rate * 0.4) + (challenge_persistence * 0.4) + ((100 - abandonment_rate) * 0.2)))

        # 2. Adaptability Score
        # High adaptability: high rule recovery, high instruction acc after rule switches
        adaptability_score = max(0, min(100, (rule_recovery * 0.5) + (instruction_acc * 0.5)))

        # 3. Consistency Score
        # Based on pattern consistency and rule retention
        consistency_score = max(0, min(100, (pattern_consist * 0.5) + (rule_retention * 0.5)))

        # 4. Processing Style Score (Speed vs Accuracy proxy)
        # 100 = Highly analytical (slow but accurate), 0 = Highly impulsive (fast but inaccurate)
        # We normalize time where 3000ms is considered "slow/analytical"
        normalized_time = min(100, (pattern_time / 3000) * 100) if pattern_time > 0 else 50
        processing_style_score = max(0, min(100, (normalized_time * 0.5) + (pattern_acc * 0.5)))

        # Overall Learning Behaviour Score (An aggregate index of productive behaviours)
        overall_score = (persistence_score * 0.3) + (adaptability_score * 0.3) + (consistency_score * 0.2) + (pattern_acc * 0.2)
        overall_score = round(max(0, min(100, overall_score)))

        # Determine Learning Profile Dimensions
        # Visual: High pattern accuracy
        visual = pattern_acc
        
        # Interactive: High adaptation speed, high retry rate (trial and error)
        # Normalized adaptation speed (faster is higher): max 5000ms
        norm_adapt = max(0, 100 - (adaptation_speed / 50))
        interactive = max(0, min(100, (norm_adapt * 0.6) + (min(100, retry_rate * 2) * 0.4)))

        # Analytical: High rule retention, longer decision times
        analytical = max(0, min(100, (rule_retention * 0.5) + (normalized_time * 0.5)))

        # Sequential: High completion rate, low skips, steady consistency
        sequential = max(0, min(100, (completion_rate * 0.5) + (consistency_score * 0.5)))

        # Find Dominant Profile String
        profiles = {
            "Visual": visual,
            "Interactive": interactive,
            "Analytical": analytical,
            "Sequential": sequential
        }
        
        # Get top 2
        sorted_profiles = sorted(profiles.items(), key=lambda item: item[1], reverse=True)
        dominant_str = f"{sorted_profiles[0][0]}-{sorted_profiles[1][0]} Learner"

        profile_data = {
            "visual": round(visual),
            "interactive": round(interactive),
            "analytical": round(analytical),
            "sequential": round(sequential),
            "dominantProfile": dominant_str
        }

        scores_data = {
            "learningBehaviourScore": overall_score,
            "persistenceScore": round(persistence_score),
            "adaptabilityScore": round(adaptability_score),
            "consistencyScore": round(consistency_score),
            "processingStyleScore": round(processing_style_score)
        }

        return scores_data, profile_data

    async def generate_insights(self, scores: dict, profile: dict) -> dict:
        if not self.client:
            return self._generate_fallback_insights(profile)

        prompt = f"""
        You are an educational AI assistant analyzing a student's Learning Behaviour Assessment results.
        This assessment evaluates how the student learns, adapts, and persists, NOT their academic knowledge.
        
        Scores:
        - Persistence: {scores['persistenceScore']}/100
        - Adaptability: {scores['adaptabilityScore']}/100
        - Consistency: {scores['consistencyScore']}/100
        
        Learning Profile:
        - Dominant Profile: {profile['dominantProfile']}
        - Visual: {profile['visual']}%
        - Sequential: {profile['sequential']}%
        - Interactive: {profile['interactive']}%
        - Analytical: {profile['analytical']}%

        Constraints:
        1. DO NOT mention ADHD, Dyslexia, or any medical diagnosis.
        2. Keep the tone encouraging, educational, and behavioral.
        3. Explain what their dominant profile means in the summary.
        4. Output MUST be valid JSON with this exact structure:
        {{
            "summary": "string",
            "strengths": ["string", "string"],
            "growthAreas": ["string", "string"],
            "recommendations": ["string", "string", "string"]
        }}
        Provide EXACTLY 3 recommendations, and MAXIMUM 3 strengths and growth areas.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful educational AI. Always output strict JSON."},
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
            return self._generate_fallback_insights(profile)

    def _generate_fallback_insights(self, profile: dict) -> dict:
        return {
            "summary": f"You are a {profile['dominantProfile']}! This means you thrive when engaging with material in those formats.",
            "strengths": [
                f"Strong {profile['dominantProfile'].split('-')[0].lower()} processing capabilities.",
                "Demonstrated active engagement during the tasks."
            ],
            "growthAreas": [
                "Can continue building stamina for longer tasks.",
                "Try incorporating different learning styles occasionally."
            ],
            "recommendations": [
                "Use your dominant learning style to tackle hard subjects.",
                "Break long assignments into smaller, manageable chunks.",
                "Experiment with one new study technique this week."
            ]
        }
