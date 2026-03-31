"""
VidyaMitra — Interview Service (Refactored)
Architecture: Question Bank → Evaluation Engine → LLM Enhancement

Previously: 100% LLM for everything
Now: Bank-first question selection + hybrid evaluation + LLM only for enhancement
"""

import json
from data.interview_bank import get_random_question, get_questions
from services.evaluation_engine import evaluate_answer as hybrid_evaluate
from utils.llm_utils import call_llm_json
from services.domain_knowledge import get_domain_knowledge


# ═══════════════════════════════════════════════════════════════════
# 1. QUESTION GENERATION — Bank first, LLM fallback
# ═══════════════════════════════════════════════════════════════════

def generate_question(role: str, interview_type: str, difficulty: str, previous_questions: list[str], domain: str = "Software Engineering / CS / IT") -> dict:
    """
    Get a question from the curated bank first.
    Falls back to LLM only if the bank is exhausted for this combination.
    """
    # Try to get from bank (excludes previously asked questions)
    bank_question = get_random_question(role, interview_type, difficulty, exclude=previous_questions)

    if bank_question:
        return {
            "question": bank_question["question"],
            "category": bank_question["category"],
            "expected_concepts": bank_question["expected_concepts"],
            "source": "bank",
            # Store model answer for later evaluation (not sent to client)
            "_model_answer": bank_question.get("model_answer", ""),
            "_scoring_rubric": bank_question.get("scoring_rubric", {}),
        }

    # Bank exhausted — fall back to LLM
    print(f"[Interview] Bank exhausted for {role}/{interview_type}/{difficulty}, using LLM")
    return _generate_question_llm(role, interview_type, difficulty, previous_questions, domain)


def _generate_question_llm(role: str, interview_type: str, difficulty: str, previous_questions: list[str], domain: str) -> dict:
    """LLM fallback for question generation."""
    prev_str = "\n".join([f"- {q}" for q in previous_questions])
    domain_data = get_domain_knowledge(domain)
    
    prompt = f"""Generate a new {difficulty} {interview_type} interview question for a {role} in the {domain_data['name']} engineering domain.

Previous questions asked (DO NOT REPEAT):
{prev_str}

Return JSON:
{{
    "question": "The question text",
    "category": "Topic category",
    "expected_concepts": ["concept 1", "concept 2", "concept 3"]
}}

IMPORTANT: Ensure the question explicitly tests core {domain_data['name']} concepts if technical (e.g. Thermodynamics for Mech, Microcontrollers for ECE)."""

    res = call_llm_json(prompt)
    if not res:
        res = {
            "question": f"Can you explain a complex concept related to {role}?",
            "category": "General",
            "expected_concepts": [],
        }
    res["source"] = "llm"
    res["_model_answer"] = ""
    res["_scoring_rubric"] = {}
    return res


# ═══════════════════════════════════════════════════════════════════
# 2. ANSWER EVALUATION — Hybrid engine first, LLM enhancement
# ═══════════════════════════════════════════════════════════════════

def evaluate_answer(
    question: str,
    answer: str,
    interview_type: str,
    expected_concepts: list[str] = None,
    model_answer: str = "",
) -> dict:
    """
    Evaluate using the hybrid engine.
    If expected_concepts and model_answer are provided (from bank questions),
    the evaluation is much richer.
    """
    result = hybrid_evaluate(
        question=question,
        answer=answer,
        question_type=interview_type,
        expected_concepts=expected_concepts or [],
        model_answer=model_answer,
    )

    return result


# ═══════════════════════════════════════════════════════════════════
# 3. FOLLOW-UP GENERATION — Contextual + LLM
# ═══════════════════════════════════════════════════════════════════

def generate_followup(question: str, answer: str, missed_concepts: list[str] = None) -> dict:
    """
    Generate a follow-up question.
    If we know which concepts were missed, probe those specifically.
    Falls back to LLM for creative follow-ups.
    """
    # If we know what they missed, create a targeted follow-up
    if missed_concepts and len(missed_concepts) > 0:
        target = missed_concepts[0]
        followup_templates = [
            f"You mentioned some good points. Can you elaborate more on {target} and how it relates to this topic?",
            f"How does {target} factor into your answer? Can you explain its role?",
            f"That's a good start. What about {target}? How would that apply here?",
            f"Interesting perspective. Could you also discuss how {target} fits in?",
        ]
        import random
        return {
            "question": random.choice(followup_templates),
            "category": "Follow-up",
            "_probing_concept": target,
        }

    # LLM for creative follow-ups
    prompt = f"""The candidate gave an incomplete answer. Generate a natural follow-up to probe deeper.

Original Question: {question}
Candidate's Answer: {answer}

Return JSON: {{"question": "The follow up question text"}}"""

    res = call_llm_json(prompt)
    if not res:
        res = {"question": "Could you elaborate more on that? What specific aspects would you highlight?"}
    res["category"] = "Follow-up"
    return res


# ═══════════════════════════════════════════════════════════════════
# 4. FINAL REPORT — Statistical analysis + LLM summary
# ═══════════════════════════════════════════════════════════════════

