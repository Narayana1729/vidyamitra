from fastapi import APIRouter, Depends
from routers.auth import get_current_user
from models.resume_models import ImproveRequest
from utils.llm_utils import call_llm_text

router = APIRouter()

@router.post("/improve")
async def improve(data: ImproveRequest, user = Depends(get_current_user)):
    prompt = f"""
    Improve this resume bullet point using strong action verbs, measurable impact, and clarity.
    Ensure the output is exactly ONE sentence and highly professional. Do not add any conversational text.
    
    Input: {data.text}
    """
    improved = call_llm_text(prompt, fallback=data.text)
    return {"improved": improved}