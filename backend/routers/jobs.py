"""
Jobs router — CRUD for company job postings + public listing for students.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import os
import httpx
from db.supabase_client import supabase

router = APIRouter()


# ── Pydantic Models ───────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    description: str = ""
    skills_required: List[str] = []
    location: str = ""
    job_type: str = "Full-time"
    salary_range: str = ""
    status: str = "active"


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skills_required: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None


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


def _require_company(uid: str):
    profile = (
        supabase.table("profiles")
        .select("role")
        .eq("id", uid)
        .maybe_single()
        .execute()
    )
    if not profile.data or profile.data.get("role") != "company":
        raise HTTPException(403, "Only company accounts can perform this action")


# ── Routes ────────────────────────────────────────────────────

@router.post("")
async def create_job(body: JobCreate, authorization: str = Header(...)):
    uid = _get_uid(authorization)
    _require_company(uid)

    row = {
        "company_id": uid,
        "title": body.title,
        "description": body.description,
        "skills_required": body.skills_required,
        "location": body.location,
        "job_type": body.job_type,
        "salary_range": body.salary_range,
        "status": body.status,
    }

    result = supabase.table("jobs").insert(row).execute()
    return {"job": result.data[0] if result.data else row}


@router.get("")
async def list_jobs(
    search: Optional[str] = None,
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    domain: Optional[str] = None,
):
    """Public endpoint — list all active jobs."""
    if not supabase:
        raise HTTPException(503, "Database not configured")

    query = (
        supabase.table("jobs")
        .select("*, profiles!jobs_company_id_fkey(full_name, company_name, avatar_url)")
        .eq("status", "active")
        .order("created_at", desc=True)
    )

    if job_type:
        query = query.eq("job_type", job_type)
    if location:
        query = query.ilike("location", f"%{location}%")

    result = query.execute()
    jobs = result.data or []

    # Client-side filtering for search and skill (Supabase free-tier limitations)
    if search:
        s = search.lower()
        jobs = [j for j in jobs if s in j.get("title", "").lower() or s in j.get("description", "").lower()]

    if skill:
        sk = skill.lower()
        jobs = [j for j in jobs if any(sk in s.lower() for s in j.get("skills_required", []))]

    if domain:
        d = domain.lower()
        jobs = [j for j in jobs if d in j.get("domain", "").lower() or d in j.get("description", "").lower()]

    return {"jobs": jobs, "count": len(jobs)}


@router.get("/external")
async def list_external_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
):
    """Fetch real jobs from JSearch (RapidAPI)."""
    RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
    if not RAPIDAPI_KEY:
        return {"jobs": [], "count": 0, "error": "RapidAPI Key not configured"}

    # JSearch API requires a search term. Default to 'Software Engineer' if none provided
    query_str = search if search else "Software Engineer"
    if location:
        query_str += f" in {location}"

    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {"query": query_str, "page": "1", "num_pages": "1"}
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=querystring, timeout=10.0)
            
        response.raise_for_status()
        data = response.json()
        
        normalized_jobs = []
        for item in data.get("data", []):
            normalized_jobs.append({
                "id": item.get("job_id", ""),
                "title": item.get("job_title", "Unknown Role"),
                "description": (item.get("job_description") or "")[:500] + "...", # Truncate description for speed/UI
                "location": f"{item.get('job_city', '')}, {item.get('job_country', '')}".strip(', '),
                "job_type": item.get("job_employment_type", "Full-time"),
                "status": "active",
                "salary_range": "Competitive",
                "skills_required": item.get("job_required_skills", []) or ["Communicate", "Teamwork"],
                "created_at": item.get("job_posted_at_datetime_utc", ""),
                "external_link": item.get("job_apply_link", ""),
                "profiles": {
                    "company_name": item.get("employer_name", "External Company"),
                    "avatar_url": item.get("employer_logo", "")
                }
            })
            
        return {"jobs": normalized_jobs, "count": len(normalized_jobs)}
        
    except Exception as e:
        print(f"RapidAPI Error: {str(e)}")
        return {"jobs": [], "count": 0, "error": str(e)}


@router.get("/company/mine")
async def list_my_jobs(authorization: str = Header(...)):
    """Company's own postings."""
    uid = _get_uid(authorization)
    _require_company(uid)

    result = (
        supabase.table("jobs")
        .select("*")
        .eq("company_id", uid)
        .order("created_at", desc=True)
        .execute()
    )

    # Attach applicant count for each job
    jobs = result.data or []
    for job in jobs:
        app_count = (
            supabase.table("job_applications")
            .select("id", count="exact")
            .eq("job_id", job["id"])
            .execute()
        )
        job["applicant_count"] = app_count.count or 0

    return {"jobs": jobs}


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Public — get single job detail."""
    if not supabase:
        raise HTTPException(503, "Database not configured")

    result = (
        supabase.table("jobs")
        .select("*, profiles!jobs_company_id_fkey(full_name, company_name, avatar_url)")
        .eq("id", job_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(404, "Job not found")

    return {"job": result.data}


@router.put("/{job_id}")
async def update_job(job_id: str, body: JobUpdate, authorization: str = Header(...)):
    uid = _get_uid(authorization)
    _require_company(uid)

    # Verify ownership
    existing = (
        supabase.table("jobs")
        .select("company_id")
        .eq("id", job_id)
        .maybe_single()
        .execute()
    )
    if not existing.data or existing.data["company_id"] != uid:
        raise HTTPException(403, "You can only edit your own job postings")

    updates = {k: v for k, v in body.dict().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")

    result = supabase.table("jobs").update(updates).eq("id", job_id).execute()
    return {"job": result.data[0] if result.data else updates}


@router.delete("/{job_id}")
async def delete_job(job_id: str, authorization: str = Header(...)):
    uid = _get_uid(authorization)
    _require_company(uid)

    existing = (
        supabase.table("jobs")
        .select("company_id")
        .eq("id", job_id)
        .maybe_single()
        .execute()
    )
    if not existing.data or existing.data["company_id"] != uid:
        raise HTTPException(403, "You can only delete your own job postings")

    supabase.table("jobs").delete().eq("id", job_id).execute()
    return {"message": "Job deleted"}
