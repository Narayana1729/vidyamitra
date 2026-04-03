import sys
from pathlib import Path
import json

base_dir = Path("/Users/srimannarayanadeevi/Documents/vidyamitra/backend")
sys.path.insert(0, str(base_dir))


# Let's write a quick inline test
try:
    from routers.ml_router import _load_model, ML_MODELS_DIR
    import pandas as pd
    import os
    
    print(f"ML_MODELS_DIR: {ML_MODELS_DIR}")
    print(f"Files inside models dir: {os.listdir(ML_MODELS_DIR)}")
    
    # 1. Placement prediction
    print("\n--- Testing Placement Prediction ---")
    data = {
        "cgpa": 8.5,
        "leetcode_count": 120,
        "certifications_count": 2,
        "projects_count": 4,
        "internships_count": 1,
        "backlogs": 0,
        "github_repos": 15,
        "hackathons_count": 2,
        "skills_count": 8,
        "ats_score": 85,
        "interview_score": 75,
        "branch": "CSE"
    }
    
    model = _load_model("placement_model.pkl")
    scaler = _load_model("placement_scaler.pkl")
    le = _load_model("branch_encoder.pkl")
    explainer = _load_model("shap_explainer.pkl")
    features = _load_model("placement_features.pkl")
    print("Loaded all models for placement.")
    
    data["branch_encoded"] = int(le.transform([data.pop("branch")])[0])
    X = pd.DataFrame([data])[features]
    X_s = scaler.transform(X)
    prob = float(model.predict_proba(X_s)[0][1])
    print(f"Placement Prob: {prob}")
    
    # 2. Archetype
    print("\n--- Testing Career Archetype ---")
    data2 = {
        "cgpa": 8.5,
        "leetcode_count": 120,
        "certifications_count": 2,
        "projects_count": 4,
        "internships_count": 1,
        "github_repos": 15,
        "hackathons_count": 2,
        "skills_count": 8,
        "ats_score": 85
    }
    model_c = _load_model("clustering_model.pkl")
    scaler_c = _load_model("clustering_scaler.pkl")
    archetypes = _load_model("archetypes.pkl")
    features_c = _load_model("cluster_features.pkl")
    print("Loaded all models for archetype.")
    
    X2 = pd.DataFrame([data2])[features_c]
    X2_s = scaler_c.transform(X2)
    cluster_id = int(model_c.predict(X2_s)[0])
    print(f"Cluster ID: {cluster_id}")
    
    # 3. Predict Role
    print("\n--- Testing Predict Role ---")
    model_r = _load_model("role_classifier.pkl")
    print("Loaded model for roles.")
    probs = model_r.predict_proba(["Python, Java, React, SQL, Machine Learning, Data Structures"])[0]
    print(f"Role Prob: {probs[0]}")
    
    # 4. Skill Health
    print("\n--- Testing Skill Health ---")
    sys.path.insert(0, str(base_dir / "ml"))
    from skill_decay import analyze_skill_portfolio
    print(analyze_skill_portfolio(["React", "Python", "NodeJS", "Docker"], 6))
    
    # 5. Readiness Timeline
    print("\n--- Testing Readiness Timeline ---")
    from placement_timeline import predict_readiness_timeline
    weekly_data = [
        {"week": 1, "resume_score": 60, "skill_pct": 50, "interview_score": 40},
        {"week": 2, "resume_score": 80, "skill_pct": 70, "interview_score": 80}
    ]
    print(predict_readiness_timeline(weekly_data))
    
    print("\nALL PASSED SUCCESSFULLY!")

except Exception as e:
    import traceback
    traceback.print_exc()
