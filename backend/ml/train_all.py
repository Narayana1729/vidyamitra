"""
VidyaMitra — ML Training Pipeline (Run Everything)
Trains all models in sequence and saves them to models/

Run from backend/ml/ directory:
    cd backend/ml
    python train_all.py
"""

import os
import sys
import time

print("=" * 55)
print("  🚀 VidyaMitra — ML Training Pipeline")
print("=" * 55)

# ── Step 1: Generate Dataset ──────────────────────────────────
print("\n📊 Step 1/4 — Generating synthetic student dataset...")
t0 = time.time()

os.makedirs('data',   exist_ok=True)
os.makedirs('models', exist_ok=True)

from generate_dataset import generate_students
import pandas as pd

df = generate_students()
df.to_csv('data/students.csv', index=False)

print(f"   ✅ {len(df)} student profiles → data/students.csv  [{time.time()-t0:.1f}s]")
print(f"   Placement rate : {df['placed'].mean():.1%}")

# ── Step 2: Placement Prediction Model ───────────────────────
print("\n🎯 Step 2/4 — Training Placement Prediction Model (GradientBoosting + SHAP)...")
t0 = time.time()

from train_placement_model import train as train_placement
train_placement()

print(f"   [{time.time()-t0:.1f}s]")

# ── Step 3: Student Clustering ────────────────────────────────
print("\n🧩 Step 3/4 — Training Student Clustering Model (KMeans — 6 archetypes)...")
t0 = time.time()

from train_clustering_model import train as train_clustering
train_clustering()

print(f"   [{time.time()-t0:.1f}s]")

# ── Step 4: Role Classifier ───────────────────────────────────
print("\n📝 Step 4/4 — Training Resume-to-Role Classifier (TF-IDF + RandomForest)...")
t0 = time.time()

from train_role_classifier import train as train_roles
train_roles()

print(f"   [{time.time()-t0:.1f}s]")

# ── Summary ───────────────────────────────────────────────────
print("\n" + "=" * 55)
print("  ✅ All models trained and saved!")
print("=" * 55)
print("\n📦 Files in models/:")
for f in sorted(os.listdir('models')):
    size = os.path.getsize(f'models/{f}') / 1024
    print(f"   {f:<40s}  {size:>6.1f} KB")

print("\n📄 Files in data/:")
for f in sorted(os.listdir('data')):
    size = os.path.getsize(f'data/{f}') / 1024
    print(f"   {f:<40s}  {size:>6.1f} KB")

print("\n🎯 Next steps for Person 2 (Backend):")
print("   Load models with: joblib.load('backend/ml/models/placement_model.pkl')")
print("   Wire into FastAPI: /api/ml/predict, /api/ml/cluster, /api/ml/role")
print()
