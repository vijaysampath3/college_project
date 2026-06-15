import os
import json
import time
import logging
from dotenv import load_dotenv

# Try to import openai, fallback gracefully if not installed yet
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_fallback_insights(metrics: dict) -> dict:
    """Generate rule-based insights if the API call fails."""
    logger.info("Using fallback rule-based insights generator.")
    
    accuracy = metrics.get('accuracy', 0)
    wpm = metrics.get('wpm', 0)
    
    if accuracy >= 95:
        summary = "The student demonstrated excellent reading accuracy and strong comprehension potential."
        recs = [
            "Introduce slightly more advanced vocabulary.",
            "Encourage reading longer passages to build stamina.",
            "Discuss the passage's main themes to ensure deep comprehension."
        ]
    elif accuracy >= 85:
        summary = "The student read with good accuracy but had occasional mispronunciations or substitutions."
        recs = [
            "Practice pausing at punctuation marks to improve phrasing.",
            "Review multi-syllable words found in the text.",
            "Read aloud together to model proper intonation."
        ]
    else:
        summary = "The student experienced some difficulty with word decoding and phrasing."
        recs = [
            "Focus on phonetic decoding strategies for unfamiliar words.",
            "Practice reading shorter sentences to build confidence.",
            "Use guided reading to support word recognition."
        ]
        
    # Append a generic tip based on wpm
    if wpm < 80:
        recs[2] = "Practice re-reading familiar texts to increase reading speed smoothly."

    return {
        "summary": summary,
        "recommendations": recs
    }

def generate_fallback_comprehension_insights(metrics: dict) -> dict:
    """Generate rule-based insights for comprehension if API fails."""
    logger.info("Using fallback rule-based comprehension insights generator.")
    
    total_score = metrics.get('totalScore', 0)
    
    if total_score >= 80:
        summary = "The student demonstrated strong overall comprehension and critical thinking skills."
        recs = [
            "Encourage analyzing texts with more complex structures and themes.",
            "Practice synthesizing information from multiple sources.",
            "Continue building advanced vocabulary in context."
        ]
    elif total_score >= 60:
        summary = "The student showed adequate comprehension but struggled with some deeper analytical questions."
        recs = [
            "Practice identifying the author's purpose and tone.",
            "Focus on distinguishing between main ideas and supporting details.",
            "Review strategies for inferring meaning from context clues."
        ]
    else:
        summary = "The student experienced difficulty with fundamental comprehension tasks."
        recs = [
            "Practice summarizing each paragraph after reading it.",
            "Review key vocabulary terms before reading.",
            "Use graphic organizers to map out story elements and main ideas."
        ]

    return {
        "summary": summary,
        "recommendations": recs
    }

def generate_reading_insights(metrics: dict) -> tuple[dict, dict]:
    """
    Calls GitHub Models (gpt-4o-mini) to generate reading insights.
    Returns (insights_data, ai_metadata).
    """
    token = os.environ.get("GITHUB_TOKEN")
    
    ai_metadata = {
        "provider": "github-models",
        "model": "gpt-4o-mini",
        "generatedAt": None
    }

    if not token or token == "your_token_here" or not OpenAI:
        logger.warning("GitHub Models API token not found or invalid. Using fallback.")
        ai_metadata["provider"] = "rule-based"
        ai_metadata["model"] = "local-rules"
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return generate_fallback_insights(metrics), ai_metadata

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=token,
    )

    system_prompt = """
You are an educational reading assessment assistant.
Your role is to analyze reading-performance metrics and generate constructive educational feedback.
Rules:
- Educational tone only.
- No medical advice.
- No diagnosis.
- Do not mention dyslexia.
- Do not mention ADHD.
- Do not claim a learning disability.
- Maximum 80 words for summary.
- Exactly 3 actionable recommendations.
- Recommendations must be practical and student-friendly.
Return JSON only.
Required format:
{
  "summary": "string",
  "recommendations": ["string", "string", "string"]
}
"""
    
    # Strip heavy arrays if they exist in metrics to save tokens
    safe_metrics = {k: v for k, v in metrics.items() if k != 'details' or not isinstance(v.get('alignment'), list)}

    user_prompt = f"Please analyze these reading metrics and generate insights:\n\n{json.dumps(safe_metrics, indent=2)}"

    try:
        start_time = time.time()
        logger.info("Sending request to GitHub Models API (gpt-4o-mini)...")
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            timeout=15.0 # Ensure we don't block forever
        )
        
        duration = time.time() - start_time
        logger.info(f"GitHub Models API responded in {duration:.2f} seconds.")
        
        content = response.choices[0].message.content
        insights = json.loads(content)
        
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        # Ensure strict structure
        if "summary" not in insights or "recommendations" not in insights:
            raise ValueError("Invalid JSON structure from API")
            
        return insights, ai_metadata

    except Exception as e:
        logger.error(f"Failed to generate AI insights: {str(e)}")
        ai_metadata["provider"] = "rule-based"
        ai_metadata["model"] = "fallback"
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return generate_fallback_insights(metrics), ai_metadata

def generate_comprehension_insights(metrics: dict) -> tuple[dict, dict]:
    """
    Calls GitHub Models (gpt-4o-mini) to generate reading comprehension insights based on category scores.
    Returns (insights_data, ai_metadata).
    """
    token = os.environ.get("GITHUB_TOKEN")
    
    ai_metadata = {
        "provider": "github-models",
        "model": "gpt-4o-mini",
        "generatedAt": None
    }

    if not token or token == "your_token_here" or not OpenAI:
        logger.warning("GitHub Models API token not found or invalid. Using fallback.")
        ai_metadata["provider"] = "rule-based"
        ai_metadata["model"] = "local-rules"
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return generate_fallback_comprehension_insights(metrics), ai_metadata

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=token,
    )

    system_prompt = """
You are an educational reading comprehension assessment assistant.
Your role is to analyze a student's reading comprehension scores across different categories (Main Idea, Vocabulary, Detail Recall, Inference, Critical Thinking) and generate constructive educational feedback.
Rules:
- Educational tone only.
- No medical advice or diagnosis.
- Maximum 80 words for summary.
- Exactly 3 actionable recommendations based specifically on their weakest categories.
- Recommendations must be practical and student-friendly.
Return JSON only.
Required format:
{
  "summary": "string",
  "recommendations": ["string", "string", "string"]
}
"""
    
    user_prompt = f"Please analyze these comprehension category scores and generate insights:\n\n{json.dumps(metrics, indent=2)}"

    try:
        start_time = time.time()
        logger.info("Sending comprehension request to GitHub Models API (gpt-4o-mini)...")
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            timeout=15.0 
        )
        
        duration = time.time() - start_time
        logger.info(f"GitHub Models API responded in {duration:.2f} seconds.")
        
        content = response.choices[0].message.content
        insights = json.loads(content)
        
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        if "summary" not in insights or "recommendations" not in insights:
            raise ValueError("Invalid JSON structure from API")
            
        return insights, ai_metadata

    except Exception as e:
        logger.error(f"Failed to generate comprehension AI insights: {str(e)}")
        ai_metadata["provider"] = "rule-based"
        ai_metadata["model"] = "fallback"
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return generate_fallback_comprehension_insights(metrics), ai_metadata
