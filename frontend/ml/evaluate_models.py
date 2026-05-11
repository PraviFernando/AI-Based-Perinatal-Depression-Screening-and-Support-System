"""
================================================================
EVALUATE MODELS - Compare SVM vs Decision Tree vs Random Forest
================================================================
Run this script to see which model performs best on your data
================================================================
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import classification_report, accuracy_score
import pandas as pd

from training_data import TRAIN_TEXTS, TRAIN_REASONS, TRAIN_EMOTIONS, TOTAL_EXAMPLES

def preprocess_simple(text):
    """Simple preprocessing for evaluation"""
    return text.lower().strip()

def create_pipeline(classifier):
    """Create pipeline with TF-IDF and given classifier"""
    return Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
        )),
        ('clf', classifier)
    ])

def evaluate_model(name, classifier, X, y_emotion, y_reason):
    """Evaluate a model on both emotion and reason tasks"""
    
    print(f"\n{'='*50}")
    print(f"📊 Evaluating: {name}")
    print(f"{'='*50}")
    
    results = {}
    
    # Emotion Classification
    print("\n🎭 EMOTION CLASSIFICATION:")
    pipeline_emotion = create_pipeline(classifier)
    
    # Cross-validation score
    cv_scores = cross_val_score(pipeline_emotion, X, y_emotion, cv=5, scoring='accuracy')
    print(f"   Cross-validation accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std()*2:.3f})")
    
    # Train on all data to get training accuracy
    pipeline_emotion.fit(X, y_emotion)
    train_pred = pipeline_emotion.predict(X)
    train_acc = accuracy_score(y_emotion, train_pred)
    print(f"   Training accuracy: {train_acc:.3f}")
    
    results['emotion_cv_mean'] = cv_scores.mean()
    results['emotion_cv_std'] = cv_scores.std()
    results['emotion_train_acc'] = train_acc
    
    # Reason Classification
    print("\n📝 REASON CLASSIFICATION:")
    pipeline_reason = create_pipeline(classifier)
    
    # Cross-validation score
    cv_scores_reason = cross_val_score(pipeline_reason, X, y_reason, cv=5, scoring='accuracy')
    print(f"   Cross-validation accuracy: {cv_scores_reason.mean():.3f} (+/- {cv_scores_reason.std()*2:.3f})")
    
    # Train on all data
    pipeline_reason.fit(X, y_reason)
    train_pred_reason = pipeline_reason.predict(X)
    train_acc_reason = accuracy_score(y_reason, train_pred_reason)
    print(f"   Training accuracy: {train_acc_reason:.3f}")
    
    results['reason_cv_mean'] = cv_scores_reason.mean()
    results['reason_cv_std'] = cv_scores_reason.std()
    results['reason_train_acc'] = train_acc_reason
    
    return results

def main():
    print("\n" + "="*60)
    print("🌸 BLOOM MODEL EVALUATION")
    print("="*60)
    print(f"📚 Total training examples: {TOTAL_EXAMPLES}")
    print(f"🎭 Emotion classes: {set(TRAIN_EMOTIONS)}")
    print(f"📝 Reason classes: {set(TRAIN_REASONS)}")
    
    # Preprocess texts
    print("\n🔄 Preprocessing texts...")
    X = [preprocess_simple(t) for t in TRAIN_TEXTS]
    
    # Define models to compare
    models = {
        'LinearSVC (SVM)': LinearSVC(
            C=1.0, class_weight='balanced', max_iter=3000, random_state=42
        ),
        'Decision Tree': DecisionTreeClassifier(
            max_depth=20, min_samples_split=5, 
            class_weight='balanced', random_state=42
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=100, max_depth=20, min_samples_split=5,
            class_weight='balanced', random_state=42, n_jobs=-1
        )
    }
    
    # Evaluate each model
    all_results = {}
    for name, classifier in models.items():
        results = evaluate_model(name, classifier, X, TRAIN_EMOTIONS, TRAIN_REASONS)
        all_results[name] = results
    
    # Print comparison table
    print("\n" + "="*60)
    print("📊 MODEL COMPARISON SUMMARY")
    print("="*60)
    
    comparison_data = []
    for name, results in all_results.items():
        comparison_data.append({
            'Model': name,
            'Emotion CV Accuracy': f"{results['emotion_cv_mean']:.3f}",
            'Reason CV Accuracy': f"{results['reason_cv_mean']:.3f}",
            'Avg CV Accuracy': f"{(results['emotion_cv_mean'] + results['reason_cv_mean'])/2:.3f}"
        })
    
    df = pd.DataFrame(comparison_data)
    print(df.to_string(index=False))
    
    # Find best model
    best_model = max(all_results.items(), 
                     key=lambda x: (x[1]['emotion_cv_mean'] + x[1]['reason_cv_mean'])/2)
    
    print(f"\n🏆 RECOMMENDED MODEL: {best_model[0]}")
    print(f"   Average CV Accuracy: {(best_model[1]['emotion_cv_mean'] + best_model[1]['reason_cv_mean'])/2:.3f}")
    
    print("\n💡 Recommendation:")
    if 'Random Forest' in best_model[0]:
        print("   Use: MODEL_TYPE = 'random_forest' in emotion_service.py")
    elif 'LinearSVC' in best_model[0]:
        print("   Use: MODEL_TYPE = 'svc' in emotion_service.py")
    else:
        print("   Use: MODEL_TYPE = 'decision_tree' in emotion_service.py")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()