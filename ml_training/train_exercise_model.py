import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings('ignore')

# ============================================
# STEP 1: LOAD DATASET
# ============================================
print("=" * 60)
print("STEP 1: Loading Dataset")
print("=" * 60)

# Load Excel file
df = pd.read_excel('postpartum_exercise_dataset.xlsx')  # Change to your file name
print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFirst 5 rows:")
print(df.head())

# ============================================
# STEP 2: FEATURE ENGINEERING
# ============================================
print("\n" + "=" * 60)
print("STEP 2: Feature Engineering")
print("=" * 60)

# Define features (input variables) and target (output variable)
# Using risk_level as target (Low, Medium, High)
categorical_features = [
    'fatigue_level', 'mobility_level', 'willingness_to_exercise',
    'delivery_type'
]

binary_features = [
    'pelvic_pain', 'back_pain', 'abdominal_pain',
    'bleeding_complications', 'doctor_restrictions', 'muscle_weakness'
]

numerical_features = ['weeks_after_delivery']

# Handle missing delivery_type column (if not present, create default)
if 'delivery_type' not in df.columns:
    df['delivery_type'] = 'normal'  # Default value

# Encode categorical features
label_encoders = {}
for col in categorical_features:
    if col in df.columns:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
        print(f"Encoded {col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")

# Ensure binary features are 0/1
for col in binary_features:
    if col in df.columns:
        df[col] = df[col].astype(int)

# Create additional features
df['total_pain'] = df['pelvic_pain'] + df['back_pain'] + df['abdominal_pain']
df['total_medical_issues'] = df['bleeding_complications'] + df['doctor_restrictions'] + df['muscle_weakness']

# Combine all features
feature_columns = []
for col in numerical_features:
    if col in df.columns:
        feature_columns.append(col)
for col in binary_features:
    if col in df.columns:
        feature_columns.append(col)
for col in categorical_features:
    if col + '_encoded' in df.columns:
        feature_columns.append(col + '_encoded')

# Add engineered features
feature_columns.extend(['total_pain', 'total_medical_issues'])

# Target variable - using risk_level
target_column = 'risk_level'
df[target_column + '_encoded'] = LabelEncoder().fit_transform(df[target_column])

print(f"\nFeatures used: {feature_columns}")
print(f"Target: {target_column}")

# ============================================
# STEP 3: PREPARE DATA FOR TRAINING
# ============================================
print("\n" + "=" * 60)
print("STEP 3: Preparing Data for Training")
print("=" * 60)

X = df[feature_columns].values
y = df[target_column + '_encoded'].values

# Split data into training (80%) and testing (20%)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")
print(f"Class distribution in training: {np.bincount(y_train)}")
print(f"Class distribution in testing: {np.bincount(y_test)}")

# Scale features (important for some models)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ============================================
# STEP 4: TRAIN DECISION TREE MODEL
# ============================================
print("\n" + "=" * 60)
print("STEP 4: Training Decision Tree Classifier")
print("=" * 60)

