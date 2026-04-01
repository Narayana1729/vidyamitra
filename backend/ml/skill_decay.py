"""
VidyaMitra — Skill Decay & Market Relevance Model
Calculates how relevant each skill is RIGHT NOW based on market trends.
Usage: from skill_decay import get_skill_relevance, analyze_skill_portfolio
"""

import numpy as np

# ── Market trend database (based on Stack Overflow surveys + job market data) ─
SKILL_MARKET_TRENDS = {
    # ── Declining ──────────────────────────────────────────────────────────────
    "AngularJS"     : {"trend": "declining", "decay_rate": 0.060, "current_relevance": 45},
    "jQuery"        : {"trend": "declining", "decay_rate": 0.050, "current_relevance": 40},
    "PHP"           : {"trend": "declining", "decay_rate": 0.025, "current_relevance": 55},
    "Perl"          : {"trend": "declining", "decay_rate": 0.080, "current_relevance": 25},
    "SVN"           : {"trend": "declining", "decay_rate": 0.100, "current_relevance": 20},
    "COBOL"         : {"trend": "declining", "decay_rate": 0.040, "current_relevance": 30},
    "Apache Hadoop" : {"trend": "declining", "decay_rate": 0.035, "current_relevance": 50},
    "Flash"         : {"trend": "declining", "decay_rate": 0.150, "current_relevance": 5},
    "CakePHP"       : {"trend": "declining", "decay_rate": 0.070, "current_relevance": 25},
    "Objective-C"   : {"trend": "declining", "decay_rate": 0.045, "current_relevance": 35},

    # ── Stable ─────────────────────────────────────────────────────────────────
    "Python"        : {"trend": "stable", "decay_rate": 0.003, "current_relevance": 98},
    "JavaScript"    : {"trend": "stable", "decay_rate": 0.003, "current_relevance": 97},
    "SQL"           : {"trend": "stable", "decay_rate": 0.002, "current_relevance": 96},
    "Git"           : {"trend": "stable", "decay_rate": 0.001, "current_relevance": 99},
    "Linux"         : {"trend": "stable", "decay_rate": 0.002, "current_relevance": 95},
    "Java"          : {"trend": "stable", "decay_rate": 0.006, "current_relevance": 90},
    "C"             : {"trend": "stable", "decay_rate": 0.003, "current_relevance": 87},
    "C++"           : {"trend": "stable", "decay_rate": 0.004, "current_relevance": 88},
    "REST APIs"     : {"trend": "stable", "decay_rate": 0.003, "current_relevance": 95},
    "React"         : {"trend": "stable", "decay_rate": 0.004, "current_relevance": 94},
    "PostgreSQL"    : {"trend": "stable", "decay_rate": 0.003, "current_relevance": 92},
    "Docker"        : {"trend": "stable", "decay_rate": 0.002, "current_relevance": 96},

    # ── Growing ────────────────────────────────────────────────────────────────
    "Rust"              : {"trend": "growing", "growth_rate": 0.025, "current_relevance": 72},
    "TypeScript"        : {"trend": "growing", "growth_rate": 0.012, "current_relevance": 92},
    "Kubernetes"        : {"trend": "growing", "growth_rate": 0.010, "current_relevance": 90},
    "LLM"               : {"trend": "growing", "growth_rate": 0.060, "current_relevance": 96},
    "LangChain"         : {"trend": "growing", "growth_rate": 0.055, "current_relevance": 87},
    "Terraform"         : {"trend": "growing", "growth_rate": 0.012, "current_relevance": 88},
    "Go"                : {"trend": "growing", "growth_rate": 0.010, "current_relevance": 82},
    "Machine Learning"  : {"trend": "growing", "growth_rate": 0.015, "current_relevance": 97},
    "Deep Learning"     : {"trend": "growing", "growth_rate": 0.012, "current_relevance": 93},
    "Vector Databases"  : {"trend": "growing", "growth_rate": 0.070, "current_relevance": 82},
    "FastAPI"           : {"trend": "growing", "growth_rate": 0.020, "current_relevance": 86},
    "Next.js"           : {"trend": "growing", "growth_rate": 0.015, "current_relevance": 88},
    "RAG"               : {"trend": "growing", "growth_rate": 0.080, "current_relevance": 90},
    "GraphQL"           : {"trend": "growing", "growth_rate": 0.008, "current_relevance": 80},
    "Hugging Face"      : {"trend": "growing", "growth_rate": 0.040, "current_relevance": 88},
}

