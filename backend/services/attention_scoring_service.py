import os
import json
import time
import logging
import statistics
from typing import Dict, Any, Tuple

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

logger = logging.getLogger(__name__)

def generate_fallback_attention_insights(scores: Dict[str, float]) -> dict:
    """Generate rule-based insights if the API call fails."""
    logger.info("Using fallback rule-based attention insights generator.")
    
    overall = scores.get('overallAttention', 0)
    
    if overall >= 85:
        strengths = [
            "Excellent ability to maintain focus over multiple tasks.",
            "Strong processing speed when scanning for visual targets."
        ]
        areas_for_improvement = [
            "Further challenge selective attention with highly distracting environments."
        ]
        recs = [
            "Continue engaging in complex, multi-step visual puzzles.",
            "Practice speed-reading exercises to further enhance scanning efficiency.",
            "Use timed sorting games to maintain rapid target detection skills."
        ]
    elif overall >= 60:
        strengths = [
            "Good general understanding of visual search tasks.",
            "Consistent performance in pattern matching without major lapses."
        ]
        areas_for_improvement = [
            "Occasional susceptibility to distractors during rapid scanning.",
            "Reaction time fluctuates slightly on continuous tasks."
        ]
        recs = [
            "Practice \"Find the Difference\" games to improve distractor filtering.",
            "Engage in short, focused visual search activities (like word searches) for 5-10 minutes daily.",
            "Take frequent, short breaks during demanding tasks to reset visual focus."
        ]
    else:
        strengths = [
            "Able to identify target patterns when given sufficient time.",
            "Shows effort and persistence through varied attention tasks."
        ]
        areas_for_improvement = [
            "Reaction time is notably delayed during visual scanning.",
            "High rate of false positives when distractors are present."
        ]
        recs = [
            "Start with simpler visual matching games with fewer items on screen.",
            "Practice focusing on one specific task at a time without background distractions.",
            "Use a pointer or finger to guide visual scanning across the page or screen."
        ]

    return {
        "strengths": strengths,
        "areasForImprovement": areas_for_improvement,
        "actionableRecommendations": recs
    }

def generate_attention_insights(metrics: dict, scores: dict) -> Tuple[dict, dict]:
    """
    Calls GitHub Models (gpt-4o-mini) to generate attention insights.
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
        return generate_fallback_attention_insights(scores), ai_metadata

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=token,
    )

    system_prompt = """
