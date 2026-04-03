from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

from db.supabase_client import supabase
from utils.db_utils import save_to_supabase
from services.interview_llm_service import generate_question, evaluate_answer, generate_followup, generate_final_report

router = APIRouter()

# --- Models ---
class InterviewStartRequest(BaseModel):
    role: str
    interview_type: str = "technical"
    difficulty: str = "intermediate"
    num_questions: int = 5

class InterviewStartResponse(BaseModel):
    session_id: str
    role: str
    interview_type: str
    difficulty: str
    question: dict
    total_questions: int

class AnswerEvalRequest(BaseModel):
    session_id: str
    question: str
    answer: str
    is_followup: bool = False
    code_snippet: str = ""
    video_url: str = ""

class AnswerEvalResponse(BaseModel):
    score: int
    feedback: str
    strengths: list[str]
    improvements: list[str]
    model_answer: str
    next_question: Optional[dict] = None
    is_finished: bool = False
    is_followup_next: bool = False

class ReportRequest(BaseModel):
    session_id: str

class ReportResponse(BaseModel):
    overall_summary: str
    key_strengths: list[str]
    areas_for_focus: list[str]
    recommended_next_steps: list[str]

# --- Endpoints ---
@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest, user=Depends(get_current_user)):
    import uuid
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    
    domain = "Software Engineering / CS / IT"
    if supabase:
        try:
            profile = supabase.table("profiles").select("domain").eq("id", str(user.id)).maybe_single().execute()
            if profile.data and profile.data.get("domain"):
                domain = profile.data["domain"]
        except Exception as e:
            print(f"[Interview] Failed to fetch domain: {e}")
            
    # Generate first question from bank (or LLM fallback)
    first_q = generate_question(request.role, request.interview_type, request.difficulty, [], domain)
    
    save_res = save_to_supabase("interview_sessions", {
        "user_id": str(user.id),
        "session_id": session_id,
        "role": request.role,
        "interview_type": request.interview_type,
        "difficulty": request.difficulty,
        "questions": [first_q],
        "total_questions": request.num_questions,
        "status": "in_progress"
    })
    
    if save_res is None:
        raise HTTPException(500, "Failed to initialize interview session in DB.")
    
    save_to_supabase("activity_log", {
        "user_id": str(user.id),
        "activity_type": "interview",
        "action": f"Started {request.interview_type} mock interview for {request.role}",
        "metadata": {"session_id": session_id}
    })

    # Strip internal metadata before sending to client
    client_q = {k: v for k, v in first_q.items() if not k.startswith("_")}

    return InterviewStartResponse(
        session_id=session_id,
        role=request.role,
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        question=client_q,
        total_questions=request.num_questions
    )

