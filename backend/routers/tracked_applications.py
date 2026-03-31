from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from routers.auth import get_current_user
from db.supabase_client import supabase
from services.ats_engine import score_resume

router = APIRouter()

class TrackedApplicationCreate(BaseModel):
    company: str
    position: str
    status: str = "Wishlist"
    job_description: Optional[str] = ""

class TrackedApplicationUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    job_description: Optional[str] = None

class TrackedApplicationResponse(BaseModel):
    id: str
    company: str
    position: str
    status: str
    job_description: Optional[str]
    match_score: int
    created_at: str
    updated_at: str

@router.get("/", response_model=List[TrackedApplicationResponse])
def get_tracked_applications(user=Depends(get_current_user)):
    """Fetch all Kanban tracked applications for the user."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")

    response = (
        supabase.table("tracked_applications")
        .select("*")
        .eq("user_id", str(user.id))
        .order("created_at", desc=False)
        .execute()
    )
    
    return response.data or []

@router.post("/")
def create_tracked_application(app: TrackedApplicationCreate, user=Depends(get_current_user)):
    """Create a new tracked application and auto-compute ATS match score."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")

    match_score = 0
    
    # ── Try to auto-score using the user's latest built resume ──
    try:
        latest_resume_res = (
            supabase.table("resume_builds")
            .select("resume_data")
            .eq("user_id", str(user.id))
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        
        if latest_resume_res.data and len(latest_resume_res.data) > 0:
            resume_data_dict = latest_resume_res.data[0].get("resume_data", {})
            class DummyResumeData:
                def __init__(self, data_dict, target_role):
                    personal = data_dict.get("personalInfo", {})
                    self.full_name = personal.get("fullName", "") if isinstance(personal, dict) else ""
                    self.email = personal.get("email", "") if isinstance(personal, dict) else ""
                    self.phone = personal.get("phone", "") if isinstance(personal, dict) else ""
                    self.linkedin = personal.get("linkedin", "") if isinstance(personal, dict) else ""
                    self.summary = data_dict.get("summary", "")
                    self.target_role = target_role
                    
                    raw_skills = data_dict.get("skills", [])
                    self.skills = [s for s in raw_skills if isinstance(s, str)] if raw_skills else []
                    self.experience = data_dict.get("experience", [])
                    self.education = data_dict.get("education", [])
                    self.projects = data_dict.get("projects", [])
                    self.template = "classic"
            
            dummy_data = DummyResumeData(resume_data_dict, target_role=app.position)
            score_result = score_resume(dummy_data)
            match_score = score_result.get("score", 0)
    except Exception as e:
        print(f"[Tracked Applications] Failed to auto-score resume: {e}")

    insert_data = {
        "user_id": str(user.id),
        "company": app.company,
        "position": app.position,
        "status": app.status,
        "job_description": app.job_description,
        "match_score": match_score
    }
    
    res = supabase.table("tracked_applications").insert(insert_data).execute()
    
    try:
        supabase.table("activity_log").insert({
            "user_id": str(user.id),
            "activity_type": "kanban_add",
            "action": f"Added {app.company} — {app.position} to Kanban board",
            "metadata": {"company": app.company, "position": app.position}
        }).execute()
    except Exception:
        pass
        
    return res.data[0] if res.data else {"success": True}

@router.put("/{app_id}")
def update_tracked_application(app_id: str, app_update: TrackedApplicationUpdate, user=Depends(get_current_user)):
    """Update a tracked application's status or details."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    update_data = {k: v for k, v in app_update.model_dump().items() if v is not None}
    
    if not update_data:
        return {"success": True, "message": "No changes provided"}
        
    res = supabase.table("tracked_applications").update(update_data).eq("id", app_id).eq("user_id", str(user.id)).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Application not found or unauthorized")
        
    return res.data[0]

@router.delete("/{app_id}")
def delete_tracked_application(app_id: str, user=Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    res = supabase.table("tracked_applications").delete().eq("id", app_id).eq("user_id", str(user.id)).execute()
    return {"success": True}
