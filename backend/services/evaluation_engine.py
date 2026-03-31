"""
VidyaMitra — Hybrid Interview Evaluation Engine
Architecture: Keyword Match (40%) + Rubric Scoring (30%) + LLM Depth (30%)

Works WITHOUT LLM (returns 70% of score deterministically).
LLM enhances with depth/clarity assessment when available.
"""

import re
import math
from typing import Optional
from utils.llm_utils import call_llm_json


# ═══════════════════════════════════════════════════════════════════
# 1. KEYWORD / CONCEPT MATCHING  (40% of total score)
# ═══════════════════════════════════════════════════════════════════

def _normalize(text: str) -> set[str]:
    """Lowercase, strip punctuation, split into word set."""
    return set(re.sub(r"[^a-z0-9\s/\-+#.]", "", text.lower()).split())


def _concept_match_score(answer: str, expected_concepts: list[str]) -> tuple[int, list[str], list[str]]:
    """
    Check how many expected concepts appear in the answer.
    Uses fuzzy substring matching — e.g., "virtual dom" matches "the virtual DOM is..."
    Returns (score_0_100, matched_concepts, missed_concepts).
    """
    answer_lower = answer.lower()
    answer_words = _normalize(answer)

    matched = []
    missed = []

    for concept in expected_concepts:
        concept_lower = concept.lower()
        concept_words = set(concept_lower.split())

        # Strategy 1: exact substring match
        if concept_lower in answer_lower:
            matched.append(concept)
            continue

        # Strategy 2: all words of the concept appear in the answer
        if concept_words.issubset(answer_words):
            matched.append(concept)
            continue

        # Strategy 3: fuzzy — most words match (for multi-word concepts)
        if len(concept_words) > 1:
            overlap = concept_words & answer_words
            if len(overlap) >= len(concept_words) * 0.7:
                matched.append(concept)
                continue

        # Strategy 4: common abbreviations and synonyms
        synonyms = _get_synonyms(concept_lower)
        if any(syn in answer_lower for syn in synonyms):
            matched.append(concept)
            continue

        missed.append(concept)

    if not expected_concepts:
        return 50, [], []  # no concepts to check

    score = int((len(matched) / len(expected_concepts)) * 100)
    return score, matched, missed


_SYNONYM_MAP = {
    "type coercion": ["implicit conversion", "type casting", "auto conversion"],
    "strict equality": ["triple equals", "===", "identity operator"],
    "block scope": ["block-scoped", "curly brace scope", "{}"],
    "function scope": ["function-scoped", "var scope"],
    "hoisting": ["hoisted", "declaration hoisting", "moved to top"],
    "virtual dom": ["vdom", "virtual tree", "in-memory dom"],
    "reconciliation": ["diffing", "diff algorithm", "tree comparison"],
    "closure": ["closures", "lexical closure", "closed over"],
    "event loop": ["event-loop", "runtime loop", "message queue"],
    "call stack": ["execution stack", "stack frame"],
    "callback queue": ["task queue", "message queue", "macro task"],
    "microtask queue": ["promise queue", "micro task"],
    "b-tree": ["btree", "b+ tree", "balanced tree"],
    "acid": ["atomicity", "consistency isolation durability"],
    "crud": ["create read update delete"],
    "jwt": ["json web token", "bearer token"],
    "oauth": ["open authorization", "oauth2", "oauth 2.0"],
    "rest": ["restful", "representational state transfer"],
    "tcp": ["transmission control protocol", "tcp/ip"],
    "dns": ["domain name system", "domain resolution"],
    "cdn": ["content delivery network", "edge cache"],
    "orm": ["object relational mapping", "sqlalchemy", "prisma"],
    "ci/cd": ["continuous integration", "continuous delivery", "continuous deployment"],
    "crdt": ["conflict-free replicated data type"],
    "ot": ["operational transformation"],
    "ssr": ["server-side rendering"],
    "csr": ["client-side rendering"],
    "seo": ["search engine optimization"],
    "api": ["application programming interface"],
    "sql": ["structured query language"],
    "nosql": ["non-relational", "document database", "mongodb"],
    "redis": ["in-memory cache", "key-value store"],
    "websocket": ["websockets", "ws://", "wss://", "full-duplex"],
    "gradient descent": ["gradient optimization", "backpropagation", "loss minimization"],
    "overfitting": ["overfit", "high variance", "memorizing training data"],
    "underfitting": ["underfit", "high bias", "too simple model"],
}


