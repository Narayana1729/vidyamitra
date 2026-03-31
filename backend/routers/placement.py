"""
Placement Analytics Router
Provides cohort-level analytics for placement officers / company portal.
"""

from fastapi import APIRouter, Depends
from routers.auth import get_current_user
from services.placement_engine import generate_placement_analytics

router = APIRouter()


@router.get("/analytics")
async def get_placement_analytics(user=Depends(get_current_user)):
    """Return comprehensive placement analytics for the batch."""
    return generate_placement_analytics(use_demo=True)


@router.get("/department/{dept_key}")
async def get_department_detail(dept_key: str, user=Depends(get_current_user)):
    """Return detailed analytics for a specific department."""
    data = generate_placement_analytics(use_demo=True)
    dept = next((d for d in data["department_stats"] if d["department_key"] == dept_key), None)
    if not dept:
        return {"error": f"Department {dept_key} not found"}

    # Filter heatmap for this department
    dept_heatmap = [h for h in data["skill_heatmap"] if h["department"] == dept["department"]]

    # Filter at-risk students for this department
    dept_at_risk = [s for s in data["at_risk_students"] if s["department"] == dept["department"]]

    return {
        "department": dept,
        "skill_heatmap": dept_heatmap,
        "at_risk_students": dept_at_risk,
    }
