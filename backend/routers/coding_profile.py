"""
Coding Profile Router — Unified Coding Profile Aggregator.
Fetches and caches coding profiles from LeetCode, Codeforces, GitHub, HackerRank.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from routers.auth import get_current_user
from services.coding_profile import fetch_all_profiles
from utils.db_utils import save_to_supabase
from db.supabase_client import supabase

router = APIRouter()


class ProfileRequest(BaseModel):
    leetcode: Optional[str] = Field(None, description="LeetCode username")
    codeforces: Optional[str] = Field(None, description="Codeforces handle")
    github: Optional[str] = Field(None, description="GitHub username")
    hackerrank: Optional[str] = Field(None, description="HackerRank username")

class HandlesRequest(BaseModel):
    leetcode: Optional[str] = ""
    codeforces: Optional[str] = ""
    github: Optional[str] = ""
    hackerrank: Optional[str] = ""


@router.post("/fetch")
async def fetch_coding_profile(req: ProfileRequest, user=Depends(get_current_user)):
    """Fetch coding profiles from all platforms in parallel (~3-5 seconds)."""
    if not any([req.leetcode, req.codeforces, req.github, req.hackerrank]):
        raise HTTPException(status_code=400, detail="Provide at least one platform username.")

    result = await fetch_all_profiles(
        leetcode_username=req.leetcode,
        codeforces_username=req.codeforces,
        github_username=req.github,
        hackerrank_username=req.hackerrank,
    )

    # Cache to Supabase
    try:
        user_id = str(user.id) if hasattr(user, "id") else None
        if user_id and supabase:
            cache_data = {
                "user_id": user_id,
                "leetcode_username": req.leetcode or "",
                "codeforces_username": req.codeforces or "",
                "github_username": req.github or "",
                "hackerrank_username": req.hackerrank or "",
                "profile_data": result,
                "coding_score": result.get("computed", {}).get("coding_score", 0),
                "updated_at": datetime.utcnow().isoformat(),
            }
            # Upsert (delete old + insert new)
            try:
                supabase.table("coding_profiles").delete().eq("user_id", user_id).execute()
            except:
                pass
            save_to_supabase("coding_profiles", cache_data)
    except Exception as e:
        print(f"[CodingProfile] Cache save failed (non-blocking): {e}")

    return result


@router.get("/cached")
async def get_cached_profile(user=Depends(get_current_user)):
    """Return the most recently cached coding profile for this user."""
    try:
        user_id = str(user.id) if hasattr(user, "id") else None
        if not user_id or not supabase:
            return {"cached": False, "message": "No cached profile available."}

        result = (
            supabase.table("coding_profiles")
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .limit(1)
            .execute()
        )

        if result.data:
            return {
                "cached": True,
                "profile": result.data[0].get("profile_data", {}),
                "coding_score": result.data[0].get("coding_score", 0),
                "updated_at": result.data[0].get("updated_at"),
                "usernames": {
                    "leetcode": result.data[0].get("leetcode_username", ""),
                    "codeforces": result.data[0].get("codeforces_username", ""),
                    "github": result.data[0].get("github_username", ""),
                    "hackerrank": result.data[0].get("hackerrank_username", ""),
                },
            }
        return {"cached": False, "message": "No cached profile. Use /fetch to build one."}
    except Exception as e:
        return {"cached": False, "message": f"Cache lookup failed: {str(e)}"}


@router.post("/save-handles")
async def save_handles(req: HandlesRequest, user=Depends(get_current_user)):
    """Auto-save coding handles to Supabase without fetching profiles."""
    try:
        user_id = str(user.id) if hasattr(user, "id") else None
        if not user_id or not supabase:
            return {"success": False}

        update_data = {
            "user_id": user_id,
            "leetcode_username": req.leetcode or "",
            "codeforces_username": req.codeforces or "",
            "github_username": req.github or "",
            "hackerrank_username": req.hackerrank or "",
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Check if row exists
        existing = supabase.table("coding_profiles").select("id").eq("user_id", user_id).execute()

        if existing.data:
            supabase.table("coding_profiles").update(update_data).eq("user_id", user_id).execute()
        else:
            supabase.table("coding_profiles").insert(update_data).execute()

        return {"success": True}
    except Exception as e:
        print(f"[CodingProfile] Handles save failed: {e}")
        return {"success": False, "error": str(e)}
