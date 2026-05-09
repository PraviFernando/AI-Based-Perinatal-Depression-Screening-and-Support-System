from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load models
dt_model = joblib.load('decision_tree_model.pkl')
rf_model = joblib.load('random_forest_model.pkl')
scaler = joblib.load('scaler.pkl')

# Risk level mapping
risk_map = {0: 'High', 1: 'Low', 2: 'Medium'}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extract features
        fatigue_map = {'low': 0, 'medium': 1, 'high': 2}
        mobility_map = {'very_limited': 0, 'limited': 1, 'normal': 2}
        willingness_map = {'low': 0, 'medium': 1, 'high': 2}
        delivery_map = {'normal': 0, 'c_section': 1, 'c-section': 1}
        
        features = [
            data.get('weeks_after_delivery', 6),
            data.get('pelvic_pain', 0),
            data.get('back_pain', 0),
            data.get('abdominal_pain', 0),
            data.get('bleeding_complications', 0),
            data.get('doctor_restrictions', 0),
            data.get('muscle_weakness', 0),
            fatigue_map.get(data.get('fatigue_level', 'low'), 0),
            mobility_map.get(data.get('mobility_level', 'normal'), 2),
            willingness_map.get(data.get('willingness_to_exercise', 'medium'), 1),
            delivery_map.get(data.get('delivery_type', 'normal'), 0),
            data.get('total_pain', 0),
            data.get('total_medical_issues', 0)
        ]
        
        # Scale and predict
        features_scaled = scaler.transform([features])
        model_type = data.get('model', 'random_forest')
        
        if model_type == 'decision_tree':
            prediction = dt_model.predict(features_scaled)[0]
        else:
            prediction = rf_model.predict(features_scaled)[0]
        
        return jsonify({
            'success': True,
            'risk_level': risk_map[prediction],
            'model_used': model_type
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)