"""
Daily Plan Router — Smart AI-Generated Daily To-Do.
Generates personalized daily action plans based on student gaps + goal + deadline.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional

from routers.auth import get_current_user
from services.daily_plan_engine import generate_daily_plan, mark_task_complete, set_user_goal

router = APIRouter()


class GoalRequest(BaseModel):
    goal: str = Field(..., min_length=2, description="Target career goal (e.g., 'SDE Internship at FAANG')")
    deadline: str = Field(..., description="ISO date string (e.g., '2026-06-01')")


class TaskCompleteRequest(BaseModel):
    task_id: int = Field(..., ge=1)


@router.get("/today")
async def get_daily_plan(
    refresh: bool = Query(False, description="Force regenerate the plan"),
    user=Depends(get_current_user),
):
    """Get today's AI-generated daily action plan.
    Returns cached plan if already generated today (unless refresh=true).
    """
    user_id = str(user.id) if hasattr(user, "id") else None
    
    metadata = getattr(user, "user_metadata", {}) or {}
    name = metadata.get("full_name", metadata.get("name", "Student")) if metadata else "Student"
    
    if isinstance(name, str) and name:
        name = name.split()[0]  # First name only

    plan = generate_daily_plan(
        user_id=user_id,
        student_name=name,
        force_refresh=refresh,
    )
    return plan


@router.post("/complete-task")
async def complete_task(req: TaskCompleteRequest, user=Depends(get_current_user)):
    """Mark a specific task as completed in today's plan."""
    user_id = str(user.id) if hasattr(user, "id") else None
    result = mark_task_complete(user_id, req.task_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Failed to mark task."))
    return result


@router.post("/set-goal")
async def update_goal(req: GoalRequest, user=Depends(get_current_user)):
    """Set or update the student's career goal and deadline."""
    user_id = str(user.id) if hasattr(user, "id") else None
    result = set_user_goal(user_id, req.goal, req.deadline)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Failed to set goal."))
    return result
