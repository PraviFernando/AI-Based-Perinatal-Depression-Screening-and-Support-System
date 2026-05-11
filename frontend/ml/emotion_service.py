"""
================================================================
BLOOM  Improved ML Emotion Analysis Service
================================================================
Flask API that predicts emotion, reason, and risk level from
a postpartum mother's diary text entry.

HOW IT WORKS:
  1. Text comes in via POST /analyze
  2. Preprocessor cleans the text
  3. Emotion pipeline (TF-IDF + LinearSVC) predicts emotion
  4. Reason  pipeline (TF-IDF + LinearSVC) predicts reason
  5. Risk engine applies rule-based logic on top of ML output
  6. Returns { emotion, primaryReason, riskLevel }

TO ADD MORE TRAINING DATA:
   Open training_data.py
   Add sentences to the relevant category list
   Call POST /retrain  (or restart the server)

ENDPOINTS:
  GET  /health         service status
  POST /analyze        main prediction
  POST /retrain        re-train models from training_data.py
  GET  /accuracy       show training set size per class

PORTS:
  Default: 5001
================================================================
"""

import re
import pickle
import os
import importlib
import pandas as pd
import numpy as np

from flask import Flask, request, jsonify
from flask_cors import CORS

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

from training_data import (
    TRAIN_TEXTS,
    TRAIN_REASONS,
    TRAIN_EMOTIONS,
    TOTAL_EXAMPLES
)

# ============================================================
# MODEL CONFIGURATION
# ============================================================
# Possible values: "svm", "decision_tree", "random_forest"
MODEL_TYPE = "random_forest"

# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}}
)

# ============================================================
# MODEL FILES
# ============================================================

EMOTION_MODEL_PATH = "emotion_model.pkl"
REASON_MODEL_PATH = "reason_model.pkl"

# ============================================================
# LOAD EXCEL RECOMMENDATIONS
# ============================================================

RECOMMENDATIONS_DATA = []

def load_recommendations():
    global RECOMMENDATIONS_DATA

    try:
        df = pd.read_excel("recommendations.xlsx")

        df.columns = df.columns.str.strip()

        df["risk_level"] = df["risk_level"].astype(str).str.strip().str.lower()
        df["reason"] = df["reason"].astype(str).str.strip().str.lower()
        df["emotion"] = df["emotion"].astype(str).str.strip().str.lower()

        RECOMMENDATIONS_DATA = df.to_dict(orient="records")

        print(f"[OK] Loaded {len(RECOMMENDATIONS_DATA)} recommendation rows")
        
        # Print unique values for debugging
        if len(RECOMMENDATIONS_DATA) > 0:
            print(f"[DEBUG] Available risk levels: {set([r['risk_level'] for r in RECOMMENDATIONS_DATA])}")
            print(f"[DEBUG] Available reasons: {set([r['reason'] for r in RECOMMENDATIONS_DATA])}")
            print(f"[DEBUG] Available emotions: {set([r['emotion'] for r in RECOMMENDATIONS_DATA])}")

    except Exception as e:
        print("[ERROR] Error loading recommendations.xlsx")
        print(e)
        RECOMMENDATIONS_DATA = []

load_recommendations()

# ============================================================
# TEXT PREPROCESSING
# ============================================================

CONTRACTIONS = {
    "can't": "cannot",
    "won't": "will not",
    "don't": "do not",
    "i'm": "i am",
    "it's": "it is",
}

def preprocess(text: str) -> str:

    text = text.lower().strip()

    for c, expanded in CONTRACTIONS.items():
        text = text.replace(c, expanded)

    # KEEP Sinhala + English
    text = re.sub(r"[^\w\s\u0D80-\u0DFF]", " ", text)

    text = re.sub(r"\s+", " ", text).strip()

    return text

# ============================================================
# BUILD ML PIPELINE
# ============================================================

def build_pipeline():
    """
    Constructs the Scikit-learn pipeline based on MODEL_TYPE.
    """
    if MODEL_TYPE == "decision_tree":
        clf = DecisionTreeClassifier(
            max_depth=20,
            min_samples_split=4,
            random_state=42,
            class_weight="balanced"
        )
    elif MODEL_TYPE == "random_forest":
        clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=25,
            min_samples_split=4,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1
        )
    else:  # default to svm
        clf = LinearSVC(
            C=1.0,
            class_weight="balanced",
            max_iter=3000,
            random_state=42,
        )

    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                sublinear_tf=True,
            ),
        ),
        ("clf", clf),
    ])

# ============================================================
# TRAIN MODELS
# ============================================================

