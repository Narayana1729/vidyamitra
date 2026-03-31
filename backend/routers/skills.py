from fastapi import APIRouter, HTTPException, Depends
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

from services.skillgap_engine import analyze_skill_gap
from db.supabase_client import supabase

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════

class SkillGapRequest(BaseModel):
    current_skills: list[str]
    target_role: str
    experience_level: str = "Beginner"   # Beginner | Intermediate | Advanced
    domain: Optional[str] = None         # Frontend can send domain directly


class SkillDetail(BaseModel):
    name: str
    level: str
    priority: str
    description: str


class RoadmapPhase(BaseModel):
    phase: int
    title: str
    skills: list[str]
    duration: str
    focus: str


class LearningPlan(BaseModel):
    weekly_structure: list[str]
    daily_hours: int
    milestones: list[str]
    tips: list[str]


class ProjectSuggestion(BaseModel):
    name: str
    description: str
    skills_practiced: list[str]
    difficulty: str
    estimated_time: str


class HackathonRecommendation(BaseModel):
    name: str
    platform: str
    url: str
    type: str
    frequency: str
    description: str
    team_size: str
    matching_skills: list[str]
    relevance_score: int


class CertificationRecommendation(BaseModel):
    name: str
    provider: str
    url: str
    cost: str
    difficulty: str
    duration: str
    description: str
    matching_skills: list[str]
    relevance_score: int


class IndustryBenchmarks(BaseModel):
    domain: str
    jds_analyzed: int
    last_updated: str
    source_platforms: list[str]
    top_demanded_skills: list[dict]
    avg_openings_per_month: int
    top_hiring_companies: list[str]


class SkillGapResponse(BaseModel):
    target_role: str
    match_percentage: int
    matched_skills: list[str]
    missing_skills: list[SkillDetail]
    priority_roadmap: list[RoadmapPhase]
    learning_plan: LearningPlan
    project_suggestions: list[ProjectSuggestion]
    hackathon_recommendations: list[HackathonRecommendation] = []
    certification_recommendations: list[CertificationRecommendation] = []
    industry_benchmarks: Optional[IndustryBenchmarks] = None
    cached: bool = False


# ═══════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════

# Use shared helper from utils/db_utils instead of duplicating
from utils.db_utils import save_to_supabase as _save_to_supabase


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.post("/analyze", response_model=SkillGapResponse)
async def api_analyze_skills(request: SkillGapRequest, user = Depends(get_current_user)):
    """Full skill gap analysis with AI-powered roadmap, plan, and projects."""
    try:
        # ── 1. Check Cache ──
        if supabase:
            from datetime import datetime, timedelta
            yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
            
            cached = (
                supabase.table("skill_analyses")
                .select("*")
                .eq("user_id", str(user.id))
                .eq("target_role", request.target_role)
                .eq("experience_level", request.experience_level)
                .gte("created_at", yesterday)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            
            if cached.data:
                print(f"[Skills] Serving cached analysis for {request.target_role}")
                data = cached.data[0]
                
                # Transform data back to response format
                return SkillGapResponse(
                    target_role=data.get("target_role", request.target_role),
                    match_percentage=data.get("match_percentage", 0),
                    matched_skills=data.get("matched_skills", []),
                    missing_skills=data.get("missing_skills", []),
                    priority_roadmap=data.get("priority_roadmap", []),
                    learning_plan=data.get("learning_plan", {}),
                    project_suggestions=data.get("project_suggestions", []),
                    cached=True
                )

        # ── 1.5 Fetch User Domain ──
        domain = request.domain or "Software Engineering / CS / IT"
        if domain == "Software Engineering / CS / IT" and supabase:
            try:
                profile = supabase.table("profiles").select("domain").eq("id", str(user.id)).maybe_single().execute()
                if profile.data and profile.data.get("domain"):
                    domain = profile.data["domain"]
            except Exception as e:
                print(f"[Skills] Failed to fetch domain: {e}")

        # ── 2. Generate New Analysis ──
        result = analyze_skill_gap(
            current_skills=request.current_skills,
            target_role=request.target_role,
            experience_level=request.experience_level,
            domain=domain,
        )

        # ── Save to Supabase ──
        _save_to_supabase("skill_analyses", {
            "user_id": str(user.id),
            "target_role": request.target_role,
            "experience_level": request.experience_level,
            "match_percentage": result.get("match_percentage"),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": [s if isinstance(s, dict) else {"name": s} for s in result.get("missing_skills", [])],
            "priority_roadmap": result.get("priority_roadmap", []),
            "learning_plan": result.get("learning_plan", {}),
            "project_suggestions": result.get("project_suggestions", []),
        })
        _save_to_supabase("activity_log", {
            "user_id": str(user.id),
            "activity_type": "skill",
            "action": f"Skill gap analyzed for {request.target_role} — {result.get('match_percentage', 0)}% match",
            "metadata": {
                "target_role": request.target_role,
                "match_percentage": result.get("match_percentage"),
                "skills_count": len(request.current_skills),
            },
        })

        return SkillGapResponse(**result)
    except Exception as e:
        print(f"[Skills] Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Skill gap analysis failed: {str(e)}")


@router.get("/roles")
async def get_available_roles():
    return {
        "roles": [
            {"id": "frontend_developer", "name": "Frontend Developer"},
            {"id": "backend_developer", "name": "Backend Developer"},
            {"id": "data_scientist", "name": "Data Scientist"},
            {"id": "devops_engineer", "name": "DevOps Engineer"},
            {"id": "mobile_developer", "name": "Mobile Developer"},
            {"id": "full_stack_developer", "name": "Full Stack Developer"},
        ]
    }
