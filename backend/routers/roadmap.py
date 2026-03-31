from fastapi import APIRouter, HTTPException, Depends
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

from services.roadmap_engine import generate_roadmap
from db.supabase_client import supabase

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════

class RoadmapRequest(BaseModel):
    target_role: str
    current_level: str = "Beginner"                # Beginner | Intermediate | Advanced
    missing_skills: Optional[list[str]] = None      # explicit override
    timeline_months: int = 6
    daily_time_commitment: int = 2                  # hours per day


class ResourceItem(BaseModel):
    name: str
    url: str
    platform: str


class Phase(BaseModel):
    title: str
    duration: str
    skills: list[str]
    reasoning: str
    daily_plan: list[str]
    project_to_build: str
    expected_outcome: str
    resources: list[ResourceItem]


class RoadmapResponse(BaseModel):
    target_role: str
    total_duration: str
    phases: list[Phase]
    tips: list[str]
    cached: bool = False


# ═══════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════

def _save_to_supabase(table: str, data: dict):
    if not supabase:
        return None
    try:
        return supabase.table(table).insert(data).execute()
    except Exception as e:
        print(f"[Supabase] Failed to save to {table}: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════
# ENDPOINT
# ═══════════════════════════════════════════════════════════════════

@router.post("/generate", response_model=RoadmapResponse)
async def api_generate_roadmap(request: RoadmapRequest, user = Depends(get_current_user)):
    """Generate a production-grade, personalized learning roadmap."""
    try:
        # ── Fetch User Domain ──
        domain = "Software Engineering / CS / IT"
        if supabase:
            try:
                profile = supabase.table("profiles").select("domain").eq("id", str(user.id)).maybe_single().execute()
                if profile.data and profile.data.get("domain"):
                    domain = profile.data["domain"]
            except Exception as e:
                print(f"[Roadmap] Failed to fetch domain: {e}")

        result = generate_roadmap(
            target_role=request.target_role,
            current_level=request.current_level,
            missing_skills=request.missing_skills if request.missing_skills else None,
            timeline_months=request.timeline_months,
            daily_time_commitment=request.daily_time_commitment,
            domain=domain,
        )

        # ── Save to Supabase ──
        _save_to_supabase("roadmaps", {
            "user_id": str(user.id),
            "target_role": request.target_role,
            "current_level": request.current_level,
            "total_duration": result.get("total_duration"),
            "phases": result.get("phases", []),
            "tips": result.get("tips", []),
        })
        _save_to_supabase("activity_log", {
            "user_id": str(user.id),
            "activity_type": "roadmap",
            "action": f"Learning roadmap generated for {request.target_role} ({request.current_level})",
            "metadata": {
                "target_role": request.target_role,
                "level": request.current_level,
                "phases": len(result.get("phases", [])),
            },
        })

        return RoadmapResponse(**result)
    except Exception as e:
        print(f"[Roadmap] Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")
