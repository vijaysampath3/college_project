import os
import json
import pickle
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Setup OpenAI client for GitHub Models
client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=os.environ.get("GITHUB_TOKEN", "")
)

# Load XGBoost Model
model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "adhd_xgboost_model.pkl")
features_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "adhd_feature_names.pkl")

try:
    with open(model_path, 'rb') as f:
        adhd_model = pickle.load(f)
    with open(features_path, 'rb') as f:
        feature_names = pickle.load(f)
except Exception as e:
    print(f"Warning: Failed to load ADHD model files: {e}")
    adhd_model = None
    feature_names = []

def run_adhd_inference(metrics: dict):
    if not adhd_model or not feature_names:
        # Fallback if model missing
        return {
            "predictionClass": 0,
            "predictionProbability": 0.15,
            "adhdModelVersion": "fallback_v1",
            "featuresUsed": feature_names
        }
        
    # Map metrics dict to feature array in correct order
    try:
        row = [metrics.get(fname, 0.0) for fname in feature_names]
        df = pd.DataFrame([row], columns=feature_names)
        
        # predict_proba returns array of [prob_class_0, prob_class_1]
        probs = adhd_model.predict_proba(df)[0]
        prob_adhd = float(probs[1])
        pred_class = int(prob_adhd > 0.5)
        
        return {
            "predictionClass": pred_class,
            "predictionProbability": prob_adhd,
            "adhdModelVersion": "xgboost_v1",
            "featuresUsed": feature_names
        }
    except Exception as e:
        print(f"Error running ADHD inference: {e}")
        return {
            "predictionClass": 0,
            "predictionProbability": 0.0,
            "adhdModelVersion": "error",
            "featuresUsed": []
        }

def generate_adhd_insights(metrics: dict, inference_result: dict):
    prob_percent = round(inference_result.get("predictionProbability", 0) * 100)
    risk_level = "High" if prob_percent >= 70 else "Moderate" if prob_percent >= 40 else "Low"
    
    prompt = f"""
You are an expert cognitive learning specialist.
Analyze the following Continuous Performance Test (CPT) results and provide actionable, educational insights.
Do NOT diagnose ADHD or use medical diagnostic language. Focus on attention consistency, focus, impulsivity, and learning strategies.

Performance Data:
- Omissions (missed targets): {metrics.get('Raw Score Omissions')}
- Commissions (impulsive presses): {metrics.get('Raw Score Commissions')}
- Average Reaction Time: {metrics.get('Raw Score HitRT')} ms
- Reaction Time Variability (HitSE): {metrics.get('Raw Score HitSE')}
- Perseverations (<100ms presses): {metrics.get('Raw Score Perseverations')}
- Detectability (D-Prime): {metrics.get('Raw Score DPrime')}

Model Analysis:
- Attention Risk Level: {risk_level}
- Model Confidence Index: {metrics.get('Adhd Confidence Index')}%

Output must be ONLY valid JSON matching this schema exactly:
{{
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "areasForImprovement": [
    "Area 1",
    "Area 2"
  ],
  "actionableRecommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
}}
"""
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert cognitive learning specialist. Always respond in valid JSON."},
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
        print(f"Error generating ADHD insights: {e}")
        return {
            "strengths": ["Completed the assessment successfully."],
            "areasForImprovement": ["Attention consistency can vary over time."],
            "actionableRecommendations": [
                "Take short breaks during long tasks.",
                "Practice mindfulness exercises to improve focus.",
                "Ensure a distraction-free learning environment."
            ]
        }
