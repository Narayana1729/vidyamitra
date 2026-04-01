"""
VidyaMitra — Student Clustering Model (Career Archetypes)
KMeans → 6 archetypes e.g. "ML/AI Specialist", "DevOps Builder"
Output: models/clustering_model.pkl, models/clustering_scaler.pkl
Run: python train_clustering_model.py
"""

import os
import pandas as pd
import numpy as np
import joblib

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# ── Archetype definitions (manually labelled after inspecting centroids) ──────
ARCHETYPES = {
    0: {
        "name"        : "ML / AI Specialist",
        "emoji"       : "🤖",
        "description" : "Strong in Python, statistics, and machine learning. High LeetCode, active on Kaggle and notebooks.",
        "career_paths": ["Data Scientist", "ML Engineer", "AI Researcher"],
        "strengths"   : ["Analytical thinking", "Statistical modelling", "Python expertise"],
        "color"       : "#6366f1",
    },
    1: {
        "name"        : "Full Stack Builder",
        "emoji"       : "🏗️",
        "description" : "Strong project portfolio, diverse skills, multiple internships. Excels at end-to-end product development.",
        "career_paths": ["Full Stack Developer", "Product Engineer", "Startup Founder"],
        "strengths"   : ["Project delivery", "Versatile skill set", "Internship experience"],
        "color"       : "#10b981",
    },
    2: {
        "name"        : "DevOps / Cloud Engineer",
        "emoji"       : "☁️",
        "description" : "High certifications count, strong GitHub activity, cloud-native mindset and automation focus.",
        "career_paths": ["DevOps Engineer", "Cloud Architect", "SRE"],
        "strengths"   : ["Infrastructure automation", "Cloud certifications", "CI/CD pipelines"],
        "color"       : "#f59e0b",
    },
    3: {
        "name"        : "Core Domain Expert",
        "emoji"       : "⚙️",
        "description" : "High CGPA, strong domain knowledge (ECE/Mech/Civil), fewer software skills but deep technical expertise.",
        "career_paths": ["Core Engineer", "R&D Engineer", "Technical Specialist"],
        "strengths"   : ["Domain depth", "Academic excellence", "Analytical rigour"],
        "color"       : "#ef4444",
    },
    4: {
        "name"        : "Competitive Programmer",
        "emoji"       : "🏆",
        "description" : "Very high LeetCode count, hackathon wins, strong algorithmic thinking. Targets product companies.",
        "career_paths": ["Software Engineer (FAANG)", "Algorithm Engineer", "Backend Developer"],
        "strengths"   : ["Problem solving", "Data structures", "Competitive coding"],
        "color"       : "#8b5cf6",
    },
    5: {
        "name"        : "Balanced All-Rounder",
        "emoji"       : "⭐",
        "description" : "Consistent across CGPA, skills, projects, and communication. Highly adaptable and versatile.",
        "career_paths": ["Business Analyst", "Product Manager", "Consultant"],
        "strengths"   : ["Adaptability", "Communication", "Well-rounded profile"],
        "color"       : "#06b6d4",
    },
}

CLUSTER_FEATURES = [
    'cgpa', 'leetcode_count', 'certifications_count', 'projects_count',
    'internships_count', 'github_repos', 'hackathons_count',
    'skills_count', 'ats_score'
]


def train():
    os.makedirs('models', exist_ok=True)

    df     = pd.read_csv('data/students.csv')
    X      = df[CLUSTER_FEATURES]

    scaler = StandardScaler()
    X_s    = scaler.fit_transform(X)

    model  = KMeans(n_clusters=6, n_init=30, max_iter=500, random_state=42)
    labels = model.fit_predict(X_s)

    df['cluster'] = labels

    # ── Save ──
    joblib.dump(model,       'models/clustering_model.pkl')
    joblib.dump(scaler,      'models/clustering_scaler.pkl')
    joblib.dump(ARCHETYPES,  'models/archetypes.pkl')
    joblib.dump(CLUSTER_FEATURES, 'models/cluster_features.pkl')

    print("✅ Clustering Model trained (6 archetypes)")
    dist = pd.Series(labels).value_counts().sort_index()
    for cluster_id, count in dist.items():
        archetype = ARCHETYPES[cluster_id]
        print(f"   Cluster {cluster_id}: {archetype['emoji']} {archetype['name']:30s} → {count} students")

    return model, scaler


# ── Inference helper ──────────────────────────────────────────────────────────
def predict_archetype(student_data: dict) -> dict:
    """
    Input: dict with keys matching CLUSTER_FEATURES (no 'branch' needed)
    """
    model      = joblib.load('models/clustering_model.pkl')
    scaler     = joblib.load('models/clustering_scaler.pkl')
    archetypes = joblib.load('models/archetypes.pkl')
    features   = joblib.load('models/cluster_features.pkl')

    X          = pd.DataFrame([student_data])[features]
    X_s        = scaler.transform(X)

    cluster_id = int(model.predict(X_s)[0])
    distances  = model.transform(X_s)[0]

    # Confidence = how much closer to this centroid vs average
    min_d      = distances[cluster_id]
    avg_d      = distances.mean()
    confidence = round(max(0, (1 - min_d / (min_d + avg_d)) * 100), 1)

    archetype  = archetypes[cluster_id]

    return {
        "cluster_id"    : cluster_id,
        "archetype"     : archetype["name"],
        "emoji"         : archetype["emoji"],
        "description"   : archetype["description"],
        "career_paths"  : archetype["career_paths"],
        "strengths"     : archetype["strengths"],
        "confidence"    : confidence,
        "color"         : archetype["color"],
        "message"       : f"You are a {archetype['emoji']} {archetype['name']} with {confidence}% confidence.",
    }


if __name__ == '__main__':
    train()

    print("\n── Smoke Test ──")
    result = predict_archetype({
        'cgpa': 7.5, 'leetcode_count': 250, 'certifications_count': 2,
        'projects_count': 4, 'internships_count': 1, 'github_repos': 20,
        'hackathons_count': 5, 'skills_count': 15, 'ats_score': 68.0
    })
    print(f"Archetype  : {result['emoji']} {result['archetype']}")
    print(f"Confidence : {result['confidence']}%")
    print(f"Career Paths: {', '.join(result['career_paths'])}")