def generate_final_report(session_data: list[dict]) -> dict:
    """
    Generate a comprehensive report.
    Phase 1: Statistical analysis (deterministic)
    Phase 2: LLM narrative summary (enhancement)
    """
    if not session_data:
        return _empty_report()

    # ── Phase 1: Statistical Analysis ──
    scores = [d.get("score", 50) for d in session_data]
    avg_score = round(sum(scores) / len(scores))
    max_score = max(scores)
    min_score = min(scores)
    score_trend = "improving" if len(scores) >= 3 and scores[-1] > scores[0] else (
        "declining" if len(scores) >= 3 and scores[-1] < scores[0] else "stable"
    )

    # Identify weak topics
    weak_questions = [d for d in session_data if d.get("score", 50) < 60]
    strong_questions = [d for d in session_data if d.get("score", 50) >= 75]

    # Build deterministic report
    key_strengths = []
    areas_for_focus = []

    if avg_score >= 80:
        key_strengths.append(f"Strong overall performance with {avg_score}% average score")
    if strong_questions:
        key_strengths.append(f"Excelled in {len(strong_questions)} out of {len(session_data)} questions")
    if score_trend == "improving":
        key_strengths.append("Performance improved as the interview progressed")
    if max_score >= 90:
        key_strengths.append(f"Scored {max_score}% on your best answer — excellent depth")
    if len(scores) >= 5 and all(s >= 60 for s in scores):
        key_strengths.append("Consistently above passing threshold across all questions")

    if weak_questions:
        weak_topics = [q.get("question", "")[:60] + "..." for q in weak_questions[:3]]
        areas_for_focus.append(f"Struggled with {len(weak_questions)} questions — review these topics")
        for wt in weak_topics:
            areas_for_focus.append(f"Weak area: {wt}")
    if min_score < 40:
        areas_for_focus.append(f"Lowest score was {min_score}% — significant knowledge gap detected")
    if score_trend == "declining":
        areas_for_focus.append("Performance declined over the interview — may indicate fatigue or unfamiliar topics")

    # ── Phase 2: LLM narrative (enhancement) ──
    llm_summary = _generate_llm_summary(session_data, avg_score, key_strengths, areas_for_focus)

    overall_summary = llm_summary or (
        f"You completed {len(session_data)} questions with an average score of {avg_score}%. "
        f"Your scores ranged from {min_score}% to {max_score}%. "
        f"{'Strong performance overall — you are well-prepared.' if avg_score >= 75 else 'Focus on the weak areas identified below to improve your readiness.'}"
    )

    recommended_steps = _generate_next_steps(avg_score, weak_questions, score_trend)

    return {
        "overall_summary": overall_summary,
        "key_strengths": key_strengths if key_strengths else ["Attempted all questions"],
        "areas_for_focus": areas_for_focus if areas_for_focus else ["Continue practicing to maintain your level"],
        "recommended_next_steps": recommended_steps,
        "stats": {
            "avg_score": avg_score,
            "max_score": max_score,
            "min_score": min_score,
            "total_questions": len(session_data),
            "score_trend": score_trend,
        },
    }


def _generate_llm_summary(session_data: list[dict], avg_score: int, strengths: list, weaknesses: list):
    """Try to get an LLM-generated narrative summary. Returns None on failure."""
    try:
        compact_data = [
            {"q": d.get("question", "")[:80], "score": d.get("score", 50)}
            for d in session_data
        ]
        prompt = f"""Write a 2-3 sentence overall summary for this interview performance.
Average score: {avg_score}%
Questions: {json.dumps(compact_data)}
Strengths: {strengths[:3]}
Weaknesses: {weaknesses[:3]}

Return JSON: {{"summary": "your 2-3 sentence summary"}}"""

        res = call_llm_json(prompt, max_retries=1)
        if res and res.get("summary"):
            return res["summary"]
    except Exception:
        pass
    return None


def _generate_next_steps(avg_score: int, weak_questions: list, trend: str) -> list[str]:
    """Generate actionable next steps based on performance data."""
    steps = []

    if avg_score < 50:
        steps.extend([
            "Review fundamentals — focus on core concepts before attempting advanced topics",
            "Study the model answers provided for each question you struggled with",
            "Take another mock interview at a lower difficulty level to build confidence",
        ])
    elif avg_score < 70:
        steps.extend([
            "Review the topics where you scored below 60% — focus your study there",
            "Practice explaining concepts out loud to improve clarity",
            "Take another mock interview in 3-5 days after reviewing weak areas",
        ])
    elif avg_score < 85:
        steps.extend([
            "Good foundation — now focus on depth and edge cases in your answers",
            "Practice system design questions to strengthen architectural thinking",
            "Try a harder difficulty level in your next mock interview",
        ])
    else:
        steps.extend([
            "Excellent performance! Try system design or case study interviews next",
            f"Consider applying to target companies — you're interview-ready",
            "Help others practice — teaching reinforces your own understanding",
        ])

    if trend == "declining":
        steps.append("Your performance dropped later in the interview — practice maintaining focus during longer sessions")

    if weak_questions:
        steps.append(f"Priority: review the {len(weak_questions)} questions where you scored below 60%")

    return steps[:5]


def _empty_report() -> dict:
    return {
        "overall_summary": "No answers recorded for this session.",
        "key_strengths": [],
        "areas_for_focus": ["Complete the interview to get feedback"],
        "recommended_next_steps": ["Start a new mock interview"],
    }
