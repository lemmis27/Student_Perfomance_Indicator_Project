import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder

class StudentPerformancePredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.is_trained = False
    
    def prepare_data(self, data_path=None):
        """Prepare sample data for training (replace with actual dataset)"""
        if data_path and os.path.exists(data_path):
            df = pd.read_csv(data_path)
        else:
            # Generate sample data for demonstration
            np.random.seed(42)
            n_samples = 1000
            df = pd.DataFrame({
                'gender': np.random.choice(['male', 'female'], n_samples),
                'race/ethnicity': np.random.choice(['group A', 'group B', 'group C', 'group D', 'group E'], n_samples),
                'parental level of education': np.random.choice([
                    'some high school', 'high school', 'some college', 
                    'associate\'s degree', 'bachelor\'s degree', 'master\'s degree'
                ], n_samples),
                'lunch': np.random.choice(['free/reduced', 'standard'], n_samples),
                'test preparation course': np.random.choice(['none', 'completed'], n_samples),
                'math score': np.random.randint(0, 101, n_samples),
                'reading score': np.random.randint(0, 101, n_samples),
                'writing score': np.random.randint(0, 101, n_samples)
            })
        return df

    def train_model(self, df):
        """Train the prediction model"""
        categorical_features = ['gender', 'race/ethnicity', 'parental level of education', 
                              'lunch', 'test preparation course']
        numerical_features = ['reading score', 'writing score']
        for feature in categorical_features:
            le = LabelEncoder()
            df[feature + '_encoded'] = le.fit_transform(df[feature])
            self.label_encoders[feature] = le
        encoded_features = [f + '_encoded' for f in categorical_features]
        self.feature_names = encoded_features + numerical_features
        X = df[self.feature_names]
        y = df['math score']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        self.is_trained = True
        return train_score, test_score

    def predict(self, student_data):
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        input_data = {}
        categorical_features = ['gender', 'race/ethnicity', 'parental level of education', 
                              'lunch', 'test preparation course']
        for feature in categorical_features:
            if feature in student_data:
                try:
                    encoded_value = self.label_encoders[feature].transform([student_data[feature]])[0]
                    input_data[feature + '_encoded'] = encoded_value
                except ValueError:
                    input_data[feature + '_encoded'] = 0
        input_data['reading score'] = student_data.get('reading_score', 0)
        input_data['writing score'] = student_data.get('writing_score', 0)
        feature_array = np.array([[input_data[feature] for feature in self.feature_names]])
        feature_array_scaled = self.scaler.transform(feature_array)
        prediction = self.model.predict(feature_array_scaled)[0]
        return max(0, min(100, round(prediction)))

    def get_feature_importance(self):
        if not self.is_trained:
            return None
        importance = self.model.feature_importances_
        return dict(zip(self.feature_names, importance))

    def save(self, model_path, scaler_path, encoders_path):
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        with open(encoders_path, 'wb') as f:
            pickle.dump(self.label_encoders, f)

    def load(self, model_path, scaler_path, encoders_path):
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
        with open(encoders_path, 'rb') as f:
            self.label_encoders = pickle.load(f)
        self.is_trained = True