def _get_synonyms(concept: str) -> list[str]:
    """Get known synonyms for a concept."""
    return _SYNONYM_MAP.get(concept, [])


# ═══════════════════════════════════════════════════════════════════
# 2. RUBRIC-BASED SCORING  (30% of total score)
# ═══════════════════════════════════════════════════════════════════

def _rubric_score(answer: str, model_answer: str, question_type: str) -> tuple[int, list[str], list[str]]:
    """
    Score based on structural quality rubric.
    Returns (score_0_100, strengths, improvements).
    """
    strengths = []
    improvements = []
    score = 0
    answer_lower = answer.lower()
    word_count = len(answer.split())

    # ── Length check ──
    if word_count >= 80:
        score += 15
        strengths.append("Detailed and comprehensive answer")
    elif word_count >= 40:
        score += 10
        strengths.append("Adequate depth in response")
    elif word_count >= 15:
        score += 5
        improvements.append("Answer could be more detailed — aim for 50+ words")
    else:
        improvements.append("Answer is too brief — expand with examples and explanations")

    # ── Structure check ──
    has_example = any(marker in answer_lower for marker in [
        "for example", "e.g.", "such as", "like ", "instance",
        "consider", "suppose", "imagine", "scenario",
    ])
    if has_example:
        score += 15
        strengths.append("Good use of examples to illustrate concepts")
    else:
        score += 0
        improvements.append("Add concrete examples to strengthen your answer")

    # ── Technical depth ──
    has_comparison = any(w in answer_lower for w in ["vs", "versus", "difference", "compared to", "unlike", "whereas"])
    has_tradeoff = any(w in answer_lower for w in ["trade-off", "tradeoff", "pros and cons", "advantage", "disadvantage", "downside"])
    has_code = any(marker in answer for marker in ["()", "=>", "function", "def ", "class ", "const ", "let ", "var ", "import "])

    if has_comparison:
        score += 10
        strengths.append("Shows understanding of alternatives and comparisons")
    if has_tradeoff:
        score += 10
        strengths.append("Demonstrates awareness of trade-offs")
    if has_code and question_type in ("technical", "coding"):
        score += 10
        strengths.append("Includes code to support explanation")

    # ── Practical knowledge ──
    has_practical = any(w in answer_lower for w in [
        "in production", "real-world", "in practice", "i have used",
        "we implemented", "at scale", "in my experience", "best practice",
    ])
    if has_practical:
        score += 10
        strengths.append("Demonstrates practical/real-world experience")

    # ── STAR method for behavioral ──
    if question_type == "behavioral":
        star_markers = {
            "situation": ["situation", "context", "background", "at my"],
            "task": ["task", "responsible", "needed to", "had to", "goal"],
            "action": ["action", "i did", "i decided", "i implemented", "steps"],
            "result": ["result", "outcome", "impact", "improved", "reduced", "increased"],
        }
        star_count = sum(1 for markers in star_markers.values() if any(m in answer_lower for m in markers))
        if star_count >= 3:
            score += 20
            strengths.append("Well-structured answer using STAR method")
        elif star_count >= 2:
            score += 10
            strengths.append("Partially structured — add more STAR elements")
        else:
            improvements.append("Use the STAR method: Situation, Task, Action, Result")

    # ── Model answer similarity (keyword overlap) ──
    model_words = _normalize(model_answer)
    answer_words = _normalize(answer)
    if model_words:
        # Filter out common stop words
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
                      "have", "has", "had", "do", "does", "did", "will", "would", "could",
                      "should", "may", "might", "shall", "can", "to", "of", "in", "for",
                      "on", "with", "at", "by", "from", "as", "into", "through", "during",
                      "and", "but", "or", "not", "no", "so", "if", "then", "that", "this",
                      "it", "its", "they", "them", "their", "we", "our", "you", "your"}
        model_keywords = model_words - stop_words
        answer_keywords = answer_words - stop_words
        if model_keywords:
            overlap = len(model_keywords & answer_keywords) / len(model_keywords)
            score += int(overlap * 20)

    return min(100, score), strengths, improvements


# ═══════════════════════════════════════════════════════════════════
# 3. LLM DEPTH ASSESSMENT  (30% of total score)
# ═══════════════════════════════════════════════════════════════════

