"""
VidyaMitra — Placement Readiness Timeline Predictor
Linear regression on weekly readiness scores → predicts when student hits 75% (ready).
Usage: from placement_timeline import predict_readiness_timeline
"""

import numpy as np
from sklearn.linear_model import LinearRegression

READY_THRESHOLD = 75  # Score at which student is considered placement-ready


def predict_readiness_timeline(weekly_scores: list) -> dict:
    """
    Input: list of weekly snapshot dicts
    [
        {"week": 1, "resume_score": 45, "skill_pct": 30, "interview_score": 40},
        {"week": 2, "resume_score": 52, "skill_pct": 38, "interview_score": 47},
        ...
    ]
    Returns: timeline prediction with projected scores and weeks-to-ready.
    """
    if len(weekly_scores) < 2:
        return {
            "current_readiness"  : 0,
            "weeks_to_ready"     : None,
            "growth_per_week"    : 0,
            "trend"              : "insufficient_data",
            "message"            : "📊 Need at least 2 weeks of activity data to generate a prediction.",
            "projection"         : [],
            "target_score"       : READY_THRESHOLD,
        }

    # Compute composite readiness per week (resume 30% + skill 40% + interview 30%)
    readiness_scores = []
    for w in weekly_scores:
        r = round(
            w.get("resume_score",    0) * 0.30 +
            w.get("skill_pct",       0) * 0.40 +
            w.get("interview_score", 0) * 0.30
        )
        readiness_scores.append(r)

    n       = len(readiness_scores)
    X       = np.arange(1, n + 1).reshape(-1, 1)
    y       = np.array(readiness_scores)

    model   = LinearRegression()
    model.fit(X, y)

    current         = readiness_scores[-1]
    growth_per_week = float(model.coef_[0])
    r_squared       = float(model.score(X, y))

    # ── Predict weeks to reach READY_THRESHOLD ──
    if current >= READY_THRESHOLD:
        weeks_to_ready = 0
        message        = "🎉 You're already placement-ready! Start applying now."
        trend          = "ready"
    elif growth_per_week <= 0.2:
        weeks_to_ready = None
        message        = "⚠️ Your readiness score is stagnant or declining. Refocus your preparation."
        trend          = "stagnant" if abs(growth_per_week) <= 0.2 else "declining"
    else:
        weeks_to_ready = max(1, round((READY_THRESHOLD - current) / growth_per_week))
        message        = (
            f"📅 At your current pace (+{growth_per_week:.1f} pts/week), "
            f"you'll be placement-ready in ~{weeks_to_ready} week{'s' if weeks_to_ready != 1 else ''}."
        )
        trend          = "improving"

    # ── Project next 8 weeks ──
    future_weeks = np.arange(n + 1, n + 9).reshape(-1, 1)
    projected    = [
        int(np.clip(round(float(model.predict([[w]])[0])), 0, 100))
        for w in range(n + 1, n + 9)
    ]

    # ── Build chart-ready data ──
    history_chart = [
        {"week": f"Week {i + 1}", "score": s, "type": "actual"}
        for i, s in enumerate(readiness_scores)
    ]
    projection_chart = [
        {"week": f"Week {n + i + 1}", "score": s, "type": "projected"}
        for i, s in enumerate(projected)
    ]

    return {
        "current_readiness"  : current,
        "weeks_to_ready"     : weeks_to_ready,
        "growth_per_week"    : round(growth_per_week, 2),
        "trend"              : trend,
        "confidence"         : round(r_squared * 100, 1),
        "message"            : message,
        "target_score"       : READY_THRESHOLD,
        "history"            : history_chart,
        "projection"         : projection_chart,
        "full_chart"         : history_chart + projection_chart,
    }


if __name__ == '__main__':
    # Smoke test — improving student
    sample = [
        {"week": 1, "resume_score": 40, "skill_pct": 25, "interview_score": 38},
        {"week": 2, "resume_score": 48, "skill_pct": 33, "interview_score": 45},
        {"week": 3, "resume_score": 55, "skill_pct": 42, "interview_score": 52},
        {"week": 4, "resume_score": 62, "skill_pct": 50, "interview_score": 58},
        {"week": 5, "resume_score": 68, "skill_pct": 57, "interview_score": 63},
    ]

    result = predict_readiness_timeline(sample)
    print(f"Current Readiness : {result['current_readiness']}%")
    print(f"Growth per Week   : +{result['growth_per_week']} pts")
    print(f"Weeks to Ready    : {result['weeks_to_ready']}")
    print(f"Trend             : {result['trend']}")
    print(f"Message           : {result['message']}")
    print(f"\nProjection (next 4 weeks):")
    for p in result['projection'][:4]:
        print(f"  {p['week']}: {p['score']}%")
