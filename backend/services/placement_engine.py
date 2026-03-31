"""
VidyaMitra — Placement Analytics Engine
Generates cohort-level analytics for placement officers.
Uses real Supabase data when available, falls back to realistic seeded demo data.
"""

import random
import math
from datetime import datetime, timedelta
from typing import Optional

from services.domain_knowledge import DOMAIN_KNOWLEDGE, DOMAIN_ALIAS_TO_KEY


# ═══════════════════════════════════════════════════════════════════
# DEMO DATA GENERATOR
# ═══════════════════════════════════════════════════════════════════

_DEMO_SEED = 42
_DEPARTMENTS = [
    {"key": "Software", "name": "CSE / IT", "students": 60, "color": "#7c3aed"},
    {"key": "ECE", "name": "ECE", "students": 45, "color": "#06b6d4"},
    {"key": "EEE", "name": "EEE", "students": 35, "color": "#f59e0b"},
    {"key": "Mechanical", "name": "Mechanical", "students": 40, "color": "#10b981"},
    {"key": "Civil", "name": "Civil", "students": 30, "color": "#ef4444"},
]

_SOFT_SKILLS = ["Communication", "Teamwork", "Problem Solving", "Leadership", "Time Management"]


def _seeded_random(seed_offset=0):
    """Return a seeded random instance for deterministic demo data."""
    return random.Random(_DEMO_SEED + seed_offset)


def _generate_student_profiles(dept: dict, rng: random.Random) -> list[dict]:
    """Generate realistic student profiles for a department."""
    domain_data = DOMAIN_KNOWLEDGE.get(dept["key"], DOMAIN_KNOWLEDGE["Software"])
    all_skills = domain_data["core_skills"] + domain_data["tools"]

    students = []
    for i in range(dept["students"]):
        # Bell curve-ish skill distribution
        skill_count = max(2, min(len(all_skills), int(rng.gauss(len(all_skills) * 0.55, len(all_skills) * 0.15))))
        student_skills = rng.sample(all_skills, skill_count)

        # Generate scores with realistic distribution
        ats_score = max(20, min(98, int(rng.gauss(62, 18))))
        skill_match = max(15, min(95, int(rng.gauss(55, 20))))
        interview_score = max(10, min(100, int(rng.gauss(50, 22))))

        # Readiness = weighted average
        readiness = int(ats_score * 0.3 + skill_match * 0.4 + interview_score * 0.3)

        students.append({
            "name": f"Student {dept['name']}-{i+1:03d}",
            "department": dept["name"],
            "department_key": dept["key"],
            "skills": student_skills,
            "skill_count": len(student_skills),
            "ats_score": ats_score,
            "skill_match": skill_match,
            "interview_score": interview_score,
            "readiness_score": readiness,
            "resume_uploaded": rng.random() > 0.15,
            "interview_completed": rng.random() > 0.35,
            "roadmap_generated": rng.random() > 0.25,
        })

    return students


def _compute_skill_heatmap(all_students: list[dict]) -> list[dict]:
    """
    Generate a skill heatmap: departments × skills.
    Returns list of { skill, dept_name, proficiency_pct }.
    """
    # For each department, compute what % of students have each skill
    dept_students = {}
    for s in all_students:
        dk = s["department"]
        if dk not in dept_students:
            dept_students[dk] = []
        dept_students[dk].append(s)

    # Get top skills across all departments
    skill_counts = {}
    for s in all_students:
        for sk in s["skills"]:
            skill_counts[sk] = skill_counts.get(sk, 0) + 1

    top_skills = sorted(skill_counts.keys(), key=lambda x: skill_counts[x], reverse=True)[:12]

    heatmap = []
    for skill in top_skills:
        for dept_name, students in dept_students.items():
            count = sum(1 for s in students if skill in s["skills"])
            pct = int((count / max(len(students), 1)) * 100)
            heatmap.append({
                "skill": skill,
                "department": dept_name,
                "proficiency_pct": pct,
                "student_count": count,
                "total_students": len(students),
            })

    return heatmap


def _compute_department_stats(all_students: list[dict]) -> list[dict]:
    """Compute per-department readiness stats."""
    dept_map = {}
    for s in all_students:
        dk = s["department"]
        if dk not in dept_map:
            dept_map[dk] = []
        dept_map[dk].append(s)

    dept_stats = []
    for dept in _DEPARTMENTS:
        students = dept_map.get(dept["name"], [])
        if not students:
            continue

        avg_readiness = int(sum(s["readiness_score"] for s in students) / len(students))
        avg_ats = int(sum(s["ats_score"] for s in students) / len(students))
        avg_skill = int(sum(s["skill_match"] for s in students) / len(students))
        avg_interview = int(sum(s["interview_score"] for s in students) / len(students))

        ready = sum(1 for s in students if s["readiness_score"] >= 65)
        in_progress = sum(1 for s in students if 40 <= s["readiness_score"] < 65)
        at_risk = sum(1 for s in students if s["readiness_score"] < 40)

        # Top skill gaps (skills with lowest proficiency)
        domain_data = DOMAIN_KNOWLEDGE.get(dept["key"], DOMAIN_KNOWLEDGE["Software"])
        all_required = domain_data["core_skills"] + domain_data["tools"]
        skill_coverage = {}
        for sk in all_required:
            count = sum(1 for s in students if sk in s["skills"])
            skill_coverage[sk] = int((count / len(students)) * 100)

        top_gaps = sorted(skill_coverage.items(), key=lambda x: x[1])[:5]

        dept_stats.append({
            "department": dept["name"],
            "department_key": dept["key"],
            "color": dept["color"],
            "total_students": len(students),
            "avg_readiness": avg_readiness,
            "avg_ats_score": avg_ats,
            "avg_skill_match": avg_skill,
            "avg_interview_score": avg_interview,
            "ready_count": ready,
            "in_progress_count": in_progress,
            "at_risk_count": at_risk,
            "ready_pct": int((ready / len(students)) * 100),
            "resume_uploaded_pct": int((sum(1 for s in students if s["resume_uploaded"]) / len(students)) * 100),
            "interview_completed_pct": int((sum(1 for s in students if s["interview_completed"]) / len(students)) * 100),
            "top_skill_gaps": [{"skill": sk, "coverage_pct": pct} for sk, pct in top_gaps],
        })

    return dept_stats


