from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prediction_service import StudentPerformancePredictor
import os
from typing import List, Dict, Optional
import cohere
from dotenv import load_dotenv
load_dotenv()

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

class ChatMessage(BaseModel):
    role: str  # "user" or "ai"
    content: str
    time: Optional[str] = None

class ChatRequest(BaseModel):
    history: List[HistoryItem]
    chat_history: Optional[List[ChatMessage]] = None
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

COHERE_API_KEY = os.getenv("COHERE_API_KEY", "your-cohere-api-key")  # Set your API key in env or here
go_cohere = cohere.Client(COHERE_API_KEY)

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

def build_prompt(score_history, chat_history, user_question):
    prompt = (
        "You are a helpful, friendly AI tutor for students. "
        "You know the user's recent predicted scores: "
        f"{[s['result'] for s in score_history]}. "
        "Here is the conversation so far:\n"
    )
    if chat_history:
        for msg in chat_history:
            role = "User" if msg.role == "user" else "AI"
            prompt += f"{role}: {msg.content}\n"
    prompt += (
        f"User: {user_question}\n"
        "AI (be detailed, clarify if needed, and encourage the user):"
    )
    return prompt

@app.post("/recommend/chat")
def ai_chat(req: ChatRequest):
    if not req.history:
        return {"answer": "No history found. Please make a prediction first!"}
    if not req.question:
        return {"answer": "Please enter a question for the AI tutor."}

    # Convert Pydantic models to dicts if needed
    score_history = [h.dict() if hasattr(h, "dict") else h for h in req.history]
    chat_history = req.chat_history if req.chat_history else []

    prompt = build_prompt(score_history, chat_history, req.question)

    try:
        response = go_cohere.generate(
            model='command',  # Use 'command' for free tier
            prompt=prompt,
            max_tokens=300,
            temperature=0.8,
            stop_sequences=["User:"]
        )
        answer = response.generations[0].text.strip()
        if not answer:
            answer = "I'm not sure I understood your question. Could you please rephrase or provide more details?"
        return {"answer": answer}
    except Exception as e:
        return {"answer": f"Sorry, I couldn't get a response from the AI. ({str(e)})"} 