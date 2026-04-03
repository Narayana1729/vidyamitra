"""
ML Predictions Router — Exposes trained ML models as API endpoints.
Endpoints: placement prediction, career archetype, role classification,
           skill health analysis, readiness timeline.
"""

import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from routers.auth import get_current_user

router = APIRouter()

# ── Model directory (absolute path) ─────────────────────────────────────────
ML_MODELS_DIR = str(Path(__file__).resolve().parent.parent / "ml" / "models")
ML_DIR = str(Path(__file__).resolve().parent.parent / "ml")

# Ensure ML directory is on sys.path so we can import helpers
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)


# ═══════════════════════════════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════

class PlacementRequest(BaseModel):
    cgpa: float = Field(..., ge=0, le=10)
    leetcode_count: int = Field(..., ge=0)
    certifications_count: int = Field(..., ge=0)
    projects_count: int = Field(..., ge=0)
    internships_count: int = Field(..., ge=0)
    backlogs: int = Field(..., ge=0)
    github_repos: int = Field(..., ge=0)
    hackathons_count: int = Field(..., ge=0)
    skills_count: int = Field(..., ge=0)
    ats_score: float = Field(..., ge=0, le=100)
    interview_score: float = Field(..., ge=0, le=100)
    branch: str


class ArchetypeRequest(BaseModel):
    cgpa: float = Field(..., ge=0, le=10)
    leetcode_count: int = Field(..., ge=0)
    certifications_count: int = Field(..., ge=0)
    projects_count: int = Field(..., ge=0)
    internships_count: int = Field(..., ge=0)
    github_repos: int = Field(..., ge=0)
    hackathons_count: int = Field(..., ge=0)
    skills_count: int = Field(..., ge=0)
    ats_score: float = Field(..., ge=0, le=100)


class RoleRequest(BaseModel):
    skills_text: str = Field(..., min_length=3)


class SkillHealthRequest(BaseModel):
    skills: List[str] = Field(..., min_length=1)
    months_ago: int = Field(0, ge=0)


class WeeklyScore(BaseModel):
    week: int
    resume_score: float = Field(0, ge=0, le=100)
    skill_pct: float = Field(0, ge=0, le=100)
    interview_score: float = Field(0, ge=0, le=100)


class TimelineRequest(BaseModel):
    weekly_scores: List[WeeklyScore] = Field(..., min_length=2)


# ═══════════════════════════════════════════════════════════════════
# HELPER: load models with correct paths
# ═══════════════════════════════════════════════════════════════════

import os
import joblib
import pandas as pd
import numpy as np


