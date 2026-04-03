"""
Auth router — signup, login, me, logout
Uses Supabase Auth under the hood.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from db.supabase_client import supabase
from services.domain_knowledge import normalize_domain_name

router = APIRouter()


# ── Pydantic Models ───────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str = "student"          # "student" | "company"
    full_name: str = ""
    company_name: str = ""
    domain: str = "Software Engineering / CS / IT"


class LoginRequest(BaseModel):
    email: str
    password: str


# ── Helpers ───────────────────────────────────────────────────

def _get_user_from_token(token: str):
    """Validate JWT and return Supabase user object."""
    if not supabase:
        raise HTTPException(503, "Database not configured")
    try:
        resp = supabase.auth.get_user(token)
        return resp.user
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


# ── Routes ────────────────────────────────────────────────────

async def get_current_user(authorization: str = Header(...)):
    """FastAPI dependency to extract auth user from header."""
    token = authorization.replace("Bearer ", "")
    return _get_user_from_token(token)

@router.post("/signup")
async def signup(body: SignupRequest):
    if not supabase:
        raise HTTPException(503, "Database not configured")

    if body.role not in ("student", "company"):
        raise HTTPException(400, "Role must be 'student' or 'company'")

    normalized_domain = normalize_domain_name(body.domain)

    # 1. Create auth user
    try:
        auth_resp = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
        })
    except Exception as e:
        raise HTTPException(400, f"Signup failed: {str(e)}")

    if not auth_resp.user:
        raise HTTPException(400, "Signup failed — no user returned")

    uid = str(auth_resp.user.id)

    # 2. Insert profile row
    try:
        supabase.table("profiles").insert({
            "id": uid,
            "email": body.email,
            "full_name": body.full_name,
            "role": body.role,
            "company_name": body.company_name if body.role == "company" else "",
            "domain": normalized_domain if body.role == "student" else "Software Engineering / CS / IT"
        }).execute()
    except Exception as e:
        # Profile insert failed — still return success since auth user exists
        print(f"[⚠️  Profile insert] {e}")

    # 3. Return session
    session = auth_resp.session
    return {
        "user": {
            "id": uid,
            "email": body.email,
            "full_name": body.full_name,
            "role": body.role,
            "company_name": body.company_name if body.role == "company" else "",
            "domain": normalized_domain if body.role == "student" else "Software Engineering / CS / IT",
        },
        "access_token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None,
    }


@router.post("/login")
async def login(body: LoginRequest):
    if not supabase:
        raise HTTPException(503, "Database not configured")

    try:
        auth_resp = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception as e:
        raise HTTPException(401, f"Login failed: {str(e)}")

    if not auth_resp.user:
        raise HTTPException(401, "Invalid credentials")

    uid = str(auth_resp.user.id)

    # Fetch profile
    profile = (
        supabase.table("profiles")
        .select("*")
        .eq("id", uid)
        .maybe_single()
        .execute()
    )

    profile_data = profile.data or {}

    session = auth_resp.session
    return {
        "user": {
            "id": uid,
            "email": body.email,
            "full_name": profile_data.get("full_name", ""),
            "role": profile_data.get("role", "student"),
            "company_name": profile_data.get("company_name", ""),
            "domain": normalize_domain_name(profile_data.get("domain", "Software Engineering / CS / IT")),
            "avatar_url": profile_data.get("avatar_url", ""),
        },
        "access_token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None,
    }


@router.get("/me")
async def get_me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = _get_user_from_token(token)
    uid = str(user.id)

    profile = (
        supabase.table("profiles")
        .select("*")
        .eq("id", uid)
        .maybe_single()
        .execute()
    )

    profile_data = profile.data or {}

    return {
        "user": {
            "id": uid,
            "email": user.email,
            "full_name": profile_data.get("full_name", ""),
            "role": profile_data.get("role", "student"),
            "company_name": profile_data.get("company_name", ""),
            "domain": normalize_domain_name(profile_data.get("domain", "Software Engineering / CS / IT")),
            "avatar_url": profile_data.get("avatar_url", ""),
        }
    }


@router.post("/logout")
async def logout(authorization: str = Header(None)):
    if not supabase or not authorization:
        return {"message": "Logged out"}
    try:
        supabase.auth.sign_out()
    except Exception:
        pass
    return {"message": "Logged out"}
