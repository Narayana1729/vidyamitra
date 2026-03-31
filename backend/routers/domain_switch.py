from fastapi import APIRouter, Depends
from pydantic import BaseModel
from routers.auth import get_current_user
from utils.llm_utils import call_llm_json
from services.domain_switch_engine import analyze_transition
from services.domain_knowledge import normalize_domain_name
from db.supabase_client import supabase

router = APIRouter()


class DomainSwitchRequest(BaseModel):
    current_role: str
    current_skills: list[str]
    years_experience: int = 0
    target_role: str
    reason: str = ""


@router.post("/analyze")
async def analyze_domain_switch(req: DomainSwitchRequest, user=Depends(get_current_user)):
    skills_str = ", ".join(req.current_skills) if req.current_skills else "None listed"
    domain = "Software Engineering / CS / IT"
    if supabase:
        try:
            profile = supabase.table("profiles").select("domain").eq("id", str(user.id)).maybe_single().execute()
            if profile.data and profile.data.get("domain"):
                domain = normalize_domain_name(profile.data["domain"])
        except Exception:
            pass

    # 1. Compute hard data
    engine_data = analyze_transition(req.current_role, req.target_role, req.current_skills, domain=domain)
    trans = engine_data["transition_data"]

    # 2. Add to prompt
    prompt = f"""
You are a brutally honest senior career advisor with 20 years of hiring experience.
A candidate wants to switch from "{req.current_role}" to "{req.target_role}".
Candidate engineering domain: "{domain}".

Their current skills: {skills_str}
Years of experience: {req.years_experience}
Reason for switching: {req.reason or "Not specified"}

SYSTEM CALCULATED FACTS (Use these numbers/facts exactly):
- Base Difficulty: {trans["difficulty"]}
- Typical Timeline: {trans["typical_timeline"]}
- Expected Salary Impact: {trans["salary_impact"]}
- Market Demand: {trans["market_demand"]}
- Primary Hurdle: {trans["primary_hurdle"]}
- Hard Transferable Skills: {engine_data["transferable_computed"]}
- Critical Missing Skills: {engine_data["critical_gaps_computed"]}

Give a BRUTALLY HONEST, NO-SUGAR-COATING analysis. Be direct, specific, and real.
Don't try to be nice — the user explicitly asked for harsh truth. If it's a bad idea, SAY SO.
If it's a great move, say so confidently.

Return ONLY valid JSON matching this schema exactly:
{{
    "verdict": "GO" or "CAUTION" or "STOP",
    "verdict_summary": "One brutally honest sentence — is this switch smart or not?",
    "reality_check": "A 2-3 sentence paragraph incorporating the primary hurdle we calculated. No fluff.",
    "transferable_skills": {engine_data["transferable_computed"][:5] or ["None directly applicable"]},
    "skill_gaps": [
        {{"skill": "specific skill needed from the critical missing list", "priority": "critical" or "important", "time_to_learn": "estimated time"}}
    ],
    "pros": ["specific advantage 1", "specific advantage 2"],
    "cons": ["specific disadvantage 1", "specific disadvantage 2"],
    "salary_impact": "{trans["salary_impact"]} (explain why briefly)",
    "timeline": "{trans["typical_timeline"]} (explain why briefly)",
    "market_demand": "{trans["market_demand"]} (explain why briefly)",
    "action_plan": ["step 1 to take", "step 2", "step 3"],
    "harsh_truth": "The ONE uncomfortable thing they need to hear but probably won't like"
}}
"""

    fallback = {
        "verdict": "CAUTION",
        "verdict_summary": "Analysis could not be completed — try again.",
        "reality_check": "We couldn't fully analyze your switch. Please retry.",
        "transferable_skills": [],
        "skill_gaps": [],
        "pros": ["Fresh start"],
        "cons": ["Uncertainty without analysis"],
        "salary_impact": "Unknown",
        "timeline": "Unknown",
        "market_demand": "Unknown",
        "action_plan": ["Retry the analysis"],
        "harsh_truth": "You need to actually get this analysis before making any moves.",
    }

    result = call_llm_json(prompt, fallback=fallback, max_retries=2)
    return result
