"""
VidyaMitra — Smart Daily To-Do Engine
Generates AI-powered daily action plans based on student gaps, goal, and deadline.
Plans are cached per user per day — regenerated on first load each morning.
"""

import json
from datetime import datetime, timedelta
from typing import Optional

from db.supabase_client import supabase
from utils.llm_utils import call_llm_json


# ═══════════════════════════════════════════════════════════════════
# CONTEXT GATHERING
# ═══════════════════════════════════════════════════════════════════

def _fetch_student_context(user_id: str) -> dict:
    """Gather all available student data for plan generation."""
    context = {
        "resume_score": 0,
        "skill_match": 0,
        "interview_score": 0,
        "skills": [],
        "weak_areas": [],
        "coding_score": 0,
        "leetcode_solved": 0,
        "github_repos": 0,
        "goal": "SDE Internship",
        "deadline_days": 60,
    }

    if not supabase or not user_id:
        return context

    try:
        # Latest resume score
        res = supabase.table("resume_analyses").select("overall_score").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        if res.data:
            context["resume_score"] = res.data[0].get("overall_score", 0)

        # Latest skill analysis
        sk = supabase.table("skill_analyses").select("match_percentage, missing_skills, matched_skills").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        if sk.data:
            context["skill_match"] = sk.data[0].get("match_percentage", 0)
            context["weak_areas"] = sk.data[0].get("missing_skills", [])[:5] if isinstance(sk.data[0].get("missing_skills"), list) else []
            context["skills"] = sk.data[0].get("matched_skills", [])[:10] if isinstance(sk.data[0].get("matched_skills"), list) else []

        # Latest interview score
        sessions = supabase.table("interview_sessions").select("session_id").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        if sessions.data:
            sid = sessions.data[0]["session_id"]
            answers = supabase.table("interview_answers").select("score").eq("session_id", sid).execute()
            if answers.data:
                context["interview_score"] = round(sum(a["score"] for a in answers.data) / len(answers.data))

        # Coding profile
        cp = supabase.table("coding_profiles").select("profile_data, coding_score").eq("user_id", user_id).order("updated_at", desc=True).limit(1).execute()
        if cp.data:
            context["coding_score"] = cp.data[0].get("coding_score", 0)
            profile = cp.data[0].get("profile_data", {})
            if isinstance(profile, dict):
                lc = profile.get("leetcode", {})
                if isinstance(lc, dict) and not lc.get("error"):
                    context["leetcode_solved"] = lc.get("total_solved", 0)
                gh = profile.get("github", {})
                if isinstance(gh, dict) and not gh.get("error"):
                    context["github_repos"] = gh.get("public_repos", 0)

        # User goal
        goal = supabase.table("user_goals").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        if goal.data:
            context["goal"] = goal.data[0].get("goal", "SDE Internship")
            deadline = goal.data[0].get("deadline")
            if deadline:
                try:
                    deadline_date = datetime.fromisoformat(deadline.replace("Z", "+00:00")).replace(tzinfo=None)
                    context["deadline_days"] = max(1, (deadline_date - datetime.utcnow()).days)
                except:
                    pass

    except Exception as e:
        print(f"[DailyPlan] Context fetch failed: {e}")

    return context


# ═══════════════════════════════════════════════════════════════════
# PLAN GENERATION
# ═══════════════════════════════════════════════════════════════════