def train_models():

    print(f" Training models on {TOTAL_EXAMPLES} examples")

    cleaned = [preprocess(t) for t in TRAIN_TEXTS]

    emotion_model = build_pipeline()
    emotion_model.fit(cleaned, TRAIN_EMOTIONS)

    reason_model = build_pipeline()
    reason_model.fit(cleaned, TRAIN_REASONS)

    pickle.dump(emotion_model, open(EMOTION_MODEL_PATH, "wb"))
    pickle.dump(reason_model, open(REASON_MODEL_PATH, "wb"))

    print(" Models trained and saved")

    return emotion_model, reason_model

# ============================================================
# LOAD OR TRAIN
# ============================================================

try:

    emotion_model = pickle.load(open(EMOTION_MODEL_PATH, "rb"))
    reason_model = pickle.load(open(REASON_MODEL_PATH, "rb"))

    print(" Models loaded from disk")

except Exception:

    print(" No saved models found")

    emotion_model, reason_model = train_models()

# ============================================================
# RISK ENGINE
# ============================================================

CRISIS_KEYWORDS = [
    "kill myself",
    "want to die",
    "end my life",
    "hurt myself",
]

HIGH_RISK_REASONS = {
    "negative_thoughts"
}

MEDIUM_RISK_REASONS = {
    "bonding_issues",
    "anxiety",
    "overwhelmed",
    "lack_of_support",
    "loss_of_confidence",
}

def get_risk_level(text, reason, emotion):

    text = text.lower()

    if any(word in text for word in CRISIS_KEYWORDS):
        return "high"

    if reason in HIGH_RISK_REASONS:
        return "high"

    if reason in MEDIUM_RISK_REASONS:
        return "medium"

    if emotion in ["stressed", "anxious"]:
        return "medium"

    return "low"

# ============================================================
# RECOMMENDATION ENGINE
# ============================================================

def get_recommendations(risk, reason, emotion):

    risk = risk.lower()
    reason = reason.lower().replace(" ", "_")
    emotion = emotion.lower()

    print(f"[RECOMMENDATION] Looking for: risk='{risk}', reason='{reason}', emotion='{emotion}'")
    print(f"[RECOMMENDATION] Total rows in Excel: {len(RECOMMENDATIONS_DATA)}")

    # If risk is high, fallback to medium for lookup if high not found
    search_risks = [risk]
    if risk == "high":
        search_risks.append("medium")
    elif risk == "medium":
        search_risks.append("low")

    def format_data(row):
        return {
            "activities": [
                x.strip()
                for x in str(row.get("recommended_activities", "")).split(",")
                if x.strip()
            ],
            "games": [
                x.strip()
                for x in str(row.get("recommended_games", "")).split(",")
                if x.strip()
            ],
            "videoUrl": str(row.get("recommended_videos", "https://youtu.be/jzGyjLGbAUc")).strip()
        }

    # 1. Exact match (try each risk level in preference order)
    for r in search_risks:
        for row in RECOMMENDATIONS_DATA:
            if (
                row["risk_level"] == r
                and row["reason"] == reason
                and row["emotion"] == emotion
            ):
                print(f"[RECOMMENDATION] ✓ Found EXACT match: risk={r}, reason={reason}, emotion={emotion}")
                return format_data(row)

    # 2. Risk + Reason match
    for r in search_risks:
        for row in RECOMMENDATIONS_DATA:
            if (
                row["risk_level"] == r
                and row["reason"] == reason
            ):
                print(f"[RECOMMENDATION] ✓ Found RISK+REASON match: risk={r}, reason={reason}")
                return format_data(row)

    # 3. Reason match only
    for row in RECOMMENDATIONS_DATA:
        if row["reason"] == reason:
            print(f"[RECOMMENDATION] ✓ Found REASON match: reason={reason}")
            return format_data(row)

    # 4. Emotion match only
    for row in RECOMMENDATIONS_DATA:
        if row["emotion"] == emotion:
            print(f"[RECOMMENDATION] ✓ Found EMOTION match: emotion={emotion}")
            return format_data(row)
    
    # 5. Risk match only
    for r in search_risks:
        for row in RECOMMENDATIONS_DATA:
            if row["risk_level"] == r:
                print(f"[RECOMMENDATION] ✓ Found RISK match: risk={r}")
                return format_data(row)

    # 6. Default fallback - first row from Excel if available
    if len(RECOMMENDATIONS_DATA) > 0:
        print(f"[RECOMMENDATION] ⚠ Using FIRST row from Excel as fallback")
        return format_data(RECOMMENDATIONS_DATA[0])

    # 7. Hardcoded default
    print(f"[RECOMMENDATION] ❌ No matches found! Using HARDCODED default")
    return {
        "activities": ["deep_breathing", "journaling"],
        "games": ["bubble_pop", "colouring"],
        "videoUrl": "https://youtu.be/jzGyjLGbAUc"
    }

