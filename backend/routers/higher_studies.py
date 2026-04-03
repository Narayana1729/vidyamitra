from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from routers.auth import get_current_user
from db.supabase_client import supabase

router = APIRouter()

class ProgressUpdate(BaseModel):
    roadmap_prefs: Optional[Dict[str, Any]] = None
    struck_out_days: Optional[Dict[str, Any]] = None
    quiz_history: Optional[List[Dict[str, Any]]] = None

class ActivityLog(BaseModel):
    action: str
    metadata: Optional[Dict[str, Any]] = {}

@router.get("/progress/{track}")
async def get_higher_studies_progress(track: str, user=Depends(get_current_user)):
    if not supabase:
        return {"roadmap_prefs": None, "struck_out_days": {}, "quiz_history": []}
        
    try:
        res = (
            supabase.table("higher_studies_progress")
            .select("*")
            .eq("user_id", str(user.id))
            .eq("track", track)
            .execute()
        )
        
        if res.data:
            data = res.data[0]
            return {
                "roadmap_prefs": data.get("roadmap_prefs"),
                "struck_out_days": data.get("struck_out_days") or {},
                "quiz_history": data.get("quiz_history") or []
            }
            
        return {"roadmap_prefs": None, "struck_out_days": {}, "quiz_history": []}
    except Exception as e:
        print(f"[HigherStudies] Fetch Error: {e}")
        return {"roadmap_prefs": None, "struck_out_days": {}, "quiz_history": []}

@router.post("/progress/{track}")
async def update_higher_studies_progress(track: str, data: ProgressUpdate, user=Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not available")
    
    uid = str(user.id)
    
    try:
        # Check if exists
        existing = supabase.table("higher_studies_progress").select("id").eq("user_id", uid).eq("track", track).execute()
        
        payload = {}
        if data.roadmap_prefs is not None:
            payload["roadmap_prefs"] = data.roadmap_prefs
        if data.struck_out_days is not None:
            payload["struck_out_days"] = data.struck_out_days
        if data.quiz_history is not None:
            payload["quiz_history"] = data.quiz_history
            
        # Avoid empty updates
        if not payload:
            return {"status": "success", "message": "No data to update"}

        if existing.data:
            res = (
                supabase.table("higher_studies_progress")
                .update(payload)
                .eq("user_id", uid)
                .eq("track", track)
                .execute()
            )
        else:
            payload["user_id"] = uid
            payload["track"] = track
            res = (
                supabase.table("higher_studies_progress")
                .insert(payload)
                .execute()
            )
            
        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        print(f"[HigherStudies] Update Error: {e}")
        # Soft failure: if the table doesn't exist yet, we just return success (since we can't alter Supabase from here easily)
        if "relation \"higher_studies_progress\" does not exist" in str(e):
            return {"status": "table_missing", "message": "Run SQL schema script to create higher_studies_progress table."}
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/log-activity")
async def log_higher_studies_activity(activity: ActivityLog, user=Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not available")
        
    try:
        res = (
            supabase.table("activity_log")
            .insert({
                "user_id": str(user.id),
                "activity_type": "higher_studies",
                "action": activity.action,
                "metadata": activity.metadata or {}
            })
            .execute()
        )
        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        print(f"[HigherStudies] Activity Log Error: {e}")
        # Check if the missing columns issue
        return {"status": "soft_fail", "message": "Could not log activity"}