You are an educational assessment assistant specializing in visual attention.
Your role is to analyze visual search, pattern matching, and rapid scanning metrics to generate constructive educational feedback.
Rules:
- Educational tone only.
- No medical advice.
- No diagnosis.
- Do not mention ADHD, ADD, Dyslexia, or any other learning disability.
- Ensure exactly 3 actionable recommendations.
- Keep feedback educational, student-friendly, and practical.
Return JSON only.
Required format:
{
  "strengths": ["string", "string"],
  "areasForImprovement": ["string", "string"],
  "actionableRecommendations": ["string", "string", "string"]
}
"""
    
    # Send a summarized version to avoid massive token usage
    payload = {
        "scores": scores,
        "task1_target_detection": {"correct": metrics.get("task1", {}).get("correctClicks"), "false_clicks": metrics.get("task1", {}).get("falseClicks")},
        "task2_symbol_search": {"accuracy": metrics.get("task2", {}).get("accuracy"), "distractor_clicks": metrics.get("task2", {}).get("distractorClicks")},
        "task3_pattern_matching": {"decision_accuracy": metrics.get("task3", {}).get("decisionAccuracy")},
        "task4_rapid_scanning": {"accuracy": metrics.get("task4", {}).get("accuracy"), "false_positives": metrics.get("task4", {}).get("falsePositives")}
    }

    user_prompt = f"Please analyze these attention metrics and generate insights:\n\n{json.dumps(payload, indent=2)}"

    try:
        start_time = time.time()
        logger.info("Sending request to GitHub Models API (gpt-4o-mini) for Attention...")
        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=500
        )
        
        elapsed = time.time() - start_time
        logger.info(f"Received response from API in {elapsed:.2f} seconds.")
        
        content = response.choices[0].message.content
        insights = json.loads(content)
        
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return insights, ai_metadata

    except Exception as e:
        logger.error(f"Error calling GitHub Models API: {e}", exc_info=True)
        ai_metadata["provider"] = "rule-based"
        ai_metadata["model"] = "local-rules"
        ai_metadata["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return generate_fallback_attention_insights(scores), ai_metadata

def calculate_attention_scores(metrics: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculates attention scores based on the specified formula:
    Attention Score = 40% Accuracy, 30% Reaction Time, 20% Consistency, 10% Distractor Filtering
    """
    task1 = metrics.get('task1', {})
    task2 = metrics.get('task2', {})
    task3 = metrics.get('task3', {})
    task4 = metrics.get('task4', {})

    # 1. Accuracy Component (0-100)
    t1_acc = min(100, max(0, (task1.get('correctClicks', 0) / max(1, task1.get('correctClicks', 0) + task1.get('missedTargets', 0))) * 100))
    t2_acc = task2.get('accuracy', 0)
    t3_acc = task3.get('decisionAccuracy', 0)
    t4_acc = task4.get('accuracy', 0)
    avg_accuracy = (t1_acc + t2_acc + t3_acc + t4_acc) / 4.0

    # 2. Reaction Time Component (0-100, lower RT is better)
    # Assume 400ms is perfect (100), 1500ms is poor (0)
    def normalize_rt(rt: float) -> float:
        if rt <= 400: return 100.0
        if rt >= 1500: return 0.0
        return 100.0 - ((rt - 400) / 1100.0) * 100.0

    t1_rt = sum(task1.get('reactionTimes', [])) / max(1, len(task1.get('reactionTimes', []))) if task1.get('reactionTimes') else 1500
    t3_rt = sum(task3.get('responseTimes', [])) / max(1, len(task3.get('responseTimes', []))) if task3.get('responseTimes') else 1500
    t4_rt = sum(task4.get('reactionTimes', [])) / max(1, len(task4.get('reactionTimes', []))) if task4.get('reactionTimes') else 1500
    
    rt_score = (normalize_rt(t1_rt) + normalize_rt(t3_rt) + normalize_rt(t4_rt)) / 3.0

    # 3. Consistency Component (0-100)
    # Lower standard deviation in RT is better
    all_rts = task1.get('reactionTimes', []) + task3.get('responseTimes', []) + task4.get('reactionTimes', [])
    if len(all_rts) > 2:
        rt_std = statistics.stdev(all_rts)
        # Assume < 100ms std is perfect (100), > 600ms std is poor (0)
        consistency_score = 100.0 - min(100.0, max(0.0, ((rt_std - 100) / 500.0) * 100.0))
    else:
        consistency_score = 50.0

    # 4. Distractor Filtering Component (0-100)
    # Fewer false clicks / distractors means higher score
    t1_fc = task1.get('falseClicks', 0)
    t2_dc = task2.get('distractorClicks', 0)
    t4_fp = task4.get('falsePositives', 0)
    total_distractors = t1_fc + t2_dc + t4_fp
    
    # Assume 0 distractors is 100, 15+ distractors is 0
    distractor_score = max(0.0, 100.0 - (total_distractors * (100.0 / 15.0)))

    # Final Overall Score
    overall_attention = (avg_accuracy * 0.40) + (rt_score * 0.30) + (consistency_score * 0.20) + (distractor_score * 0.10)

    # Sub-scores
    visual_search = (t1_acc + t2_acc) / 2.0
    selective_attention = distractor_score
    processing_speed = rt_score

    return {
        "overallAttention": round(overall_attention, 1),
        "visualSearch": round(visual_search, 1),
        "processingSpeed": round(processing_speed, 1),
        "selectiveAttention": round(selective_attention, 1),
        "attentionConsistency": round(consistency_score, 1)
    }

def process_attention_assessment(metrics: Dict[str, Any]) -> Dict[str, Any]:
    scores = calculate_attention_scores(metrics)
    insights, ai_meta = generate_attention_insights(metrics, scores)
    
    return {
        "scores": scores,
        "insights": insights,
        "ai_metadata": ai_meta
    }
