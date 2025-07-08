import os
import sys
import numpy as np
from dataclasses import dataclass
import time

from catboost import CatBoostRegressor
from sklearn.ensemble import(
    RandomForestRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor
)
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.svm import SVR
from xgboost import XGBRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor
from scipy.stats import uniform, randint

from src.logger import logging
from src.exception import CustomException

from src.utils import save_object, evaluate_model

@dataclass
class ModelTrainerConfig:
    trained_model_file_path = os.path.join("artifacts", "model.pkl")

class ModelTrainer:
    def __init__(self):
        self.model_trainer_config = ModelTrainerConfig()
        
    def initiate_model_trainer(self, train_array, test_array):
        logging.info("Model Trainer started")
        try:
            logging.info("Splitting training and testing data")
            X_train, y_train, X_test, y_test=(
                train_array[:, :-1], 
                train_array[:, -1],
                test_array[:, :-1], 
                test_array[:, -1]
            )
            logging.info("Training and Testing data split completed")

            models = {
                "LinearRegression": LinearRegression(),
                "DecisionTreeRegressor": DecisionTreeRegressor(),
                "RandomForestRegressor": RandomForestRegressor(),
                "GradientBoostingRegressor": GradientBoostingRegressor(),
                "HistGradientBoostingRegressor": HistGradientBoostingRegressor(),
                "XGBRegressor": XGBRegressor(),
                "CatBoostRegressor": CatBoostRegressor(verbose=False),
                "SVR": SVR(),
                "KNeighborsRegressor": KNeighborsRegressor()
            }

            # Optimized parameter grids - reduced search space for faster training
            param = {
                "LinearRegression": {},  # No parameters to tune
                
                "DecisionTreeRegressor": {
                    'max_depth': [5, 10, 20, None],  # Reduced from 6 to 4 options
                    'min_samples_split': [2, 5, 10],  # Fixed values instead of randint
                    'min_samples_leaf': [1, 2, 4],   # Fixed values instead of randint
                    'max_features': ['sqrt', None]    # Reduced from 3 to 2 options
                },
                
                "RandomForestRegressor": {
                    'n_estimators': [100, 200, 300],     # Fixed values instead of randint
                    'max_depth': [10, 20, None],         # Reduced options
                    'min_samples_split': [2, 5],         # Reduced options
                    'min_samples_leaf': [1, 2],          # Reduced options
                    'max_features': ['sqrt', None],      # Reduced options
                    'bootstrap': [True]                   # Only use bootstrap=True for faster training
                },
                
                "GradientBoostingRegressor": {
                    'n_estimators': [100, 200],          # Reduced options
                    'learning_rate': [0.01, 0.1, 0.2],   # Fixed values instead of uniform
                    'max_depth': [3, 6],                  # Reduced options
                    'min_samples_split': [2, 10],        # Reduced options
                    'subsample': [0.8, 1.0]              # Reduced options
                },
                
                "HistGradientBoostingRegressor": {
                    'learning_rate': [0.01, 0.1, 0.2],   # Fixed values
                    'max_iter': [100, 200],              # Reduced options
                    'max_depth': [3, 6],                 # Reduced options
                    'min_samples_leaf': [1, 5],         # Reduced options
                    'l2_regularization': [0, 0.1]       # Reduced options
                },
                
                "XGBRegressor": {
                    'n_estimators': [100, 200],          # Reduced options
                    'learning_rate': [0.01, 0.1, 0.2],   # Fixed values
                    'max_depth': [3, 6],                  # Reduced options
                    'min_child_weight': [1, 3],          # Reduced options
                    'subsample': [0.8, 1.0],            # Reduced options
                    'colsample_bytree': [0.8, 1.0]      # Reduced options
                },
                
                "CatBoostRegressor": {
                    'iterations': [100, 200],            # Reduced options
                    'learning_rate': [0.01, 0.1, 0.2],   # Fixed values
                    'depth': [4, 6],                     # Reduced options
                    'l2_leaf_reg': [1, 3]               # Reduced options
                },
                
                "SVR": {
                    'C': [0.1, 1, 10],                  # Fixed values instead of uniform
                    'epsilon': [0.01, 0.1],             # Reduced options
                    'kernel': ['rbf', 'linear'],        # Only best performing kernels
                    'gamma': ['scale', 'auto']           # Simplified gamma options
                },
                
                "KNeighborsRegressor": {
                    'n_neighbors': [3, 5, 7, 10],       # Fixed values instead of randint
                    'weights': ['uniform', 'distance'],
                    'p': [1, 2]
                }
            }

            logging.info("Models initialized with optimized hyperparameter grids")
            logging.info("Starting model training and evaluation with hyperparameter tuning")
            
            # Log hyperparameter tuning details
            total_combinations = 0
            for model_name, params in param.items():
                if params:  # Skip empty param dict
                    combinations = 1
                    for param_values in params.values():
                        combinations *= len(param_values)
                    total_combinations += combinations
                    logging.info(f"{model_name}: {combinations} parameter combinations to test")
                else:
                    logging.info(f"{model_name}: No hyperparameters to tune")
            
            logging.info(f"Total hyperparameter combinations across all models: {total_combinations}")
            
            # Start timing
            start_time = time.time()
            
            model_report: dict = evaluate_model(
                X_train=X_train, 
                y_train=y_train, 
                X_test=X_test, 
                y_test=y_test, 
                models=models, 
                param=param
            )
            
            # End timing
            end_time = time.time()
            training_time = end_time - start_time
            
            logging.info(f"Hyperparameter tuning completed in {training_time:.2f} seconds")
            logging.info(f"Model evaluation results: {model_report}")

            best_model_score = max(sorted(model_report.values()))

            best_model_name = list(model_report.keys())[list(model_report.values()).index(best_model_score)]
            
            best_model = models[best_model_name]
            
            logging.info(f"Best performing model: {best_model_name}")
            logging.info(f"Best model score: {best_model_score:.4f}")
            
            # Log all model performances for comparison
            sorted_models = sorted(model_report.items(), key=lambda x: x[1], reverse=True)
            logging.info("Model performance ranking:")
            for i, (model_name, score) in enumerate(sorted_models, 1):
                logging.info(f"{i}. {model_name}: {score:.4f}")
            
            if best_model_score < 0.6:
                logging.warning(f"Best model score ({best_model_score:.4f}) is below threshold (0.6)")
                raise CustomException("No best model found")
            
            logging.info(f"Best model found: {best_model_name} with score: {best_model_score:.4f}")
            
            save_object(
                file_path=self.model_trainer_config.trained_model_file_path,
                obj=best_model
            )
            logging.info("Best model saved successfully")
            
            predicted = best_model.predict(X_test)
            r2_square = r2_score(y_test, predicted)
            
            logging.info(f"Final R² score on test set: {r2_square:.4f}")
            logging.info(f"Model training pipeline completed successfully")
            
            return r2_square
            
        except Exception as e:
            logging.error(f"Error in model training: {str(e)}")
            raise CustomException(e, sys)
        