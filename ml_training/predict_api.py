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

try:
    rec_models = joblib.load('exercise_recommendation_models.pkl')
    rec_encoders = joblib.load('exercise_encoders.pkl')
    rec_feature_cols = joblib.load('exercise_feature_cols.pkl')
    video_map = joblib.load('video_map.pkl')
except FileNotFoundError:
    print("Warning: Recommendation models or video map not found. Run train_exercise_recommendation_model.py and create_video_map.py first.")
    rec_models = None

# Risk level mapping
risk_map = {0: 'High', 1: 'Low', 2: 'Medium'}

# Exercise video URLs mapping
EXERCISE_VIDEOS = {
    'Deep Breathing': 'https://www.youtube.com/embed/ifXo8tJE-t4',
    'Diaphragmatic Breathing': 'https://www.youtube.com/embed/gAkjx25o4iM',
    '4-7-8 Breathing': 'https://www.youtube.com/embed/ozf5CxbIugU',
    'Kegel Exercise': 'https://www.youtube.com/embed/MJ7EfGu03-0',
    'Slow Kegels': 'https://www.youtube.com/embed/q2y1B5n0Ato',
    'Quick Kegels': 'https://www.youtube.com/embed/m3PrP3fW3Mg',
    'Pelvic Tilt': 'https://www.youtube.com/embed/44fYnoSLL1c',
    'Neck Stretch': 'https://www.youtube.com/embed/X3-gKPNyrTA',
    'Cat Cow Stretch': 'https://www.youtube.com/embed/kqnua4rHVVA',
    'Gentle Walking': 'https://www.youtube.com/embed/enYITYwvPAQ',
    'Shoulder Rolls': 'https://www.youtube.com/embed/FxX5G6u0xE0',
    'Heel Slides': 'https://www.youtube.com/embed/K3m9m4UfJ5E',
    'Marching in Place': 'https://www.youtube.com/embed/QtWxk_v4g_w',
    'Upper Back Stretch': 'https://www.youtube.com/embed/FxX5G6u0xE0',
    'Side Stretch': 'https://www.youtube.com/embed/9Q-lsnaXc14',
    'Pelvic Floor Release': 'https://www.youtube.com/embed/NKl8ImI3OVE'
}

# Default exercises based on risk level
def get_exercises_by_risk(risk_level, weeks, mobility, fatigue, pain):
    """
    Rule-based exercise recommendations based on risk level and conditions
    """
    exercises = []
    
    # Always include breathing exercises for non-blocked cases
    if risk_level != 'High':
        exercises.append({'name': 'Deep Breathing', 'video_url': EXERCISE_VIDEOS.get('Deep Breathing')})
    
    # Low risk - more exercises
    if risk_level == 'Low' and weeks >= 2:
        if not pain:
            exercises.append({'name': 'Kegel Exercise', 'video_url': EXERCISE_VIDEOS.get('Kegel Exercise')})
        if mobility != 'very_limited':
            exercises.append({'name': 'Pelvic Tilt', 'video_url': EXERCISE_VIDEOS.get('Pelvic Tilt')})
            exercises.append({'name': 'Neck Stretch', 'video_url': EXERCISE_VIDEOS.get('Neck Stretch')})
        if mobility == 'normal' and fatigue != 'high':
            exercises.append({'name': 'Gentle Walking', 'video_url': EXERCISE_VIDEOS.get('Gentle Walking')})
    
    # Medium risk - limited exercises
    elif risk_level == 'Medium':
        if mobility != 'very_limited' and not pain:
            exercises.append({'name': 'Pelvic Tilt', 'video_url': EXERCISE_VIDEOS.get('Pelvic Tilt')})
        exercises.append({'name': 'Neck Stretch', 'video_url': EXERCISE_VIDEOS.get('Neck Stretch')})
        if fatigue != 'high':
            exercises.append({'name': 'Shoulder Rolls', 'video_url': EXERCISE_VIDEOS.get('Shoulder Rolls')})
    
    # Remove duplicates and limit to 5
    seen = set()
    unique_exercises = []
    for ex in exercises:
        if ex['name'] not in seen:
            seen.add(ex['name'])
            unique_exercises.append(ex)
    
    return unique_exercises[:5]

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
        
        risk_level = risk_map[prediction]
        
        exercises = []
        if rec_models is not None:
            rec_features = [
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
                data.get('pelvic_pain', 0) + data.get('back_pain', 0) + data.get('abdominal_pain', 0),
                data.get('bleeding_complications', 0) + data.get('doctor_restrictions', 0) + data.get('muscle_weakness', 0)
            ]
            
            for i in range(5):
                model = rec_models[i]
                encoder = rec_encoders[f'exercise_{i+1}_name']
                pred_encoded = model.predict([rec_features])[0]
                pred_name = encoder.inverse_transform([pred_encoded])[0]
                if pred_name != 'none':
                    exercises.append({
                        'name': pred_name,
                        'video_url': video_map.get(pred_name, '')
                    })
            
            # Remove duplicates
            seen = set()
            unique_exercises = []
            for ex in exercises:
                if ex['name'] not in seen:
                    seen.add(ex['name'])
                    unique_exercises.append(ex)
            exercises = unique_exercises
        else:
            exercises = get_exercises_by_risk(
                risk_level,
                data.get('weeks_after_delivery', 6),
                data.get('mobility_level', 'normal'),
                data.get('fatigue_level', 'low'),
                data.get('pelvic_pain', 0) or data.get('back_pain', 0) or data.get('abdominal_pain', 0)
            )
        
        return jsonify({
            'success': True,
            'risk_level': risk_level,
            'model_used': model_type,
            'recommended_exercises': exercises
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/recommend/exercises', methods=['POST'])
def recommend_exercises():
    """
    Get exercise recommendations based on health data
    """
    try:
        data = request.json
        
        # Get risk level first
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
        
        features_scaled = scaler.transform([features])
        prediction = rf_model.predict(features_scaled)[0]
        risk_level = risk_map[prediction]
        
        exercises = []
        if rec_models is not None:
            rec_features = [
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
                data.get('pelvic_pain', 0) + data.get('back_pain', 0) + data.get('abdominal_pain', 0),
                data.get('bleeding_complications', 0) + data.get('doctor_restrictions', 0) + data.get('muscle_weakness', 0)
            ]
            
            for i in range(5):
                model = rec_models[i]
                encoder = rec_encoders[f'exercise_{i+1}_name']
                pred_encoded = model.predict([rec_features])[0]
                pred_name = encoder.inverse_transform([pred_encoded])[0]
                if pred_name != 'none':
                    exercises.append({
                        'name': pred_name,
                        'video_url': video_map.get(pred_name, '')
                    })
            
            # Remove duplicates
            seen = set()
            unique_exercises = []
            for ex in exercises:
                if ex['name'] not in seen:
                    seen.add(ex['name'])
                    unique_exercises.append(ex)
            exercises = unique_exercises
        else:
            pain = data.get('pelvic_pain', 0) or data.get('back_pain', 0) or data.get('abdominal_pain', 0)
            exercises = get_exercises_by_risk(
                risk_level,
                data.get('weeks_after_delivery', 6),
                data.get('mobility_level', 'normal'),
                data.get('fatigue_level', 'low'),
                pain
            )
        
        return jsonify({
            'success': True,
            'risk_level': risk_level,
            'exercises': exercises
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)