def _build_prompt(ctx: dict, student_name: str = "Student") -> str:
    """Build the LLM prompt for daily plan generation."""
    weak_str = ", ".join(ctx["weak_areas"][:5]) if ctx["weak_areas"] else "none identified yet"
    skills_str = ", ".join(ctx["skills"][:8]) if ctx["skills"] else "not analyzed yet"

    return f"""You are VidyaMitra, an AI career coach. Generate a personalized daily action plan for a student.

STUDENT PROFILE:
- Name: {student_name}
- Goal: {ctx['goal']}
- Days remaining: {ctx['deadline_days']} days
- Resume score: {ctx['resume_score']}/100
- Skill match: {ctx['skill_match']}%
- Interview score: {ctx['interview_score']}/100
- Coding score: {ctx['coding_score']}/100
- LeetCode problems solved: {ctx['leetcode_solved']}
- GitHub repos: {ctx['github_repos']}
- Current skills: {skills_str}
- Weak areas / missing skills: {weak_str}

Generate a daily action plan with EXACTLY this JSON schema:
{{
    "greeting": "A motivating one-line greeting mentioning their name and goal timeline",
    "focus_theme": "Today's focus area (e.g., 'Arrays & Hashing', 'System Design Basics', 'Resume Polish')",
    "urgency": "low" | "medium" | "high" (based on days remaining and readiness),
    "tasks": [
        {{
            "id": 1,
            "category": "coding" | "learning" | "resume" | "apply" | "interview",
            "task": "Specific, actionable task description",
            "detail": "Why this task matters today",
            "priority": "high" | "medium" | "low",
            "est_minutes": 30
        }}
    ],
    "pro_tip": "One sentence motivational or strategic tip for the day"
}}

RULES:
- Generate 4-6 tasks.
- Tasks must be SPECIFIC (not generic). Reference actual skill gaps and scores.
- If resume score < 60, include a resume improvement task.
- If interview score < 50, include an interview practice task.
- If leetcode_solved < 50, include more coding tasks.
- If deadline < 30 days, increase urgency and prioritize application tasks.
- Each task needs a realistic time estimate.
- Total estimated time should be 90-150 minutes (realistic daily commitment).
"""


def generate_daily_plan(user_id: str, student_name: str = "Student", force_refresh: bool = False) -> dict:
    """Generate or retrieve cached daily plan."""
    today = datetime.utcnow().strftime("%Y-%m-%d")

    # Check cache (unless force refresh)
    if not force_refresh and supabase and user_id:
        try:
            cached = (
                supabase.table("daily_plans")
                .select("*")
                .eq("user_id", user_id)
                .eq("plan_date", today)
                .limit(1)
                .execute()
            )
            if cached.data:
                plan_data = cached.data[0].get("plan_data", {})
                if isinstance(plan_data, str):
                    plan_data = json.loads(plan_data)
                plan_data["from_cache"] = True
                plan_data["plan_date"] = today
                # Merge completed tasks
                completed = cached.data[0].get("completed_tasks", [])
                if isinstance(completed, str):
                    try:
                        completed = json.loads(completed)
                    except:
                        completed = []
                plan_data["completed_tasks"] = completed or []
                return plan_data
        except Exception as e:
            print(f"[DailyPlan] Cache check failed: {e}")

    # Gather context
    ctx = _fetch_student_context(user_id)

    # Generate via LLM
    prompt = _build_prompt(ctx, student_name)
    fallback = _generate_fallback_plan(ctx, student_name)

    plan = call_llm_json(prompt, fallback=fallback)

    # Ensure required fields
    if "greeting" not in plan:
        plan = fallback
    plan["from_cache"] = False
    plan["plan_date"] = today
    plan["completed_tasks"] = []
    plan["generated_at"] = datetime.utcnow().isoformat()

    # Add estimated total
    tasks = plan.get("tasks", [])
    plan["estimated_total_minutes"] = sum(t.get("est_minutes", 30) for t in tasks)

    # Cache to Supabase
    if supabase and user_id:
        try:
            # Delete old plans for today
            supabase.table("daily_plans").delete().eq("user_id", user_id).eq("plan_date", today).execute()
            save_data = {
                "user_id": user_id,
                "plan_date": today,
                "plan_data": plan,
                "completed_tasks": [],
                "created_at": datetime.utcnow().isoformat(),
            }
            supabase.table("daily_plans").insert(save_data).execute()
        except Exception as e:
            print(f"[DailyPlan] Cache save failed: {e}")

    return plan


