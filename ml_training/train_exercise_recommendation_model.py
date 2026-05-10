import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

print("=" * 60)
print("Training Exercise Recommendation Model")
print("=" * 60)

# Load dataset
df = pd.read_excel('postpartum_exercise_dataset.xlsx')
print(f"Loaded {len(df)} rows")

# Features (input)
feature_cols = [
    'weeks_after_delivery',
    'pelvic_pain', 'back_pain', 'abdominal_pain',
    'bleeding_complications', 'doctor_restrictions', 'muscle_weakness'
]

# Encode categorical features
fatigue_map = {'low': 0, 'medium': 1, 'high': 2}
mobility_map = {'very_limited': 0, 'limited': 1, 'normal': 2}
willingness_map = {'low': 0, 'medium': 1, 'high': 2}
delivery_map = {'normal': 0, 'c_section': 1}

df['fatigue_encoded'] = df['fatigue_level'].map(fatigue_map)
df['mobility_encoded'] = df['mobility_level'].map(mobility_map)
df['willingness_encoded'] = df['willingness_to_exercise'].map(willingness_map)
# Handle missing delivery_type column
if 'delivery_type' not in df.columns:
    df['delivery_type'] = 'normal'

df['delivery_encoded'] = df['delivery_type'].map(delivery_map)

feature_cols.extend(['fatigue_encoded', 'mobility_encoded', 'willingness_encoded', 'delivery_encoded'])

# Add derived features
df['total_pain'] = df['pelvic_pain'] + df['back_pain'] + df['abdominal_pain']
df['total_medical'] = df['bleeding_complications'] + df['doctor_restrictions'] + df['muscle_weakness']
feature_cols.extend(['total_pain', 'total_medical'])

X = df[feature_cols].values

# Targets (output - exercise names)
exercise_cols = ['exercise_1_name', 'exercise_2_name', 'exercise_3_name', 'exercise_4_name', 'exercise_5_name']
video_cols = ['exercise_1_video_url', 'exercise_2_video_url', 'exercise_3_video_url', 'exercise_4_video_url', 'exercise_5_video_url']

# Encode exercise names
exercise_encoders = {}
for col in exercise_cols:
    le = LabelEncoder()
    df[col + '_encoded'] = le.fit_transform(df[col].fillna('none'))
    exercise_encoders[col] = le

# Create multi-label targets
y_exercises = df[[col + '_encoded' for col in exercise_cols]].values

print(f"Features shape: {X.shape}")
print(f"Targets shape: {y_exercises.shape}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y_exercises, test_size=0.2, random_state=42)

# Train Random Forest for each exercise slot
models = []
for i in range(5):
    print(f"\nTraining model for exercise {i+1}...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    rf.fit(X_train, y_train[:, i])
    models.append(rf)
    accuracy = rf.score(X_test, y_test[:, i])
    print(f"  Accuracy: {accuracy:.4f}")

# Save models and encoders
joblib.dump(models, 'exercise_recommendation_models.pkl')
joblib.dump(exercise_encoders, 'exercise_encoders.pkl')
joblib.dump(feature_cols, 'exercise_feature_cols.pkl')

print("\n✅ Models saved successfully!")