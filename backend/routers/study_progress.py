"""
Study Progress Router — Save/Load study roadmap progress to Supabase.
Persists completed topics, tick marks, view mode, branch, tab per track per user.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from routers.auth import get_current_user
from db.supabase_client import supabase

router = APIRouter()


class SaveProgressRequest(BaseModel):
    track: str                    # 'gate', 'upsc', 'mba', 'masters', etc.
    progress_data: dict           # all state: prefs, completedTopics, struckDays, viewMode, branch, tab


@router.get("/{track}")
async def get_progress(track: str, user=Depends(get_current_user)):
    """Load saved study progress for a specific track."""
    user_id = str(user.id)
    if not supabase:
        return {"progress_data": None}

    try:
        result = (
            supabase.table("study_progress")
            .select("progress_data, updated_at")
            .eq("user_id", user_id)
            .eq("track", track.lower())
            .limit(1)
            .execute()
        )
        if result.data:
            return {
                "progress_data": result.data[0].get("progress_data", {}),
                "updated_at": result.data[0].get("updated_at"),
            }
        return {"progress_data": None}
    except Exception as e:
        print(f"[StudyProgress] Load failed: {e}")
        return {"progress_data": None, "error": str(e)}


@router.post("/save")
async def save_progress(req: SaveProgressRequest, user=Depends(get_current_user)):
    """Save study progress for a specific track (upsert)."""
    user_id = str(user.id)
    if not supabase:
        raise HTTPException(503, "Database not available")

    track = req.track.lower()

    try:
        # Upsert: insert or update on conflict (user_id, track)
        data = {
            "user_id": user_id,
            "track": track,
            "progress_data": req.progress_data,
            "updated_at": datetime.utcnow().isoformat(),
        }
        supabase.table("study_progress").upsert(
            data, on_conflict="user_id,track"
        ).execute()

        return {"success": True, "track": track}
    except Exception as e:
        print(f"[StudyProgress] Save failed: {e}")
        raise HTTPException(500, f"Failed to save progress: {str(e)}")