# ============================================================
# HEALTH ROUTE
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "running",
        "training_examples": TOTAL_EXAMPLES,
        "recommendation_rows": len(RECOMMENDATIONS_DATA)
    })

# ============================================================
# ANALYZE ROUTE
# ============================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        data = request.get_json()

        text = data.get("text", "").strip()
        # Optional explicit override from request
        explicit_reason = data.get("reason") or data.get("issue")

        if len(text) < 5 and not explicit_reason:
            return jsonify({
                "error": "Text too short"
            }), 400

        cleaned = preprocess(text)

        # 1. Detect Emotion
        emotion = emotion_model.predict([cleaned])[0]

        # 2. Detect Reason (prioritize explicit or keywords)
        reason = None

        if explicit_reason:
            reason = explicit_reason.lower().replace(" ", "_")
        else:
            # Simple keyword matching for direct "issue" detection
            # Categories: loneliness, fatigue, anxiety, bonding_issues,
            # lack_of_support, sleep_problems, loss_of_confidence,
            # overwhelmed, physical_discomfort, negative_thoughts
            keywords = {
                "loneliness": ["lonely", "alone", "isolated"],
                "fatigue": ["tired", "fatigue", "exhausted", "no energy"],
                "anxiety": ["anxious", "worry", "panic", "scared"],
                "bonding_issues": ["bond", "connection", "baby", "attach"],
                "lack_of_support": ["support", "help", "husband", "family"],
                "sleep_problems": ["sleep", "insomnia", "awake"],
                "loss_of_confidence": ["confidence", "failure", "not good enough"],
                "overwhelmed": ["overwhelmed", "too much", "cope"],
                "physical_discomfort": ["pain", "hurt", "body", "recovery"],
                "negative_thoughts": ["hopeless", "dark", "die", "pointless"]
            }

            text_lower = text.lower()
            for r, kws in keywords.items():
                if any(kw in text_lower for kw in kws):
                    reason = r
                    break

            # If no keyword found, use ML model
            if not reason:
                reason = reason_model.predict([cleaned])[0]

        risk = get_risk_level(text, reason, emotion)

        print(f"[ANALYZE] Predicted: emotion='{emotion}', reason='{reason}', risk='{risk}'")

        recommendations = get_recommendations(
            risk,
            reason,
            emotion
        )

        return jsonify({
            "emotion": emotion,
            "primaryReason": reason,
            "riskLevel": risk,
            "recommendations": recommendations
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# ============================================================
# RETRAIN ROUTE
# ============================================================

@app.route("/retrain", methods=["POST"])
def retrain():

    global emotion_model
    global reason_model

    import training_data as td

    importlib.reload(td)

    from training_data import (
        TRAIN_TEXTS,
        TRAIN_REASONS,
        TRAIN_EMOTIONS,
        TOTAL_EXAMPLES
    )

    cleaned = [preprocess(t) for t in TRAIN_TEXTS]

    emotion_model = build_pipeline()
    emotion_model.fit(cleaned, TRAIN_EMOTIONS)

    reason_model = build_pipeline()
    reason_model.fit(cleaned, TRAIN_REASONS)

    pickle.dump(emotion_model, open(EMOTION_MODEL_PATH, "wb"))
    pickle.dump(reason_model, open(REASON_MODEL_PATH, "wb"))

    load_recommendations()

    return jsonify({
        "status": "retrained",
        "training_examples": TOTAL_EXAMPLES,
        "recommendation_rows": len(RECOMMENDATIONS_DATA)
    })

# ============================================================
# ACCURACY
# ============================================================

@app.route("/accuracy", methods=["GET"])
def accuracy():

    cleaned = [preprocess(t) for t in TRAIN_TEXTS]

    emotion_scores = cross_val_score(
        build_pipeline(),
        cleaned,
        TRAIN_EMOTIONS,
        cv=5,
    )

    reason_scores = cross_val_score(
        build_pipeline(),
        cleaned,
        TRAIN_REASONS,
        cv=5,
    )

    return jsonify({
        "emotion_accuracy":
            round(float(np.mean(emotion_scores)), 3),

        "reason_accuracy":
            round(float(np.mean(reason_scores)), 3),
    })

# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("\nBloom ML Service Running")
    print("Port: 5001")
    print("--- Endpoints:")
    print("   /health")
    print("   /analyze")
    print("   /retrain")
    print("   /accuracy\n")

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )