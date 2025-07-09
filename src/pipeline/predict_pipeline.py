from email.header import Header
import sys
import pandas as pd
from src.exception import CustomException
from src.logger import logging

from src.utils import load_object

class PredictPipeline:
    def __init__(self):
        pass
    
    def predict(self, features):
        try:
            model_path = "artifacts/model.pkl"
            preprocessor_path = "artifacts/preprocessor.pkl"
            
            logging.info("Loading model and preprocessor")
            model = load_object(file_path=model_path)
            preprocessor = load_object(file_path=preprocessor_path)
            
            logging.info("Preprocessing features")
            data_scaled = preprocessor.transform(features)
            
            logging.info("Making predictions")
            predictions = model.predict(data_scaled)
            
            return predictions
        
        except Exception as e:
            raise CustomException(e, sys)
    
class CustomData:
    def __init__(self,
        gender: str,
        race_ethnicity: str,
        parental_level_of_education: str,
        lunch: str,
        test_preparation_course: str,
        writing_score: float,
        reading_score: float):

        self.gender = gender
        self.race_ethnicity = race_ethnicity
        self.parental_level_of_education = parental_level_of_education
        self.lunch = lunch
        self.test_preparation_course = test_preparation_course
        self.writing_score = writing_score
        self.reading_score = reading_score
        
    def get_data_as_dataframe(self):
        try:
            custom_data_input_dict = {
                "gender": [self.gender],
                "race/ethnicity": [self.race_ethnicity],
                "parental level of education": [self.parental_level_of_education],
                "lunch": [self.lunch],
                "test preparation course": [self.test_preparation_course],
                "writing score": [self.writing_score],
                "reading score": [self.reading_score],
            }
            return pd.DataFrame(custom_data_input_dict, index=[0])
        except Exception as e:
            raise CustomException(e, sys)