"""
User Data Hydration Router
Returns the user's latest saved data from Supabase for cross-device persistence.
"""
from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from db.supabase_client import supabase

router = APIRouter()

@router.get("/latest")
async def get_latest_user_data(user=Depends(get_current_user)):
    """Fetch the user's most recent analysis results for cross-device hydration."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not available")

    uid = str(user.id)
    result = {}

    # 1. Latest Resume Analysis
    try:
        res = (
            supabase.table("resume_analyses")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        result["resume_analysis"] = res.data[0] if res.data else None
    except Exception:
        result["resume_analysis"] = None

    # 2. Latest Skill Gap Analysis
    try:
        res = (
            supabase.table("skill_analyses")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        result["skill_analysis"] = res.data[0] if res.data else None
    except Exception:
        result["skill_analysis"] = None

    # 3. Latest Roadmap
    try:
        res = (
            supabase.table("roadmaps")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        result["roadmap"] = res.data[0] if res.data else None
    except Exception:
        result["roadmap"] = None

    # 4. Latest Resume Build
    try:
        res = (
            supabase.table("resume_builds")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        result["resume_build"] = res.data[0] if res.data else None
    except Exception:
        result["resume_build"] = None

    return result