def _load_model(filename: str):
    """Load a model from the ML models directory."""
    path = os.path.join(ML_MODELS_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(
            status_code=503,
            detail=f"Model file '{filename}' not found. Run `python ml/train_all.py` to train models."
        )
    return joblib.load(path)


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.post("/predict-placement")
async def predict_placement(req: PlacementRequest, user=Depends(get_current_user)):
    """Predict placement probability using GradientBoosting + SHAP explanations."""
    try:
        model = _load_model("placement_model.pkl")
        scaler = _load_model("placement_scaler.pkl")
        le = _load_model("branch_encoder.pkl")
        explainer = _load_model("shap_explainer.pkl")
        features = _load_model("placement_features.pkl")

        data = req.model_dump()
        
        # Safely map comprehensive frontend domains to precise ML dataset labels
        domain_mapping = {
            "Software Engineering / CS / IT": "CSE",
            "ECE (Electronics & Communication)": "ECE",
            "Electrical & Electronics (EEE)": "EEE",
            "Mechanical Engineering": "Mechanical",
            "Civil Engineering": "Civil"
        }
        raw_branch = data.pop("branch")
        ml_branch = domain_mapping.get(raw_branch, "CSE") # Fallback cleanly
        
        data["branch_encoded"] = int(le.transform([ml_branch])[0])

        X = pd.DataFrame([data])[features]
        X_s = scaler.transform(X)
        prob = float(model.predict_proba(X_s)[0][1])

        # SHAP explanation
        shap_vals = explainer.shap_values(X_s)[0]
        top_factors = sorted(
            [{"feature": f.replace("_", " ").title(), "impact": round(float(v), 4)}
             for f, v in zip(features, shap_vals)],
            key=lambda x: abs(x["impact"]),
            reverse=True
        )[:5]

        for f in top_factors:
            f["direction"] = "positive" if f["impact"] > 0 else "negative"

        verdict = "High" if prob >= 0.70 else ("Moderate" if prob >= 0.40 else "Low")

        return {
            "placement_probability": round(prob * 100, 1),
            "verdict": verdict,
            "top_factors": top_factors,
            "message": (
                f"You have a {round(prob * 100, 1)}% chance of getting placed. "
                f"Your top factor is {top_factors[0]['feature']}."
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/career-archetype")
async def predict_archetype(req: ArchetypeRequest, user=Depends(get_current_user)):
    """Classify student into one of 6 career archetypes using KMeans clustering."""
    try:
        model = _load_model("clustering_model.pkl")
        scaler = _load_model("clustering_scaler.pkl")
        archetypes = _load_model("archetypes.pkl")
        features = _load_model("cluster_features.pkl")

        X = pd.DataFrame([req.model_dump()])[features]
        X_s = scaler.transform(X)

        cluster_id = int(model.predict(X_s)[0])
        distances = model.transform(X_s)[0]

        min_d = float(distances[cluster_id])
        avg_d = float(distances.mean())
        confidence = float(round(max(0, (1 - min_d / (min_d + avg_d)) * 100), 1))

        archetype = archetypes[cluster_id]

        return {
            "cluster_id": cluster_id,
            "archetype": archetype["name"],
            "emoji": archetype["emoji"],
            "description": archetype["description"],
            "career_paths": archetype["career_paths"],
            "strengths": archetype["strengths"],
            "confidence": confidence,
            "color": archetype["color"],
            "message": f"You are a {archetype['emoji']} {archetype['name']} with {confidence}% confidence.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering failed: {str(e)}")


@router.post("/predict-role")
async def predict_role(req: RoleRequest, user=Depends(get_current_user)):
    """Classify skills text into a best-fit job role using TF-IDF + RandomForest."""
    try:
        model = _load_model("role_classifier.pkl")

        probs = model.predict_proba([req.skills_text])[0]
        roles = model.classes_
        top3 = sorted(zip(roles, probs), key=lambda x: x[1], reverse=True)[:3]

        return {
            "best_match": str(top3[0][0]),
            "confidence": round(float(top3[0][1]) * 100, 1),
            "top_matches": [
                {"role": str(r), "score": round(float(p) * 100, 1)} for r, p in top3
            ],
            "message": f"Your skills best match a {str(top3[0][0])} role ({round(float(top3[0][1]) * 100, 1)}% confidence)."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Role prediction failed: {str(e)}")


@router.post("/skill-health")
async def analyze_skill_health(req: SkillHealthRequest, user=Depends(get_current_user)):
    """Analyze skill portfolio health using market trend data."""
    try:
        from skill_decay import analyze_skill_portfolio
        return analyze_skill_portfolio(req.skills, req.months_ago)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill analysis failed: {str(e)}")


@router.post("/readiness-timeline")
async def predict_readiness_timeline(req: TimelineRequest, user=Depends(get_current_user)):
    """Predict when student will be placement-ready using linear regression."""
    try:
        from placement_timeline import predict_readiness_timeline as predict_timeline
        weekly_data = [s.model_dump() for s in req.weekly_scores]
        return predict_timeline(weekly_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timeline prediction failed: {str(e)}")


class SaveInsightsRequest(BaseModel):
    placement_probability: float
    verdict: str
    top_factors: list
    cluster_id: int
    archetype: str
    archetype_emoji: str
    archetype_description: str
    best_role: str
    role_confidence: float
    skill_health: dict
    readiness_timeline: list


@router.post("/save-insights")
async def save_insights(req: SaveInsightsRequest, user=Depends(get_current_user)):
    try:
        from db.supabase_client import supabase
        user_id = str(user.id) if hasattr(user, "id") else None
        if not user_id or not supabase:
            return {"success": False, "message": "No supabase client"}

        update_data = req.model_dump()
        update_data["user_id"] = user_id

        # Check existing
        existing = supabase.table("ai_insights").select("id").eq("user_id", user_id).execute()
        
        from datetime import datetime
        update_data["updated_at"] = datetime.utcnow().isoformat()

        if existing.data:
            supabase.table("ai_insights").update(update_data).eq("user_id", user_id).execute()
        else:
            supabase.table("ai_insights").insert(update_data).execute()

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save insights: {str(e)}")


@router.get("/cached-insights")
async def get_cached_insights(user=Depends(get_current_user)):
    try:
        from db.supabase_client import supabase
        user_id = str(user.id) if hasattr(user, "id") else None
        if not user_id or not supabase:
            return {"cached": False}
        
        res = supabase.table("ai_insights").select("*").eq("user_id", user_id).execute()
        if res.data:
            return {"cached": True, "data": res.data[0]}
        return {"cached": False}
    except Exception as e:
        return {"cached": False, "error": str(e)}
