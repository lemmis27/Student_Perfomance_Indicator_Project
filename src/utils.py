import os
import sys

import pandas as pd
import numpy as np
import dill
import time
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint
from src.exception import CustomException
from src.logger import logging

def save_object(file_path, obj):
    try:
        dir_path = os.path.dirname(file_path)
       
        os.makedirs(dir_path, exist_ok=True)
       
        with open(file_path, "wb") as file_obj:
            dill.dump(obj, file_obj)
           
    except Exception as e:
        raise CustomException(e, sys)
    
    


def evaluate_model(X_train, y_train, X_test, y_test, models, param):
    """
    Enhanced evaluate_model with comprehensive logging for hyperparameter tuning
    """
    try:
        report = {}
        
        logging.info("Starting model evaluation with hyperparameter tuning...")
        total_start_time = time.time()
       
        for i in range(len(list(models))):
            model = list(models.values())[i]
            model_name = list(models.keys())[i]
            param_grid = param[model_name]
            
            logging.info(f"Evaluating {model_name}...")
            model_start_time = time.time()
           
            # Handle LinearRegression which has no hyperparameters
            if model_name == "LinearRegression" or not param_grid:
                # No hyperparameters to tune, just fit the model
                logging.info(f"{model_name}: No hyperparameters to tune, fitting model directly")
                model.fit(X_train, y_train)
                y_test_pred = model.predict(X_test)
                test_model_score = r2_score(y_test, y_test_pred)
                report[model_name] = test_model_score
                
                model_end_time = time.time()
                model_time = model_end_time - model_start_time
                
                logging.info(f"{model_name}: Score = {test_model_score:.4f}, Time = {model_time:.2f}s")
                print(f"{model_name}: Score = {test_model_score:.4f} (No hyperparameter tuning)")
                continue
           
            # Calculate total combinations for this model
            total_combinations = 1
            for param_values in param_grid.values():
                total_combinations *= len(param_values)
            
            n_iter = min(15, total_combinations)  # Don't search more than available combinations
            
            logging.info(f"{model_name}: {total_combinations} possible combinations, testing {n_iter} iterations")
            
            # Perform hyperparameter tuning
            search = RandomizedSearchCV(
                estimator=model,
                param_distributions=param_grid,
                n_iter=n_iter,  
                cv=3,
                scoring='r2',
                n_jobs=-1,
                random_state=42,
                verbose=0
            )
           
            tuning_start_time = time.time()
            search.fit(X_train, y_train)
            tuning_end_time = time.time()
            tuning_time = tuning_end_time - tuning_start_time
           
            # Get the best model
            best_model = search.best_estimator_
            
            # Log best parameters
            logging.info(f"{model_name}: Best parameters found: {search.best_params_}")
            logging.info(f"{model_name}: Best cross-validation score: {search.best_score_:.4f}")
            logging.info(f"{model_name}: Hyperparameter tuning completed in {tuning_time:.2f}s")
           
            # Predict on test set
            y_test_pred = best_model.predict(X_test)
            test_model_score = r2_score(y_test, y_test_pred)
           
            # Save the best model
            models[model_name] = best_model
           
            report[model_name] = test_model_score
            
            model_end_time = time.time()
            model_time = model_end_time - model_start_time
            
            logging.info(f"{model_name}: Final test score = {test_model_score:.4f}, Total time = {model_time:.2f}s")
            
            # Log performance difference between CV and test
            cv_test_diff = abs(search.best_score_ - test_model_score)
            if cv_test_diff > 0.1:
                logging.warning(f"{model_name}: Large difference between CV score ({search.best_score_:.4f}) and test score ({test_model_score:.4f})")
            else:
                logging.info(f"{model_name}: CV and test scores are consistent (difference: {cv_test_diff:.4f})")
            
            # Log top 3 parameter combinations if available
            if hasattr(search, 'cv_results_'):
                results_df = pd.DataFrame(search.cv_results_)
                top_3 = results_df.nlargest(3, 'mean_test_score')[['params', 'mean_test_score', 'std_test_score']]
                logging.info(f"{model_name}: Top 3 parameter combinations:")
                for idx, row in top_3.iterrows():
                    logging.info(f"  Score: {row['mean_test_score']:.4f} (+/- {row['std_test_score']:.4f}), Params: {row['params']}")
            
            logging.info(f"{model_name}: Evaluation completed")
            print(f"{model_name}: Best Score = {test_model_score:.4f}")
        
        total_end_time = time.time()
        total_time = total_end_time - total_start_time
        
        logging.info(f"All models evaluated in {total_time:.2f}s")
        logging.info("Model evaluation summary:")
        
        # Sort models by performance
        sorted_models = sorted(report.items(), key=lambda x: x[1], reverse=True)
        for rank, (model_name, score) in enumerate(sorted_models, 1):
            logging.info(f"  {rank}. {model_name}: {score:.4f}")
       
        return report
   
    except Exception as e:
        logging.error(f"Error in model evaluation: {str(e)}")
        raise CustomException(e, sys)
    
def load_object(file_path):
    """
    Load an object from a file using dill.
    """
    try:
        with open(file_path, "rb") as file_obj:
            return dill.load(file_obj)
        
    except Exception as e:
        raise CustomException(e, sys)