# Hyperparameter tuning for Decision Tree
param_grid_dt = {
    'max_depth': [3, 5, 7, 10, 15, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'criterion': ['gini', 'entropy']
}

dt_model = DecisionTreeClassifier(random_state=42)

grid_search_dt = GridSearchCV(
    dt_model, param_grid_dt, cv=5, scoring='accuracy', n_jobs=-1
)
grid_search_dt.fit(X_train_scaled, y_train)

best_dt = grid_search_dt.best_estimator_
print(f"Best Decision Tree parameters: {grid_search_dt.best_params_}")
print(f"Best cross-validation accuracy: {grid_search_dt.best_score_:.4f}")

# Train final model
dt_final = DecisionTreeClassifier(**grid_search_dt.best_params_, random_state=42)
dt_final.fit(X_train_scaled, y_train)

# Evaluate on test data
dt_pred = dt_final.predict(X_test_scaled)
dt_accuracy = accuracy_score(y_test, dt_pred)
print(f"\nDecision Tree Test Accuracy: {dt_accuracy:.4f}")
print(f"\nClassification Report:")
print(classification_report(y_test, dt_pred, target_names=['High', 'Low', 'Medium']))

# ============================================
# STEP 5: TRAIN RANDOM FOREST MODEL
# ============================================
print("\n" + "=" * 60)
print("STEP 5: Training Random Forest Classifier")
print("=" * 60)

# Hyperparameter tuning for Random Forest
param_grid_rf = {
    'n_estimators': [50, 100, 200],
    'max_depth': [5, 10, 15, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

rf_model = RandomForestClassifier(random_state=42, n_jobs=-1)

grid_search_rf = GridSearchCV(
    rf_model, param_grid_rf, cv=5, scoring='accuracy', n_jobs=-1
)
grid_search_rf.fit(X_train_scaled, y_train)

best_rf = grid_search_rf.best_estimator_
print(f"Best Random Forest parameters: {grid_search_rf.best_params_}")
print(f"Best cross-validation accuracy: {grid_search_rf.best_score_:.4f}")

# Train final model
rf_final = RandomForestClassifier(**grid_search_rf.best_params_, random_state=42, n_jobs=-1)
rf_final.fit(X_train_scaled, y_train)

# Evaluate on test data
rf_pred = rf_final.predict(X_test_scaled)
rf_accuracy = accuracy_score(y_test, rf_pred)
print(f"\nRandom Forest Test Accuracy: {rf_accuracy:.4f}")
print(f"\nClassification Report:")
print(classification_report(y_test, rf_pred, target_names=['High', 'Low', 'Medium']))

# ============================================
# STEP 6: COMPARE MODELS
# ============================================
print("\n" + "=" * 60)
print("STEP 6: Model Comparison")
print("=" * 60)

print(f"Decision Tree Accuracy: {dt_accuracy:.4f}")
print(f"Random Forest Accuracy: {rf_accuracy:.4f}")

# Cross-validation comparison
dt_cv_scores = cross_val_score(dt_final, X_train_scaled, y_train, cv=5)
rf_cv_scores = cross_val_score(rf_final, X_train_scaled, y_train, cv=5)

print(f"\nDecision Tree CV Scores: {dt_cv_scores}")
print(f"Decision Tree Mean CV Accuracy: {dt_cv_scores.mean():.4f} (+/- {dt_cv_scores.std() * 2:.4f})")

print(f"\nRandom Forest CV Scores: {rf_cv_scores}")
print(f"Random Forest Mean CV Accuracy: {rf_cv_scores.mean():.4f} (+/- {rf_cv_scores.std() * 2:.4f})")

# ============================================
# STEP 7: FEATURE IMPORTANCE ANALYSIS
# ============================================
print("\n" + "=" * 60)
print("STEP 7: Feature Importance Analysis")
print("=" * 60)

# Get feature importances from Random Forest
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': rf_final.feature_importances_
}).sort_values('importance', ascending=False)

print("\nTop 10 Most Important Features:")
print(feature_importance.head(10))

# Plot feature importance
plt.figure(figsize=(10, 6))
plt.barh(feature_importance['feature'][:10], feature_importance['importance'][:10])
plt.xlabel('Importance')
plt.title('Top 10 Feature Importances (Random Forest)')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig('feature_importance.png')
print("\nFeature importance plot saved as 'feature_importance.png'")

# ============================================
# STEP 8: CONFUSION MATRICES
# ============================================
print("\n" + "=" * 60)
print("STEP 8: Confusion Matrices")
print("=" * 60)

# Decision Tree Confusion Matrix
dt_cm = confusion_matrix(y_test, dt_pred)
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
sns.heatmap(dt_cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['High', 'Low', 'Medium'],
            yticklabels=['High', 'Low', 'Medium'])
plt.title('Decision Tree Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')

# Random Forest Confusion Matrix
rf_cm = confusion_matrix(y_test, rf_pred)
plt.subplot(1, 2, 2)
sns.heatmap(rf_cm, annot=True, fmt='d', cmap='Greens',
            xticklabels=['High', 'Low', 'Medium'],
            yticklabels=['High', 'Low', 'Medium'])
plt.title('Random Forest Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')

plt.tight_layout()
plt.savefig('confusion_matrices.png')
print("Confusion matrices saved as 'confusion_matrices.png'")

# ============================================
# STEP 9: SAVE MODELS
# ============================================
print("\n" + "=" * 60)
print("STEP 9: Saving Models")
print("=" * 60)

# Save the trained models
joblib.dump(dt_final, 'decision_tree_model.pkl')
joblib.dump(rf_final, 'random_forest_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(label_encoders, 'label_encoders.pkl')

print("Models saved successfully:")
print("  - decision_tree_model.pkl")
print("  - random_forest_model.pkl")
print("  - scaler.pkl")
print("  - label_encoders.pkl")

# ============================================
# STEP 10: PREDICTION FUNCTION (For future use)
# ============================================
print("\n" + "=" * 60)
print("STEP 10: Prediction Function Created")
print("=" * 60)

def predict_risk_level(features_dict, model='random_forest'):
    """
    Predict risk level based on input features
    
    Parameters:
    features_dict: dict with keys - weeks_after_delivery, pelvic_pain, back_pain, 
                   abdominal_pain, bleeding_complications, doctor_restrictions,
                   muscle_weakness, fatigue_level, mobility_level, willingness_to_exercise,
                   delivery_type
    
    model: 'decision_tree' or 'random_forest'
    
    Returns:
    risk_level: 'Low', 'Medium', or 'High'
    """
    # Create feature array
    fatigue_map = {'low': 0, 'medium': 1, 'high': 2}
    mobility_map = {'very_limited': 0, 'limited': 1, 'normal': 2}
    willingness_map = {'low': 0, 'medium': 1, 'high': 2}
    delivery_map = {'normal': 0, 'c_section': 1, 'c-section': 1}
    
    features = [
        features_dict.get('weeks_after_delivery', 6),
        features_dict.get('pelvic_pain', 0),
        features_dict.get('back_pain', 0),
        features_dict.get('abdominal_pain', 0),
        features_dict.get('bleeding_complications', 0),
        features_dict.get('doctor_restrictions', 0),
        features_dict.get('muscle_weakness', 0),
        fatigue_map.get(features_dict.get('fatigue_level', 'low'), 0),
        mobility_map.get(features_dict.get('mobility_level', 'normal'), 2),
        willingness_map.get(features_dict.get('willingness_to_exercise', 'medium'), 1),
        delivery_map.get(features_dict.get('delivery_type', 'normal'), 0),
        features_dict.get('total_pain', 0),
        features_dict.get('total_medical_issues', 0)
    ]
    
    # Scale features
    features_scaled = scaler.transform([features])
    
    # Predict
    if model == 'decision_tree':
        prediction = dt_final.predict(features_scaled)[0]
    else:
        prediction = rf_final.predict(features_scaled)[0]
    
    risk_map = {0: 'High', 1: 'Low', 2: 'Medium'}
    return risk_map[prediction]

# Test prediction function
test_features = {
    'weeks_after_delivery': 8,
    'pelvic_pain': 0,
    'back_pain': 0,
    'abdominal_pain': 0,
    'bleeding_complications': 0,
    'doctor_restrictions': 0,
    'muscle_weakness': 0,
    'fatigue_level': 'low',
    'mobility_level': 'normal',
    'willingness_to_exercise': 'high',
    'delivery_type': 'normal',
    'total_pain': 0,
    'total_medical_issues': 0
}

print("\nTest Prediction:")
print(f"Input: {test_features}")
print(f"Random Forest Prediction: {predict_risk_level(test_features, 'random_forest')}")
print(f"Decision Tree Prediction: {predict_risk_level(test_features, 'decision_tree')}")

print("\n" + "=" * 60)
print("TRAINING COMPLETED SUCCESSFULLY!")
print("=" * 60)