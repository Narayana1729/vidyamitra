from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from routers.auth import get_current_user
from db.supabase_client import supabase
from typing import Dict, Any

router = APIRouter()

class PreferencesInput(BaseModel):
    preferences: Dict[str, Any]

@router.get("/preferences")
async def get_gate_preferences(user = Depends(get_current_user)):
    """Fetch GATE roadmap preferences from the roadmaps table"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not available")
    
    uid = str(user.id)
    try:
        res = (
            supabase.table("roadmaps")
            .select("phases")
            .eq("user_id", uid)
            .eq("target_role", "GATE_PREP")
            .execute()
        )
        if res.data and len(res.data) > 0:
            return {"preferences": res.data[0].get("phases", {})}
        return {"preferences": {}}
    except Exception as e:
        print(f"Error fetching gate preferences: {e}")
        return {"preferences": {}}

@router.post("/preferences")
async def save_gate_preferences(
    payload: PreferencesInput,
    user = Depends(get_current_user)
):
    """Save GATE roadmap preferences to the roadmaps table"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not available")
    
    uid = str(user.id)
    try:
        # Check if exists
        res = (
            supabase.table("roadmaps")
            .select("id")
            .eq("user_id", uid)
            .eq("target_role", "GATE_PREP")
            .execute()
        )
        
        if res.data and len(res.data) > 0:
            # Update
            row_id = res.data[0]["id"]
            supabase.table("roadmaps").update({
                "phases": payload.preferences
            }).eq("id", row_id).execute()
        else:
            # Insert
            supabase.table("roadmaps").insert({
                "user_id": uid,
                "target_role": "GATE_PREP",
                "phases": payload.preferences
            }).execute()
            
        return {"message": "Preferences saved successfully"}
    except Exception as e:
        print(f"Error saving gate preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to save preferences to database")
