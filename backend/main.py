from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid

from services.whisper_service import transcribe_audio
from services.scoring_service import analyze_transcript

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/reading/process")
async def process_reading(
    audio: UploadFile = File(...),
    expected_text: str = Form(...),
    duration_seconds: float = Form(...),
    passage_category: str = Form(...),
    passage_difficulty: str = Form(...)
):
    temp_file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{audio.filename}")
    
    try:
        # Save audio file temporarily
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
            
        # 1. Transcribe with Whisper
        transcription_result = transcribe_audio(temp_file_path)
        actual_text = transcription_result["text"]
        confidence = transcription_result["confidence"]
        
        # 2. Score the transcript against expected text
        scoring_result = analyze_transcript(expected_text, actual_text, duration_seconds)
        
        # 3. Calculate Performance Level
        accuracy = scoring_result.get("accuracy", 0)
        if accuracy > 95:
            performance_level = "Excellent"
        elif accuracy >= 85:
            performance_level = "Good"
        else:
            performance_level = "Needs Attention"
            
        # 4. Generate Insights
        insight_metrics = {
            "accuracy": accuracy,
            "coverage": scoring_result.get("coverage", 0),
            "wpm": scoring_result.get("wpm", 0),
            "confidence": confidence,
            "missingWords": scoring_result.get("details", {}).get("missingWords", 0),
            "extraWords": scoring_result.get("details", {}).get("extraWords", 0),
            "substitutedWords": scoring_result.get("details", {}).get("substitutedWords", 0),
            "category": passage_category,
            "difficulty": passage_difficulty,
            "performanceLevel": performance_level
        }
        
        from services.insights_service import generate_reading_insights
        insights_data, ai_metadata = generate_reading_insights(insight_metrics)
        
        # Return composite result
        return {
            "transcript": {
                "text": actual_text,
                "confidence": confidence,
                "status": "success"
            },
            "metrics": scoring_result,
            "insights": insights_data,
            "ai": ai_metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 3. Delete temporary audio file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

from pydantic import BaseModel
from typing import Dict, Any

class ComprehensionMetrics(BaseModel):
    metrics: Dict[str, Any]

@app.post("/api/comprehension/insights")
async def generate_comp_insights(data: ComprehensionMetrics):
    try:
        from services.insights_service import generate_comprehension_insights
        insights_data, ai_metadata = generate_comprehension_insights(data.metrics)
        return {
            "insights": insights_data,
            "ai": ai_metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
