from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid

from services.whisper_service import transcribe_audio
from services.scoring_service import analyze_transcript
from routers.typing import router as typing_router
from routers.adhd import router as adhd_router
from routers import attention, focus, learning_behaviour, reports, recommendations, activities, learning_paths, schools, teachers, students, assignments, parents, admin_dashboard, comparison_analytics, teacher_dashboard, teacher_students, teacher_parents

app = FastAPI(title="NeuroLearn API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(typing_router, prefix="/api/typing", tags=["typing"])
app.include_router(adhd_router, prefix="/api/adhd", tags=["adhd"])
app.include_router(attention.router)
app.include_router(focus.router)
app.include_router(learning_behaviour.router)

app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(learning_paths.router, prefix="/api/learning-paths", tags=["learning_paths"])
app.include_router(schools.router, prefix="/api/schools", tags=["schools"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["teachers"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["assignments"])
app.include_router(parents.router, prefix="/api/parents", tags=["parents"])
app.include_router(admin_dashboard.router, prefix="/api/admin/dashboard", tags=["admin_dashboard"])
app.include_router(comparison_analytics.router, prefix="/api/admin/comparison", tags=["comparison_analytics"])
app.include_router(teacher_dashboard.router, prefix="/api/teacher", tags=["teacher_dashboard"])
app.include_router(teacher_students.router, prefix="/api/teacher/students", tags=["teacher_students"])
app.include_router(teacher_parents.router, prefix="/api/teacher/parents", tags=["teacher_parents"])

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
