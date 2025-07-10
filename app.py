from flask import Flask, render_template, request, jsonify
import os
from src.pipeline.predict_pipeline import StudentPerformancePredictor
from src.components.recommendation_engine import RecommendationEngine

app = Flask(__name__)

# Initialize predictor
predictor = StudentPerformancePredictor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get form data
        student_data = {
            'gender': request.form.get('gender'),
            'race/ethnicity': request.form.get('ethnicity'),
            'parental level of education': request.form.get('parental_education'),
            'lunch': request.form.get('lunch'),
            'test preparation course': request.form.get('test_prep'),
            'reading_score': int(request.form.get('reading_score', 0)),
            'writing_score': int(request.form.get('writing_score', 0))
        }
        # Make prediction
        predicted_score = predictor.predict(student_data)
        # Generate recommendations and insights
        recommendations = RecommendationEngine.generate_recommendations(student_data, predicted_score)
        insights = RecommendationEngine.generate_insights(student_data, predicted_score)
        # Calculate peer comparison (simulated data)
        peer_averages = {
            'math': 65,
            'reading': 68,
            'writing': 64
        }
        response = {
            'success': True,
            'predicted_math_score': predicted_score,
            'student_data': student_data,
            'recommendations': recommendations,
            'insights': insights,
            'peer_averages': peer_averages,
            'performance_summary': {
                'total_avg': (predicted_score + student_data['reading_score'] + student_data['writing_score']) / 3,
                'strongest_subject': max([
                    ('Mathematics', predicted_score),
                    ('Reading', student_data['reading_score']),
                    ('Writing', student_data['writing_score'])
                ], key=lambda x: x[1])[0]
            }
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/train_model', methods=['POST'])
def train_model():
    try:
        df = predictor.prepare_data()
        train_score, test_score = predictor.train_model(df)
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'train_score': train_score,
            'test_score': test_score
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/feature_importance')
def get_feature_importance():
    try:
        importance = predictor.get_feature_importance()
        if importance is None:
            return jsonify({'error': 'Model not trained'}), 400
        return jsonify({
            'success': True,
            'feature_importance': importance
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/batch_predict', methods=['POST'])
def batch_predict():
    try:
        students_data = request.json.get('students', [])
        results = []
        for student_data in students_data:
            predicted_score = predictor.predict(student_data)
            recommendations = RecommendationEngine.generate_recommendations(student_data, predicted_score)
            results.append({
                'student_data': student_data,
                'predicted_math_score': predicted_score,
                'recommendations': recommendations
            })
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    df = predictor.prepare_data()
    predictor.train_model(df)
    app.run(debug=True, host='0.0.0.0', port=5000)