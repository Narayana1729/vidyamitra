"""
Applications router — students apply to jobs, companies manage applicants.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import Optional, List
from db.supabase_client import supabase

router = APIRouter()


# ── Pydantic Models ───────────────────────────────────────────

class ApplyRequest(BaseModel):
    job_id: str
    cover_letter: str = ""


class StatusUpdate(BaseModel):
    status: str  # "shortlisted" | "rejected" | "hired"


# ── Helpers ───────────────────────────────────────────────────

def _get_uid(authorization: str) -> str:
    if not supabase:
        raise HTTPException(503, "Database not configured")
    token = authorization.replace("Bearer ", "")
    try:
        resp = supabase.auth.get_user(token)
        return str(resp.user.id)
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


def _get_role(uid: str) -> str:
    profile = (
        supabase.table("profiles")
        .select("role")
        .eq("id", uid)
        .maybe_single()
        .execute()
    )
    return profile.data.get("role", "student") if profile.data else "student"


# ── Routes ────────────────────────────────────────────────────

@router.post("")
async def apply_to_job(body: ApplyRequest, authorization: str = Header(...)):
    """Student applies to a job. Auto-attaches their latest resume score."""
    try:
        uid = _get_uid(authorization)
        role = _get_role(uid)
        if role != "student":
            raise HTTPException(403, "Only students can apply to jobs")

        # Check job exists and is active
        job = (
            supabase.table("jobs")
            .select("id, status, skills_required")
            .eq("id", body.job_id)
            .maybe_single()
            .execute()
        )
        if not job.data:
            raise HTTPException(404, "Job not found")
        if job.data.get("status") != "active":
            raise HTTPException(400, "This job is no longer accepting applications")

        # Check duplicate
        existing = (
            supabase.table("job_applications")
            .select("id")
            .eq("job_id", body.job_id)
            .eq("student_id", uid)
            .maybe_single()
            .execute()
        )
        if existing.data:
            raise HTTPException(400, "You have already applied to this job")

        # Get latest resume score + skills
        resume_score = None
        matched_skills = []
        latest_analysis = (
            supabase.table("resume_analyses")
            .select("ats_score, raw_result")
            .eq("user_id", uid)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if latest_analysis.data:
            resume_score = latest_analysis.data[0].get("ats_score")
            skills_req = job.data.get("skills_required") or []
            job_skills = [s.lower() for s in skills_req]
            raw = latest_analysis.data[0].get("raw_result") or {}
            resume_skills = []
            if isinstance(raw, dict):
                extracted = raw.get("skills") or raw.get("extracted_skills") or []
                resume_skills = [s.lower() for s in extracted if isinstance(s, str)]
            matched_skills = [s for s in job_skills if s in resume_skills]

        row = {
            "job_id": body.job_id,
            "student_id": uid,
            "cover_letter": body.cover_letter,
            "resume_score": resume_score,
            "matched_skills": matched_skills,
            "status": "applied",
        }

        result = supabase.table("job_applications").insert(row).execute()
        return {"application": result.data[0] if result.data else row}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to apply: {str(e)}")


@router.get("/student/mine")
async def my_applications(authorization: str = Header(...)):
    """Student views their own applications."""
    uid = _get_uid(authorization)

    result = (
        supabase.table("job_applications")
        .select("*, jobs(title, description, location, job_type, salary_range, skills_required, status, profiles!jobs_company_id_fkey(company_name))")
        .eq("student_id", uid)
        .order("created_at", desc=True)
        .execute()
    )

    return {"applications": result.data or []}


@router.get("/job/{job_id}")
async def job_applicants(
    job_id: str,
    authorization: str = Header(...),
    min_score: Optional[int] = Query(None, description="Minimum resume score"),
    max_score: Optional[int] = Query(None, description="Maximum resume score"),
    skill: Optional[str] = Query(None, description="Filter by matched skill"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """Company views applicants for their job, with optional filters."""
    uid = _get_uid(authorization)

    # Verify company owns this job
    job = (
        supabase.table("jobs")
        .select("company_id")
        .eq("id", job_id)
        .maybe_single()
        .execute()
    )
    if not job.data or job.data["company_id"] != uid:
        raise HTTPException(403, "You can only view applicants for your own jobs")

    query = (
        supabase.table("job_applications")
        .select("*, profiles!job_applications_student_id_fkey(full_name, email, avatar_url)")
        .eq("job_id", job_id)
        .order("created_at", desc=True)
    )

    if status:
        query = query.eq("status", status)

    result = query.execute()
    applicants = result.data or []

    # Client-side filters for score ranges and skill match
    if min_score is not None:
        applicants = [a for a in applicants if (a.get("resume_score") or 0) >= min_score]
    if max_score is not None:
        applicants = [a for a in applicants if (a.get("resume_score") or 0) <= max_score]
    if skill:
        sk = skill.lower()
        applicants = [a for a in applicants if any(sk in s.lower() for s in a.get("matched_skills", []))]

    return {"applicants": applicants, "count": len(applicants)}


@router.patch("/{application_id}/status")
async def update_application_status(
    application_id: str,
    body: StatusUpdate,
    authorization: str = Header(...),
):
    """Company updates applicant status (shortlisted, rejected, hired)."""
    uid = _get_uid(authorization)

    if body.status not in ("shortlisted", "rejected", "hired"):
        raise HTTPException(400, "Status must be 'shortlisted', 'rejected', or 'hired'")

    # Get application and verify company ownership
    app = (
        supabase.table("job_applications")
        .select("job_id")
        .eq("id", application_id)
        .maybe_single()
        .execute()
    )
    if not app.data:
        raise HTTPException(404, "Application not found")

    job = (
        supabase.table("jobs")
        .select("company_id")
        .eq("id", app.data["job_id"])
        .maybe_single()
        .execute()
    )
    if not job.data or job.data["company_id"] != uid:
        raise HTTPException(403, "You can only manage applicants for your own jobs")

    result = (
        supabase.table("job_applications")
        .update({"status": body.status})
        .eq("id", application_id)
        .execute()
    )
    return {"application": result.data[0] if result.data else {"status": body.status}}