def _generate_fallback_plan(ctx: dict, name: str) -> dict:
    """Generate a rule-based fallback plan if LLM fails."""
    tasks = []
    task_id = 1

    days = ctx["deadline_days"]
    urgency = "high" if days < 30 else ("medium" if days < 60 else "low")

    # Always include coding
    if ctx["leetcode_solved"] < 50:
        tasks.append({
            "id": task_id, "category": "coding",
            "task": "Solve 3 LeetCode Easy problems (Arrays & Strings)",
            "detail": f"You've solved {ctx['leetcode_solved']} problems. Build your foundation first.",
            "priority": "high", "est_minutes": 45,
        })
    else:
        tasks.append({
            "id": task_id, "category": "coding",
            "task": "Solve 2 LeetCode Medium problems (focus on weak topics)",
            "detail": f"With {ctx['leetcode_solved']} solved, it's time to level up to medium difficulty.",
            "priority": "high", "est_minutes": 50,
        })
    task_id += 1

    # Resume task if score is low
    if ctx["resume_score"] < 70:
        tasks.append({
            "id": task_id, "category": "resume",
            "task": "Rewrite 2 resume bullet points using STAR method",
            "detail": f"Resume score is {ctx['resume_score']}/100. ATS keywords and metrics will boost it.",
            "priority": "high", "est_minutes": 20,
        })
        task_id += 1

    # Skill learning
    if ctx["weak_areas"]:
        weak = ctx["weak_areas"][0] if ctx["weak_areas"] else "a new technology"
        tasks.append({
            "id": task_id, "category": "learning",
            "task": f"Complete 1 tutorial/module on {weak}",
            "detail": f"'{weak}' is a gap in your profile. Even 30 mins of learning helps.",
            "priority": "medium", "est_minutes": 30,
        })
        task_id += 1

    # Interview prep if score is low
    if ctx["interview_score"] < 60:
        tasks.append({
            "id": task_id, "category": "interview",
            "task": "Take a mock interview (behavioral + technical)",
            "detail": f"Interview score is {ctx['interview_score']}/100. Practice builds confidence.",
            "priority": "medium", "est_minutes": 30,
        })
        task_id += 1

    # Apply if deadline is close
    if days < 45:
        tasks.append({
            "id": task_id, "category": "apply",
            "task": f"Apply to 1 {ctx['goal']} opening today",
            "detail": f"Only {days} days left. Start applying while improving in parallel.",
            "priority": "high" if days < 20 else "medium", "est_minutes": 15,
        })
        task_id += 1

    # GitHub activity
    if ctx["github_repos"] < 5:
        tasks.append({
            "id": task_id, "category": "coding",
            "task": "Push today's practice code to a GitHub repo",
            "detail": f"You have {ctx['github_repos']} repos. Active GitHub = better profile.",
            "priority": "low", "est_minutes": 10,
        })
        task_id += 1

    return {
        "greeting": f"Good morning, {name}! {days} days to your {ctx['goal']} goal. Let's make today count! 💪",
        "focus_theme": ctx["weak_areas"][0] if ctx["weak_areas"] else "General Preparation",
        "urgency": urgency,
        "tasks": tasks,
        "pro_tip": "Consistency beats intensity. 90 minutes of focused daily work compounds into massive results.",
    }


def mark_task_complete(user_id: str, task_id: int) -> dict:
    """Mark a specific task as completed for today's plan."""
    today = datetime.utcnow().strftime("%Y-%m-%d")

    if not supabase or not user_id:
        return {"success": False, "message": "Database not available."}

    try:
        result = (
            supabase.table("daily_plans")
            .select("id, completed_tasks")
            .eq("user_id", user_id)
            .eq("plan_date", today)
            .limit(1)
            .execute()
        )

        if not result.data:
            return {"success": False, "message": "No plan found for today."}

        row = result.data[0]
        completed = row.get("completed_tasks", [])
        if isinstance(completed, str):
            try:
                completed = json.loads(completed)
            except:
                completed = []
        if not isinstance(completed, list):
            completed = []

        if task_id not in completed:
            completed.append(task_id)

        supabase.table("daily_plans").update({
            "completed_tasks": completed
        }).eq("id", row["id"]).execute()

        return {"success": True, "completed_tasks": completed}
    except Exception as e:
        return {"success": False, "message": str(e)}


def set_user_goal(user_id: str, goal: str, deadline: str) -> dict:
    """Set or update the user's career goal and deadline."""
    if not supabase or not user_id:
        return {"success": False, "message": "Database not available."}

    try:
        # Delete existing goal
        try:
            supabase.table("user_goals").delete().eq("user_id", user_id).execute()
        except:
            pass

        data = {
            "user_id": user_id,
            "goal": goal,
            "deadline": deadline,
            "created_at": datetime.utcnow().isoformat(),
        }
        supabase.table("user_goals").insert(data).execute()
        return {"success": True, "goal": goal, "deadline": deadline}
    except Exception as e:
        return {"success": False, "message": str(e)}
