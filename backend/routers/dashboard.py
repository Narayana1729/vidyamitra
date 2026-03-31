from fastapi import APIRouter, Query, Depends
from routers.auth import get_current_user
from services.insights_engine import generate_dashboard_intelligence
from db.supabase_client import supabase

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(period: str = Query("week", pattern="^(week|month|all)$"), user = Depends(get_current_user)):
    """Return complete dashboard data with computed intelligence."""
    return generate_dashboard_intelligence(period=period, user_id=str(user.id))


@router.get("/activity")
async def get_recent_activity(limit: int = Query(20, ge=1, le=100), user = Depends(get_current_user)):
    """Fetch recent activity from Supabase activity_log."""
    if not supabase:
        return {"activities": [], "message": "Supabase not connected"}

    try:
        result = (
            supabase.table("activity_log")
            .select("*")
            .eq("user_id", str(user.id))
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"activities": result.data}
    except Exception as e:
        print(f"[Dashboard] Activity fetch error: {e}")
        return {"activities": [], "error": str(e)}


@router.get("/history")
async def get_history_data(user = Depends(get_current_user)):
    """Fetch stored historical data for dashboard charts."""
    if not supabase:
        return {"resume_analyses": [], "skill_analyses": [], "interview_answers": []}

    try:
        resume_data = (
            supabase.table("resume_analyses")
            .select("overall_score, ats_score, created_at")
            .eq("user_id", str(user.id))
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        skill_data = (
            supabase.table("skill_analyses")
            .select("match_percentage, target_role, created_at")
            .eq("user_id", str(user.id))
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        interview_data = (
            supabase.table("interview_answers")
            .select("score, created_at")
            .eq("user_id", str(user.id))
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return {
            "resume_analyses": resume_data.data,
            "skill_analyses": skill_data.data,
            "interview_answers": interview_data.data,
        }
    except Exception as e:
        print(f"[Dashboard] History fetch error: {e}")
        return {"resume_analyses": [], "skill_analyses": [], "interview_answers": [], "error": str(e)}
