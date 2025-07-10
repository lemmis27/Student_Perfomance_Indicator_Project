from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prediction_service import StudentPerformancePredictor
import os

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