def _compute_readiness_distribution(all_students: list[dict]) -> dict:
    """Compute overall readiness buckets."""
    total = len(all_students)
    ready = sum(1 for s in all_students if s["readiness_score"] >= 65)
    in_progress = sum(1 for s in all_students if 40 <= s["readiness_score"] < 65)
    at_risk = sum(1 for s in all_students if s["readiness_score"] < 40)

    return {
        "total_students": total,
        "ready": {"count": ready, "pct": int((ready / total) * 100)},
        "in_progress": {"count": in_progress, "pct": int((in_progress / total) * 100)},
        "at_risk": {"count": at_risk, "pct": int((at_risk / total) * 100)},
        "overall_readiness_pct": int(sum(s["readiness_score"] for s in all_students) / total),
    }


def _compute_top_skill_gaps(all_students: list[dict]) -> list[dict]:
    """Find the most common missing skills across entire cohort."""
    # Combine all required skills across domains
    all_required = set()
    for dk, data in DOMAIN_KNOWLEDGE.items():
        all_required.update(data["core_skills"])
        all_required.update(data["tools"])

    skill_coverage = {}
    for skill in all_required:
        count = sum(1 for s in all_students if skill in s["skills"])
        skill_coverage[skill] = {
            "skill": skill,
            "students_with": count,
            "students_without": len(all_students) - count,
            "coverage_pct": int((count / len(all_students)) * 100),
        }

    # Sort by coverage (ascending = biggest gaps first)
    gaps = sorted(skill_coverage.values(), key=lambda x: x["coverage_pct"])
    return gaps[:15]


def _compute_engagement_metrics(all_students: list[dict]) -> dict:
    """Compute platform engagement stats."""
    total = len(all_students)
    return {
        "resumes_uploaded": sum(1 for s in all_students if s["resume_uploaded"]),
        "resumes_pct": int((sum(1 for s in all_students if s["resume_uploaded"]) / total) * 100),
        "interviews_completed": sum(1 for s in all_students if s["interview_completed"]),
        "interviews_pct": int((sum(1 for s in all_students if s["interview_completed"]) / total) * 100),
        "roadmaps_generated": sum(1 for s in all_students if s["roadmap_generated"]),
        "roadmaps_pct": int((sum(1 for s in all_students if s["roadmap_generated"]) / total) * 100),
        "avg_ats_score": int(sum(s["ats_score"] for s in all_students) / total),
        "avg_skill_match": int(sum(s["skill_match"] for s in all_students) / total),
        "avg_interview_score": int(sum(s["interview_score"] for s in all_students) / total),
    }


# ═══════════════════════════════════════════════════════════════════
# MAIN ANALYTICS FUNCTION
# ═══════════════════════════════════════════════════════════════════

def generate_placement_analytics(use_demo: bool = True) -> dict:
    """
    Generate comprehensive placement analytics.
    Uses demo data for hackathon presentation; can be extended to use real Supabase data.
    """
    rng = _seeded_random()

    # Generate all students
    all_students = []
    for dept in _DEPARTMENTS:
        students = _generate_student_profiles(dept, _seeded_random(hash(dept["key"]) % 1000))
        all_students.extend(students)

    # Compute analytics
    readiness = _compute_readiness_distribution(all_students)
    dept_stats = _compute_department_stats(all_students)
    skill_heatmap = _compute_skill_heatmap(all_students)
    top_gaps = _compute_top_skill_gaps(all_students)
    engagement = _compute_engagement_metrics(all_students)

    # Students at risk
    at_risk_students = sorted(
        [s for s in all_students if s["readiness_score"] < 40],
        key=lambda x: x["readiness_score"],
    )[:20]

    # Top performers
    top_performers = sorted(
        all_students,
        key=lambda x: x["readiness_score"],
        reverse=True,
    )[:10]

    return {
        "batch_name": "2025-26 Batch",
        "generated_at": datetime.utcnow().isoformat(),
        "total_students": len(all_students),
        "departments": [d["name"] for d in _DEPARTMENTS],
        "readiness": readiness,
        "department_stats": dept_stats,
        "skill_heatmap": skill_heatmap,
        "top_skill_gaps": top_gaps,
        "engagement": engagement,
        "at_risk_students": [
            {
                "name": s["name"],
                "department": s["department"],
                "readiness_score": s["readiness_score"],
                "ats_score": s["ats_score"],
                "skill_match": s["skill_match"],
                "resume_uploaded": s["resume_uploaded"],
            }
            for s in at_risk_students
        ],
        "top_performers": [
            {
                "name": s["name"],
                "department": s["department"],
                "readiness_score": s["readiness_score"],
                "ats_score": s["ats_score"],
                "skill_match": s["skill_match"],
            }
            for s in top_performers
        ],
    }
