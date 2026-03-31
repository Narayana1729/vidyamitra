from fastapi import APIRouter, Depends
from pydantic import BaseModel
from routers.auth import get_current_user
from utils.llm_utils import call_llm_json
from utils.db_utils import save_to_supabase
from services.ats_engine import score_resume as deterministic_score

router = APIRouter()


class ScoreInput(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    summary: str = ""
    target_role: str = ""
    skills: list[str] = []
    experience: list[dict] = []
    education: list[dict] = []
    projects: list[dict] = []
    template: str = "classic"


@router.post("/score")
def score_resume(data: ScoreInput, user=Depends(get_current_user)):
    """Score a resume based on structured form data using LLM with caching."""
    import hashlib
    import json
    
    # ── 1. Check Cache ──
    payload_str = json.dumps(data.model_dump(), sort_keys=True)
    payload_hash = hashlib.md5(payload_str.encode("utf-8")).hexdigest()
    
    from db.supabase_client import supabase
    if supabase:
        try:
            recent_scores = (
                supabase.table("resume_analyses")
                .select("*")
                .eq("user_id", str(user.id))
                .eq("analysis_type", "ats_score")
                .order("created_at", desc=True)
                .limit(20)
                .execute()
            )
            for row in (recent_scores.data or []):
                raw = row.get("raw_result") or {}
                if raw.get("payload_hash") == payload_hash:
                    print(f"[Resume Score] Serving cached score for hash {payload_hash}")
                    return raw
        except Exception as e:
            print(f"[Resume Score] Cache check failed: {e}")

    # ── 2. Generate New Score Deterministically ──
    # We use a purely mathematical ATS model (no LLM hallucination)
    result = deterministic_score(data)

    # Add hash for future caching
    result["payload_hash"] = payload_hash

    # ── Save to Supabase ──
    save_to_supabase("resume_analyses", {
        "user_id": str(user.id),
        "analysis_type": "ats_score",
        "overall_score": result.get("score"),
        "ats_score": result.get("score"),
        "strengths": result.get("strengths", []),
        "weaknesses": result.get("weaknesses", []),
        "raw_result": result,
    })

    save_to_supabase("activity_log", {
        "user_id": str(user.id),
        "activity_type": "resume",
        "action": f"ATS Score calculated — {result.get('score', 0)}/100",
        "metadata": {"score": result.get("score")},
    })

    return result