@router.post("/evaluate", response_model=AnswerEvalResponse)
async def evaluate_user_answer(request: AnswerEvalRequest, user=Depends(get_current_user)):
    if not supabase:
        raise HTTPException(503, "Database not configured")
        
    session_resp = supabase.table("interview_sessions").select("*").eq("session_id", request.session_id).maybe_single().execute()
    if session_resp is None or not getattr(session_resp, "data", None):
        raise HTTPException(404, "Session not found")
        
    session = session_resp.data
    if session.get("user_id") != str(user.id):
        raise HTTPException(403, "You do not own this interview session")
    role = session["role"]
    interview_type = session["interview_type"]
    difficulty = session["difficulty"]
    domain = "Software Engineering / CS / IT"
    try:
        profile = supabase.table("profiles").select("domain").eq("id", str(user.id)).maybe_single().execute()
        if profile and getattr(profile, "data", None) and profile.data.get("domain"):
            domain = profile.data["domain"]
    except Exception:
        pass
    total_q = session["total_questions"]
    questions_list = session["questions"] or []

    # Find the matching question in session to get bank metadata
    matched_q = next(
        (q for q in questions_list if q.get("question") == request.question),
        {}
    )
    expected_concepts = matched_q.get("expected_concepts", [])
    model_answer = matched_q.get("_model_answer", "")

    # Evaluate with hybrid engine (concept match + rubric + LLM)
    eval_result = evaluate_answer(
        request.question, request.answer, interview_type,
        expected_concepts=expected_concepts,
        model_answer=model_answer,
    )
    
    # Save the answer
    save_to_supabase("interview_answers", {
        "session_id": request.session_id,
        "question": request.question,
        "answer": request.answer,
        "score": eval_result.get("score", 50),
        "feedback": eval_result.get("feedback", ""),
        "strengths": eval_result.get("strengths", []),
        "improvements": eval_result.get("improvements", []),
        "model_answer": eval_result.get("model_answer", ""),
        "is_followup": request.is_followup,
        "code_snippet": request.code_snippet,
        "video_url": request.video_url
    })
    
    # Check if we need a followup
    needs_followup = eval_result.get("needs_followup", False)
    
    is_finished = False
    is_followup_next = False
    next_question = None
    
    if needs_followup and not request.is_followup:
        # Generate targeted follow-up based on missed concepts
        missed = eval_result.get("missed_concepts", [])
        follow_up_q = generate_followup(request.question, request.answer, missed_concepts=missed)
        follow_up_q["category"] = "Follow-up"
        next_question = follow_up_q
        is_followup_next = True
        
        # update session questions
        questions_list.append(next_question)
        supabase.table("interview_sessions").update({"questions": questions_list}).eq("session_id", request.session_id).execute()
    else:
        # Count non-followup questions to see if we reached the end
        # We assume every non-followup question counts as 1 main question
        # Wait, the questions_list already contains all generated questions including follow-ups.
        # Let's count answers that are not follow-ups to determine progress.
        answers_resp = supabase.table("interview_answers").select("is_followup").eq("session_id", request.session_id).execute()
        main_answers = [a for a in answers_resp.data if not a.get("is_followup")]
        
        if len(main_answers) >= total_q:
            is_finished = True
            supabase.table("interview_sessions").update({"status": "completed"}).eq("session_id", request.session_id).execute()
        else:
            # Generate next question from bank (or LLM fallback)
            prev_qs = [q.get("question", "") for q in questions_list]
            next_q = generate_question(role, interview_type, difficulty, prev_qs, domain)
            next_question = {k: v for k, v in next_q.items() if not k.startswith("_")}
            questions_list.append(next_q)  # store full data (with _model_answer)
            supabase.table("interview_sessions").update({"questions": questions_list}).eq("session_id", request.session_id).execute()

    return AnswerEvalResponse(
        score=eval_result.get("score", 50),
        feedback=eval_result.get("feedback", ""),
        strengths=eval_result.get("strengths", []),
        improvements=eval_result.get("improvements", []),
        model_answer=eval_result.get("model_answer", ""),
        next_question=next_question,
        is_finished=is_finished,
        is_followup_next=is_followup_next
    )

@router.post("/report", response_model=ReportResponse)
async def generate_report(request: ReportRequest, user=Depends(get_current_user)):
    if not supabase:
        raise HTTPException(503, "Database not configured")
        
    # Verify session ownership
    session_resp = supabase.table("interview_sessions").select("user_id").eq("session_id", request.session_id).maybe_single().execute()
    if not session_resp.data:
        raise HTTPException(404, "Session not found")
    if session_resp.data.get("user_id") != str(user.id):
        raise HTTPException(403, "You do not own this interview session")

    answers_resp = supabase.table("interview_answers").select("question, answer, score").eq("session_id", request.session_id).execute()
    if not answers_resp.data:
        raise HTTPException(404, "No answers found for session")
        
    report = generate_final_report(answers_resp.data)
    return ReportResponse(
        overall_summary=report.get("overall_summary", "Good job"),
        key_strengths=report.get("key_strengths", []),
        areas_for_focus=report.get("areas_for_focus", []),
        recommended_next_steps=report.get("recommended_next_steps", [])
    )
