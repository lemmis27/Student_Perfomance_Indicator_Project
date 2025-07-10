from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prediction_service import StudentPerformancePredictor
import os
from typing import List, Dict, Optional

# Define the input schema using Pydantic
class StudentInput(BaseModel):
    gender: str
    race_ethnicity: str
    parental_level_of_education: str
    lunch: str
    test_preparation_course: str
    math_score: float = 0
    reading_score: float = 0
    writing_score: float = 0

class HistoryItem(BaseModel):
    result: float
    # add more fields if needed

class RecommendationRequest(BaseModel):
    history: List[HistoryItem]

class ChatRequest(BaseModel):
    history: List[HistoryItem]
    question: Optional[str] = None

app = FastAPI(
    title="Student Performance Prediction API",
    description="API for predicting student performance using a trained ML model.",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join("artifacts", "model.pkl")
predictor = StudentPerformancePredictor(MODEL_PATH)

@app.post("/predict")
def predict(input_data: StudentInput):
    try:
        input_dict = input_data.dict()
        prediction = predictor.predict(input_dict)
        return {"prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend/ai")
def ai_recommendation(req: RecommendationRequest):
    if not req.history:
        return {"recommendation": "No history found. Please make a prediction first!"}
    last_score = req.history[-1].result
    if last_score >= 85:
        rec = "Excellent! Keep up the great work and help others."
    elif last_score >= 70:
        rec = "Good job! Focus on your weaker areas for even better results."
    elif last_score >= 50:
        rec = "You can improve! Try more practice and consider a test prep course."
    else:
        rec = "Don't be discouraged. Seek help from teachers and practice regularly!"
    return {"recommendation": rec}

@app.post("/recommend/chat")
def ai_chat(req: ChatRequest):
    if not req.history:
        return {"answer": "No history found. Please make a prediction first!"}
    last_score = req.history[-1].result
    if req.question:
        q = req.question.lower()
        if "math" in q:
            return {"answer": "To improve in math, practice regularly, review your mistakes, and try explaining concepts to others."}
        elif "motivation" in q:
            return {"answer": "Stay motivated by setting small goals, celebrating progress, and studying with friends if possible!"}
        elif "study tip" in q or "study tips" in q:
            return {"answer": "Use active recall, spaced repetition, and take regular breaks for the best study results."}
        elif "time management" in q:
            return {"answer": "Create a study schedule, prioritize tasks, and avoid multitasking to manage your time effectively."}
        elif "exam" in q and ("stress" in q or "anxiety" in q):
            return {"answer": "For exam stress, prepare early, practice relaxation techniques, and get enough sleep before the test."}
        elif "reading" in q:
            return {"answer": "To improve reading, read a variety of materials, summarize what you read, and discuss with others."}
        elif "writing" in q:
            return {"answer": "To improve writing, practice regularly, plan your essays, and review grammar and structure."}
        elif "science" in q:
            return {"answer": "For science, focus on understanding concepts, doing experiments, and connecting theory to real life."}
        else:
            return {"answer": "That's a great question! Try to break your problem into smaller steps, ask for help when needed, and remember: progress is more important than perfection."}
    if last_score >= 85:
        rec = "Excellent! Keep up the great work and help others."
    elif last_score >= 70:
        rec = "Good job! Focus on your weaker areas for even better results."
    elif last_score >= 50:
        rec = "You can improve! Try more practice and consider a test prep course."
    else:
        rec = "Don't be discouraged. Seek help from teachers and practice regularly!"
    return {"answer": rec} 