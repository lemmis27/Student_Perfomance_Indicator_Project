# prediction_service.py
import numpy as np
from src.utils import load_object
from src.logger import logging
from src.exception import CustomException
import sys
import pandas as pd

# Add mappings for categorical variables
GENDER_MAP = {"male": 0, "female": 1}
RACE_MAP = {
    "group a": 0,
    "group b": 1,
    "group c": 2,
    "group d": 3,
    "group e": 4,
}
PARENT_EDU_MAP = {
    "some high school": 0,
    "high school": 1,
    "some college": 2,
    "associate's degree": 3,
    "bachelor's degree": 4,
    "master's degree": 5,
}
LUNCH_MAP = {"standard": 0, "free/reduced": 1}
TEST_PREP_MAP = {"none": 0, "completed": 1}

# Add this mapping at the top of the file (after other mappings)
FRONTEND_TO_MODEL_KEYS = {
    "gender": "gender",
    "race_ethnicity": "race/ethnicity",
    "parental_level_of_education": "parental level of education",
    "lunch": "lunch",
    "test_preparation_course": "test preparation course",
    "math_score": "math score",
    "reading_score": "reading score",
    "writing_score": "writing score"
}

class StudentPerformancePredictor:
    def __init__(self, model_path: str):
        try:
            # Load model artifacts
            self.model_artifacts = load_object(model_path)
            self.model = self.model_artifacts['model']
            self.feature_names = self.model_artifacts.get('feature_names', [])
            self.categorical_features = self.model_artifacts.get('categorical_features', [])
            # Load preprocessor
            self.preprocessor = load_object('artifacts/preprocessor.pkl')
            
            logging.info("Model artifacts loaded successfully")
            logging.info(f"Model expects features: {self.feature_names}")
            logging.info(f"Model input shape: {getattr(self.model, 'n_features_in_', 'unknown')}")
            
        except Exception as e:
            logging.error(f"Error loading model: {str(e)}")
            raise CustomException(e, sys)

    def prepare_input(self, input_data: dict) -> np.ndarray:
        """Convert input dictionary to model-ready numpy array using preprocessor"""
        try:
            # Map frontend keys to model keys
            model_input = {}
            for frontend_key, model_key in FRONTEND_TO_MODEL_KEYS.items():
                if frontend_key in input_data:
                    model_input[model_key] = input_data[frontend_key]
            # Build DataFrame with a single row
            df = pd.DataFrame([model_input])
            # Transform using preprocessor
            features = self.preprocessor.transform(df)
            return features
        except Exception as e:
            logging.error(f"Error preparing input: {str(e)}")
            raise CustomException(e, sys)

    def predict(self, input_data: dict) -> float:
        """Make prediction from input data dictionary"""
        try:
            # Prepare input features
            input_features = self.prepare_input(input_data)
            # Make prediction
            prediction = self.model.predict(input_features)[0]
            # Clip to reasonable score range
            return max(0, min(100, round(prediction, 2)))
        except Exception as e:
            logging.error(f"Prediction failed: {str(e)}")
            raise CustomException(e, sys)