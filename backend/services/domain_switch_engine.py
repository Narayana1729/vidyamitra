"""
Domain Switch Engine

Provides declarative data on role transitions to reduce LLM hallucination.
Calculates transferable skills and skill gaps based on the global role configuration.
"""
from services.skillgap_engine import ROLE_SKILLS
from services.domain_knowledge import get_domain_knowledge

def get_role_skills(role: str, domain: str) -> dict:
    if role in ROLE_SKILLS:
        return ROLE_SKILLS[role]

    domain_data = get_domain_knowledge(domain)
    return {
        "required": domain_data.get("core_skills", []),
        "nice_to_have": domain_data.get("tools", []),
    }

ROLE_TRANSITIONS = {
    # ── Frontend Transitions ──
    ("frontend_developer", "backend_developer"): {
        "difficulty": "Moderate",
        "typical_timeline": "3-6 months",
        "salary_impact": "Neutral to +10%",
        "market_demand": "High",
        "primary_hurdle": "Database design and system architecture",
    },
    ("frontend_developer", "full_stack_developer"): {
        "difficulty": "Moderate",
        "typical_timeline": "2-4 months",
        "salary_impact": "+10% to +20%",
        "market_demand": "Very High",
        "primary_hurdle": "API design and server deployment",
    },
    ("frontend_developer", "mobile_developer"): {
        "difficulty": "Easy to Moderate",
        "typical_timeline": "1-3 months (via React Native)",
        "salary_impact": "Neutral",
        "market_demand": "High",
        "primary_hurdle": "Mobile performance and App Store deployment",
    },

    # ── Backend Transitions ──
    ("backend_developer", "full_stack_developer"): {
        "difficulty": "Moderate",
        "typical_timeline": "3-5 months",
        "salary_impact": "+10% to +20%",
        "market_demand": "Very High",
        "primary_hurdle": "CSS layouts and modern React state management",
    },
    ("backend_developer", "devops_engineer"): {
        "difficulty": "Moderate",
        "typical_timeline": "4-6 months",
        "salary_impact": "+15% to +25%",
        "market_demand": "Very High",
        "primary_hurdle": "Infrastructure as Code and complex CI/CD pipelines",
    },
    ("backend_developer", "data_scientist"): {
        "difficulty": "Hard",
        "typical_timeline": "6-12 months",
        "salary_impact": "Neutral to +15%",
        "market_demand": "High",
        "primary_hurdle": "Advanced math, statistics, and machine learning intuition",
    },

    # ── Data Science Transitions ──
    ("data_scientist", "backend_developer"): {
        "difficulty": "Moderate",
        "typical_timeline": "3-6 months",
        "salary_impact": "Neutral",
        "market_demand": "Very High",
        "primary_hurdle": "Production-grade software engineering and system design",
    },
    ("data_scientist", "devops_engineer"): {
        "difficulty": "Hard",
        "typical_timeline": "6-12 months",
        "salary_impact": "Neutral to +10%",
        "market_demand": "Very High",
        "primary_hurdle": "Networking, security, and infrastructure automation",
    },
}

DEFAULT_TRANSITION = {
    "difficulty": "Unknown",
    "typical_timeline": "6+ months typically",
    "salary_impact": "Highly variable",
    "market_demand": "Strong",
    "primary_hurdle": "Domain-specific tooling and architecture paradigms",
}

def analyze_transition(current_role: str, target_role: str, user_skills: list[str], domain: str = "Software Engineering / CS / IT") -> dict:
    """
    Computes purely data-driven aspects of a domain switch.
    """
    c_role_clean = current_role.lower().replace(" ", "_")
    t_role_clean = target_role.lower().replace(" ", "_")

    transition_info = ROLE_TRANSITIONS.get((c_role_clean, t_role_clean), DEFAULT_TRANSITION)
    
    # Calculate skill overlaps
    target_skill_reqs = get_role_skills(t_role_clean, domain)
    target_req_lower = {s.lower() for s in target_skill_reqs["required"]}
    target_nice_lower = {s.lower() for s in target_skill_reqs["nice_to_have"]}
    
    user_skills_lower = {s.lower(): s for s in user_skills}
    
    transferable = []
    gaps_critical = []
    
    # Which of the user's current skills transfer directly to the new role?
    for s_clean, s_real in user_skills_lower.items():
        if s_clean in target_req_lower or s_clean in target_nice_lower:
            transferable.append(s_real)
            
    # Which required skills are they missing completely?
    for req_skill in target_skill_reqs["required"]:
        if req_skill.lower() not in user_skills_lower:
            gaps_critical.append(req_skill)
            
    return {
        "transition_data": transition_info,
        "transferable_computed": list(set(transferable)),
        "critical_gaps_computed": list(set(gaps_critical)),
        "target_skills_required": target_skill_reqs["required"]
    }