TREND_ICONS = {
    "declining": "📉",
    "stable"   : "📊",
    "growing"  : "📈",
}

ALTERNATIVES = {
    "AngularJS" : "Angular (v15+) or React",
    "jQuery"    : "Vanilla JS or React",
    "PHP"       : "Python (FastAPI/Django) or Node.js",
    "SVN"       : "Git",
    "Perl"      : "Python",
    "COBOL"     : "Java or Python (for legacy modernisation)",
    "Apache Hadoop": "Apache Spark or cloud-native data pipelines",
}


def get_skill_relevance(skill: str, months_since_learned: int = 0) -> dict:
    """
    Return the current market relevance of a skill (0–100) and a recommendation.
    """
    skill_data = SKILL_MARKET_TRENDS.get(skill, {
        "trend": "stable", "decay_rate": 0.008, "current_relevance": 70
    })

    trend      = skill_data["trend"]
    base_rel   = skill_data["current_relevance"]

    if trend == "declining":
        relevance = base_rel * np.exp(-skill_data["decay_rate"] * months_since_learned)
    elif trend == "growing":
        extra     = skill_data.get("growth_rate", 0.01) * months_since_learned * base_rel / 100
        relevance = min(99, base_rel + extra)
    else:
        relevance = base_rel * np.exp(-skill_data["decay_rate"] * months_since_learned)

    relevance = round(np.clip(relevance, 0, 99), 1)

    # Recommendation text
    if trend == "declining" and relevance < 50:
        alt  = ALTERNATIVES.get(skill, "a modern alternative")
        rec  = f"⚠️ {skill} is losing market demand fast. Consider switching to {alt}."
    elif trend == "declining":
        rec  = f"📉 {skill} is on a downward trend. Monitor and plan an upgrade."
    elif trend == "growing":
        rec  = f"🚀 {skill} is in high demand and growing. Excellent choice — keep building on it."
    else:
        rec  = f"✅ {skill} remains consistently in demand. Solid investment."

    return {
        "skill"             : skill,
        "trend"             : trend,
        "trend_icon"        : TREND_ICONS[trend],
        "current_relevance" : relevance,
        "recommendation"    : rec,
        "months_analyzed"   : months_since_learned,
    }


def analyze_skill_portfolio(skills: list, months_ago: int = 0) -> dict:
    """
    Analyze a list of skills and return a full portfolio health report.
    """
    results   = [get_skill_relevance(s, months_ago) for s in skills]
    declining = [r["skill"] for r in results if r["trend"] == "declining"]
    growing   = [r["skill"] for r in results if r["trend"] == "growing"]
    stable    = [r["skill"] for r in results if r["trend"] == "stable"]

    avg_rel   = round(np.mean([r["current_relevance"] for r in results]), 1) if results else 0

    if avg_rel >= 85:
        health, health_label = "excellent", "🟢 Excellent"
    elif avg_rel >= 70:
        health, health_label = "good",      "🟡 Good"
    elif avg_rel >= 55:
        health, health_label = "moderate",  "🟠 Moderate"
    else:
        health, health_label = "poor",      "🔴 Needs Attention"

    alert = (
        f"⚠️ {len(declining)} of your skills are declining: {', '.join(declining)}. "
        f"Consider upgrading these soon."
        if declining else
        "✅ Your skill portfolio is modern and in demand!"
    )

    return {
        "portfolio_health"        : health,
        "portfolio_health_label"  : health_label,
        "portfolio_relevance_score": avg_rel,
        "total_skills"            : len(skills),
        "declining_count"         : len(declining),
        "growing_count"           : len(growing),
        "stable_count"            : len(stable),
        "declining_skills"        : declining,
        "growing_skills"          : growing,
        "stable_skills"           : stable,
        "skills_analysis"         : results,
        "alert"                   : alert,
    }


if __name__ == '__main__':
    # Smoke test
    print("── Single Skill ──")
    print(get_skill_relevance("AngularJS", months_since_learned=12))
    print(get_skill_relevance("LangChain", months_since_learned=6))

    print("\n── Portfolio ──")
    result = analyze_skill_portfolio(
        ["Python", "AngularJS", "Docker", "jQuery", "React", "LLM", "Git"],
        months_ago=6
    )
    print(f"Health : {result['portfolio_health_label']}")
    print(f"Score  : {result['portfolio_relevance_score']}/100")
    print(f"Alert  : {result['alert']}")
