"""
VidyaMitra — Placement Prediction Model
GradientBoosting classifier + SHAP explanations
Output: models/placement_model.pkl, models/placement_scaler.pkl, models/shap_explainer.pkl
Run: python train_placement_model.py
"""

import os
import pandas as pd
import numpy as np
import joblib
import shap

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

FEATURES = [
    'cgpa', 'leetcode_count', 'certifications_count', 'projects_count',
    'internships_count', 'backlogs', 'github_repos', 'hackathons_count',
    'skills_count', 'ats_score', 'interview_score', 'branch_encoded'
]


def train():
    os.makedirs('models', exist_ok=True)

    df = pd.read_csv('data/students.csv')

    # Encode branch
    le = LabelEncoder()
    df['branch_encoded'] = le.fit_transform(df['branch'])

    X = df[FEATURES]
    y = df['placed']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        min_samples_split=10,
        subsample=0.8,
        random_state=42
    )
    model.fit(X_train_s, y_train)

    # ── Evaluation ──
    y_pred = model.predict(X_test_s)
    acc    = accuracy_score(y_test, y_pred)
    cv_scores = cross_val_score(model, scaler.transform(X), y, cv=5, scoring='accuracy')

    print(f"✅ Placement Model")
    print(f"   Test Accuracy  : {acc:.2%}")
    print(f"   CV Accuracy    : {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")
    print()
    print(classification_report(y_test, y_pred, target_names=['Not Placed', 'Placed']))

    # ── SHAP ──
    explainer   = shap.TreeExplainer(model)
    shap_sample = X_train_s[:200]  # save explainer fitted on training sample

    # ── Save ──
    joblib.dump(model,        'models/placement_model.pkl')
    joblib.dump(scaler,       'models/placement_scaler.pkl')
    joblib.dump(le,           'models/branch_encoder.pkl')
    joblib.dump(explainer,    'models/shap_explainer.pkl')
    joblib.dump(FEATURES,     'models/placement_features.pkl')

    print("✅ Saved: placement_model.pkl | placement_scaler.pkl | branch_encoder.pkl | shap_explainer.pkl")
    return model, scaler, explainer


# ── Inference helper (used by FastAPI later) ──────────────────────────────────
def predict_placement(student_data: dict) -> dict:
    """
    Input example:
    {
        'cgpa': 7.8, 'leetcode_count': 120, 'certifications_count': 3,
        'projects_count': 5, 'internships_count': 1, 'backlogs': 0,
        'github_repos': 12, 'hackathons_count': 2, 'skills_count': 18,
        'ats_score': 72.0, 'interview_score': 65.0, 'branch': 'CSE'
    }
    """
    model     = joblib.load('models/placement_model.pkl')
    scaler    = joblib.load('models/placement_scaler.pkl')
    le        = joblib.load('models/branch_encoder.pkl')
    explainer = joblib.load('models/shap_explainer.pkl')
    features  = joblib.load('models/placement_features.pkl')

    data = student_data.copy()
    data['branch_encoded'] = le.transform([data.pop('branch')])[0]

    X       = pd.DataFrame([data])[features]
    X_s     = scaler.transform(X)
    prob    = float(model.predict_proba(X_s)[0][1])

    # SHAP explanation
    shap_vals = explainer.shap_values(X_s)[0]
    top_factors = sorted(
        [{"feature": f.replace('_', ' ').title(), "impact": round(float(v), 4)}
         for f, v in zip(features, shap_vals)],
        key=lambda x: abs(x["impact"]),
        reverse=True
    )[:5]

    for f in top_factors:
        f["direction"] = "positive" if f["impact"] > 0 else "negative"

    verdict = "High" if prob >= 0.70 else ("Moderate" if prob >= 0.40 else "Low")

    return {
        "placement_probability" : round(prob * 100, 1),
        "verdict"               : verdict,
        "top_factors"           : top_factors,
        "message": (
            f"You have a {round(prob*100,1)}% chance of getting placed. "
            f"Your top positive factor is {top_factors[0]['feature']}."
        )
    }


if __name__ == '__main__':
    train()

    # Quick smoke test
    print("\n── Smoke Test ──")
    result = predict_placement({
        'cgpa': 8.2, 'leetcode_count': 150, 'certifications_count': 4,
        'projects_count': 6, 'internships_count': 1, 'backlogs': 0,
        'github_repos': 18, 'hackathons_count': 3, 'skills_count': 22,
        'ats_score': 78.0, 'interview_score': 72.0, 'branch': 'CSE'
    })
    print(f"Placement Probability : {result['placement_probability']}%")
    print(f"Verdict               : {result['verdict']}")
    print(f"Top Factors:")
    for f in result['top_factors']:
        sign = "+" if f['direction'] == 'positive' else "-"
        print(f"  {sign} {f['feature']} ({f['impact']:+.4f})")
