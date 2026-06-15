import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# We use GitHub Models for GPT-4o-mini via OpenAI SDK
client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=os.environ["GITHUB_TOKEN"]
)

def generate_typing_insights(metrics: dict, difficulty: str):
    """
    Generate personalized typing insights using GPT-4o-mini via GitHub Models.
    Focus on learning behavior, rhythm, and specific error patterns.
    """
    
    prompt = f"""
You are an expert typing instructor and learning behavior analyst.
Analyze the following typing assessment metrics and provide actionable insights.
Keep the tone encouraging, professional, and targeted to students.

Performance Data:
- Difficulty: {difficulty}
- WPM: {metrics.get('wpm')}
- Accuracy: {metrics.get('accuracy')}%
- Total Keystrokes: {metrics.get('totalKeystrokes')}
- Backspace Count: {metrics.get('backspaceCount')}
- Error Count: {metrics.get('errorCount')}
- Corrected Errors: {metrics.get('correctedErrors')}
- Uncorrected Errors: {metrics.get('uncorrectedErrors')}
- Completion Time: {metrics.get('completionTimeSeconds')} seconds
- Pause Events (>1.5s): {metrics.get('pauseEvents')}
- Average Pause Duration: {metrics.get('averagePauseDurationMs')} ms
- Longest Pause: {metrics.get('longestPauseDurationMs')} ms

Error Typology:
- Omissions: {metrics.get('omissions')}
- Insertions: {metrics.get('insertions')}
- Substitutions: {metrics.get('substitutions')}
- Transpositions: {metrics.get('transpositions')}
- Capitalization Errors: {metrics.get('capitalizationErrors')}
- Punctuation Errors: {metrics.get('punctuationErrors')}
- Word Boundary Errors: {metrics.get('wordBoundaryErrors')}

Focus Loss Events: {metrics.get('focusLossEvents', [])}

Determine a general performance level (Beginner, Intermediate, Proficient, Expert) based on WPM and Accuracy.

Output must be ONLY valid JSON matching this schema exactly:
{{
  "summary": "2-3 sentence overview of their typing performance.",
  "performanceLevel": "String level",
  "typingRhythmAnalysis": "1-2 sentences analyzing their speed, pauses, and backspace usage.",
  "pauseAnalysis": "1-2 sentences analyzing the frequency and duration of their pauses.",
  "errorAnalysis": "1-2 sentences analyzing the types of errors they made (e.g. punctuation, transpositions).",
  "mostCommonErrorType": "Name of the most common error category",
  "recommendations": [
    "Actionable tip 1",
    "Actionable tip 2",
    "Actionable tip 3"
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert AI typing instructor. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="gpt-4o-mini",
            temperature=0.3,
            max_tokens=800,
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        return json.loads(result_content)
        
    except Exception as e:
        print(f"Error generating typing insights: {str(e)}")
        # Fallback response
        return {
            "summary": "You completed the typing assessment. Keep practicing to improve your speed and accuracy.",
            "performanceLevel": "Intermediate",
            "typingRhythmAnalysis": "Your rhythm was steady, though you used backspace a few times.",
            "pauseAnalysis": "You had a few pauses, which is normal when processing new text.",
            "errorAnalysis": "You made standard typing errors. Focus on looking at the screen, not the keyboard.",
            "mostCommonErrorType": "General",
            "recommendations": [
                "Practice typing for 10 minutes a day",
                "Focus on accuracy before speed",
                "Keep your hands in the home row position"
            ]
        }