def _llm_evaluate(question: str, answer: str, question_type: str) -> Optional[dict]:
    """
    Use LLM to assess depth, clarity, and accuracy.
    Returns None if LLM is unavailable (graceful degradation).
    """
    prompt = f"""Evaluate this interview answer concisely.

Question: {question}
Answer: {answer}
Type: {question_type}

Return ONLY JSON:
{{
    "depth_score": integer 0-100 (how deep is the understanding?),
    "clarity_score": integer 0-100 (how clearly explained?),
    "accuracy_score": integer 0-100 (how factually correct?),
    "key_insight": "One sentence about what made this answer good or bad",
    "needs_followup": boolean (true if answer is vague but on track)
}}"""

    try:
        result = call_llm_json(prompt, max_retries=1)
        if result and isinstance(result, dict) and "depth_score" in result:
            # Clamp scores to valid range
            for key in ["depth_score", "clarity_score", "accuracy_score"]:
                result[key] = max(0, min(100, int(result.get(key, 50))))
            return result
    except Exception as e:
        print(f"[EvalEngine] LLM evaluation failed: {e}")

    return None


# ═══════════════════════════════════════════════════════════════════
# 4. MAIN ORCHESTRATOR  — Hybrid Scoring
# ═══════════════════════════════════════════════════════════════════

def evaluate_answer(
    question: str,
    answer: str,
    question_type: str = "technical",
    expected_concepts: list[str] = None,
    model_answer: str = "",
) -> dict:
    """
    Production-grade hybrid evaluation.

    Scoring weights:
    - Concept matching: 40%
    - Rubric-based quality: 30%
    - LLM depth assessment: 30% (gracefully degrades to 0% if LLM unavailable)

    Returns a dict with score, feedback, strengths, improvements, model_answer, needs_followup.
    """
    expected_concepts = expected_concepts or []

    # ── 1. Concept matching (40%) ──
    concept_score, matched_concepts, missed_concepts = _concept_match_score(
        answer, expected_concepts
    )

    # ── 2. Rubric scoring (30%) ──
    rubric_score, rubric_strengths, rubric_improvements = _rubric_score(
        answer, model_answer, question_type
    )

    # ── 3. LLM depth (30%) — optional ──
    llm_result = _llm_evaluate(question, answer, question_type)
    llm_available = llm_result is not None

    if llm_available:
        llm_score = int(
            llm_result["depth_score"] * 0.4 +
            llm_result["clarity_score"] * 0.3 +
            llm_result["accuracy_score"] * 0.3
        )
        needs_followup = llm_result.get("needs_followup", False)
    else:
        llm_score = 0
        needs_followup = concept_score < 40 and rubric_score > 20  # vague but trying

    # ── 4. Weighted final score ──
    if llm_available:
        final_score = int(
            concept_score * 0.40 +
            rubric_score * 0.30 +
            llm_score * 0.30
        )
    else:
        # Without LLM, redistribute: 55% concepts, 45% rubric
        final_score = int(
            concept_score * 0.55 +
            rubric_score * 0.45
        )

    final_score = max(0, min(100, final_score))

    # ── 5. Build feedback ──
    strengths = list(rubric_strengths)
    improvements = list(rubric_improvements)

    if matched_concepts:
        strengths.insert(0, f"Covered key concepts: {', '.join(matched_concepts[:4])}")

    if missed_concepts:
        improvements.insert(0, f"Missing key concepts: {', '.join(missed_concepts[:4])}")

    if llm_available and llm_result.get("key_insight"):
        strengths.append(llm_result["key_insight"])

    # Generate feedback message
    if final_score >= 85:
        feedback = "Excellent answer! You demonstrated deep understanding and covered the key concepts thoroughly."
    elif final_score >= 70:
        feedback = "Good answer with solid fundamentals. A few areas could be expanded for a more complete response."
    elif final_score >= 50:
        feedback = "Decent attempt, but several important concepts were missing. Review the model answer for a more complete picture."
    elif final_score >= 30:
        feedback = "The answer shows some understanding but lacks depth and misses critical concepts. Study this topic more thoroughly."
    else:
        feedback = "The answer doesn't adequately address the question. Review the fundamentals and practice explaining this topic."

    return {
        "score": final_score,
        "feedback": feedback,
        "strengths": strengths[:5],
        "improvements": improvements[:5],
        "model_answer": model_answer,
        "needs_followup": needs_followup,
        "scoring_breakdown": {
            "concept_match": concept_score,
            "rubric_quality": rubric_score,
            "llm_depth": llm_score if llm_available else "unavailable",
            "llm_used": llm_available,
        },
        "matched_concepts": matched_concepts,
        "missed_concepts": missed_concepts,
    }
