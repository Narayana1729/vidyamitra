from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── All Router Imports (only files that exist in routers/) ──
from routers import (
    auth,
    resume,
    resume_ai,
    resume_match,
    resume_score,
    resume_tailor,
    skills,
    roadmap,
    interview,
    dashboard,
    domain_switch,
    jobs,
    applications,
    tracked_applications,
    code_runner,
    user_data,
    placement,
    ml_router,
    coding_profile,
    daily_plan,
)

app = FastAPI(
    title="VidyaMitra API",
    description="AI-Powered Career Intelligence Platform",
    version="3.0.0",
)

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Open for local WiFi demos — restrict in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= AUTH =================
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

# ================= CORE ROUTES =================
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(skills.router, prefix="/api/skills", tags=["Skills"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

# ================= AI FEATURES =================
app.include_router(resume_ai.router, prefix="/api/resume", tags=["Resume AI"])
app.include_router(resume_match.router, prefix="/api/resume", tags=["Resume Matching"])
app.include_router(resume_score.router, prefix="/api/resume", tags=["ATS Scoring"])
app.include_router(resume_tailor.router, prefix="/api/resume-tailor", tags=["Resume Tailor"])

# ================= PORTALS =================
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(tracked_applications.router, prefix="/api/tracked-applications", tags=["Tracked Applications"])

# ================= CODE EXECUTION =================
app.include_router(code_runner.router, prefix="/api/code", tags=["Code Runner"])

# ================= DOMAIN SWITCH =================
app.include_router(domain_switch.router, prefix="/api/domain-switch", tags=["Domain Switch"])

# ================= USER DATA HYDRATION =================
app.include_router(user_data.router, prefix="/api/user-data", tags=["User Data"])

# ================= PLACEMENT ANALYTICS =================
app.include_router(placement.router, prefix="/api/placement", tags=["Placement Analytics"])

# ================= ML PREDICTIONS =================
app.include_router(ml_router.router, prefix="/api/ml", tags=["ML Predictions"])

# ================= CODING PROFILE AGGREGATOR =================
app.include_router(coding_profile.router, prefix="/api/coding-profile", tags=["Coding Profile"])

# ================= SMART DAILY PLAN =================
app.include_router(daily_plan.router, prefix="/api/daily-plan", tags=["Daily Plan"])

# ================= ROOT =================
@app.get("/")
def root():
    return {
        "message": "VidyaMitra API is running",
        "version": "3.0.0",
        "features": [
            "Authentication",
            "Student Portal",
            "Company Portal",
            "Resume Analyzer",
            "Resume Builder",
            "AI Bullet Improvement",
            "Job Match Scoring",
            "ATS Score Engine",
            "Skill Gap Analysis",
            "Mock Interview",
            "Learning Roadmap",
            "Job Board",
            "Applications"
        ]
    }