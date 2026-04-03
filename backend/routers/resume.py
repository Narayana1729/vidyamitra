import re
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from routers.auth import get_current_user
from pydantic import BaseModel
from docx import Document
import pdfplumber
import io

from utils.db_utils import save_to_supabase
from utils.llm_utils import call_llm_json
from services.domain_knowledge import get_domain_knowledge

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

# ---- Action verbs for ATS scoring ----
ACTION_VERBS = {
    "led", "developed", "designed", "implemented", "managed", "created",
    "built", "improved", "reduced", "increased", "delivered", "launched",
    "optimized", "automated", "architected", "engineered", "mentored",
    "streamlined", "analyzed", "collaborated", "coordinated", "established",
    "integrated", "migrated", "scaled", "secured", "deployed", "refactored",
}


# ---- Resume Builder Models ----

class ResumeBuilderRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    linkedin: str = ""
    summary: str = ""
    target_role: str = ""
    skills: list[str] = []
    experience: list[dict] = []  # [{title, company, duration, points: []}]
    education: list[dict] = []   # [{degree, institution, year}]
    projects: list[dict] = []    # [{name, description, tech}]
    template: str = "classic"    # classic, modern, minimal, technical


class ResumeBuilderResponse(BaseModel):
    html: str
    template: str
    ats_tips: list[str]
    ats_score_estimate: int


TEMPLATES = {
    "classic": {
        "name": "Classic Professional",
        "description": "Traditional single-column layout trusted by Fortune 500 recruiters",
        "accent": "#2563eb",
    },
    "modern": {
        "name": "Modern Clean",
        "description": "Contemporary design with subtle color accents and clear hierarchy",
        "accent": "#7c3aed",
    },
    "minimal": {
        "name": "Minimal Elegant",
        "description": "Whitespace-focused design that lets your content shine",
        "accent": "#0f172a",
    },
    "technical": {
        "name": "Technical Pro",
        "description": "Skills-forward layout optimized for tech and engineering roles",
        "accent": "#059669",
    },
}


def generate_resume_html(data: ResumeBuilderRequest) -> str:
    import html as _html
    _e = _html.escape  # shorthand for escaping user input

    tmpl = TEMPLATES.get(data.template, TEMPLATES["classic"])
    accent = tmpl["accent"]

    skills_html = "".join(f'<span class="skill-tag">{_e(s)}</span>' for s in data.skills) if data.skills else ""

    exp_html = ""
    for exp in data.experience:
        points = "".join(f"<li>{_e(p)}</li>" for p in exp.get("points", []) if p.strip())
        exp_html += f"""
        <div class="section-item">
            <div class="item-header">
                <strong>{_e(exp.get('title', ''))}</strong>
                <span class="item-date">{_e(exp.get('duration', ''))}</span>
            </div>
            <div class="item-sub">{_e(exp.get('company', ''))}</div>
            {"<ul>" + points + "</ul>" if points else ""}
        </div>"""

    edu_html = ""
    for edu in data.education:
        edu_html += f"""
        <div class="section-item">
            <div class="item-header">
                <strong>{_e(edu.get('degree', ''))}</strong>
                <span class="item-date">{_e(edu.get('year', ''))}</span>
            </div>
            <div class="item-sub">{_e(edu.get('institution', ''))}</div>
        </div>"""

    proj_html = ""
    for proj in data.projects:
        proj_html += f"""
        <div class="section-item">
            <strong>{_e(proj.get('name', ''))}</strong>
            {"<span class='item-tech'>" + _e(proj.get('tech', '')) + "</span>" if proj.get('tech') else ""}
            <p>{_e(proj.get('description', ''))}</p>
        </div>"""

    # ── Build sections HTML ──
    sections = ""
    if data.summary:
        sections += f"<div class='summary'>{data.summary}</div>"
    if skills_html:
        sections += f"<div class='section'><h2>Skills</h2><div class='skills-wrap'>{skills_html}</div></div>"
    if exp_html:
        sections += f"<div class='section'><h2>Experience</h2>{exp_html}</div>"
    if edu_html:
        sections += f"<div class='section'><h2>Education</h2>{edu_html}</div>"
    if proj_html:
        sections += f"<div class='section'><h2>Projects</h2>{proj_html}</div>"

    contact_parts = [data.email, data.phone]
    if data.linkedin:
        contact_parts.append(f'<a href="{data.linkedin}">LinkedIn</a>')
    contact_html = " &bull; ".join(contact_parts)

    # ── Template-specific CSS ──
    if data.template == "modern":
        css = f"""
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; line-height: 1.6; background: #fff; }}
        .resume {{ max-width: 800px; margin: 0 auto; padding: 40px; }}
        .header {{ position: relative; padding: 24px 0 20px 0; margin-bottom: 20px; border-bottom: none; }}
        .header::before {{ content: ''; position: absolute; left: 0; top: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, {accent}, #06b6d4); border-radius: 2px; }}
        .header {{ padding-left: 20px; }}
        .header h1 {{ font-size: 30px; font-weight: 800; color: {accent}; letter-spacing: -0.5px; }}
        .header .role {{ font-size: 14px; color: #64748b; font-weight: 500; margin-top: 2px; }}
        .header .contact {{ font-size: 13px; color: #64748b; margin-top: 6px; }}
        .header .contact a {{ color: {accent}; text-decoration: none; }}
        .summary {{ font-size: 14px; color: #475569; margin-bottom: 24px; padding: 14px 18px; background: #f8f7ff; border-radius: 8px; border-left: 3px solid {accent}; line-height: 1.7; }}
        .section {{ margin-bottom: 22px; }}
        .section h2 {{ font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: {accent}; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }}
        .section-item {{ margin-bottom: 14px; padding-left: 12px; border-left: 2px solid #e2e8f0; }}
        .section-item:hover {{ border-left-color: {accent}; }}
        .item-header {{ display: flex; justify-content: space-between; align-items: baseline; }}
        .item-header strong {{ font-size: 15px; }}
        .item-date {{ font-size: 12px; color: #94a3b8; font-weight: 500; }}
        .item-sub {{ font-size: 13px; color: #64748b; margin-bottom: 4px; }}
        .item-tech {{ font-size: 12px; color: {accent}; font-weight: 500; }}
        ul {{ padding-left: 18px; font-size: 13px; color: #334155; }}
        li {{ margin-bottom: 3px; }}
        p {{ font-size: 13px; color: #334155; }}
        .skills-wrap {{ display: flex; flex-wrap: wrap; gap: 6px; }}
        .skill-tag {{ display: inline-block; padding: 4px 12px; background: {accent}12; color: {accent}; border-radius: 20px; font-size: 12px; font-weight: 600; }}
        @media print {{ body {{ background: #fff; }} .resume {{ padding: 20px; }} }}
        """
    elif data.template == "minimal":
        css = f"""
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Georgia', 'Times New Roman', serif; color: #0f172a; line-height: 1.7; background: #fff; }}
        .resume {{ max-width: 750px; margin: 0 auto; padding: 48px 40px; }}
        .header {{ text-align: center; margin-bottom: 28px; padding-bottom: 20px; }}
        .header h1 {{ font-size: 32px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; color: #0f172a; }}
        .header .role {{ font-size: 13px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }}
        .header .contact {{ font-size: 12px; color: #94a3b8; margin-top: 10px; letter-spacing: 0.5px; }}
        .header .contact a {{ color: #64748b; text-decoration: none; }}
        .header::after {{ content: ''; display: block; width: 50px; height: 1px; background: #cbd5e1; margin: 16px auto 0; }}
        .summary {{ font-size: 14px; color: #475569; margin-bottom: 28px; text-align: center; font-style: italic; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.8; }}
        .section {{ margin-bottom: 24px; }}
        .section h2 {{ font-size: 11px; text-transform: uppercase; letter-spacing: 3px; font-weight: 400; color: #94a3b8; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; }}
        .section-item {{ margin-bottom: 14px; }}
        .item-header {{ display: flex; justify-content: space-between; align-items: baseline; }}
        .item-header strong {{ font-size: 14px; font-weight: 600; }}
        .item-date {{ font-size: 12px; color: #94a3b8; }}
        .item-sub {{ font-size: 13px; color: #64748b; margin-bottom: 4px; }}
        .item-tech {{ font-size: 11px; color: #64748b; font-style: italic; }}
        ul {{ padding-left: 18px; font-size: 13px; color: #334155; list-style-type: '— '; }}
        li {{ margin-bottom: 3px; }}
        p {{ font-size: 13px; color: #334155; }}
        .skills-wrap {{ display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }}
        .skill-tag {{ display: inline-block; padding: 3px 14px; border: 1px solid #e2e8f0; border-radius: 3px; font-size: 12px; color: #334155; font-family: 'Segoe UI', sans-serif; }}
        @media print {{ body {{ background: #fff; }} .resume {{ padding: 20px; }} }}
        """
    elif data.template == "technical":
        css = f"""
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; line-height: 1.6; background: #fff; }}
        .resume {{ max-width: 800px; margin: 0 auto; padding: 40px; }}
        .header {{ background: #f0fdf4; padding: 24px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #bbf7d0; }}
        .header h1 {{ font-size: 26px; font-weight: 800; color: {accent}; }}
        .header .role {{ font-size: 14px; color: #064e3b; font-weight: 600; background: {accent}15; display: inline-block; padding: 2px 10px; border-radius: 4px; margin-top: 4px; }}
        .header .contact {{ font-size: 12px; color: #64748b; margin-top: 8px; }}
        .header .contact a {{ color: {accent}; text-decoration: none; font-weight: 600; }}
        .summary {{ font-size: 14px; color: #475569; margin-bottom: 22px; padding: 12px 16px; background: #f8fafc; border-radius: 6px; }}
        .section {{ margin-bottom: 20px; }}
        .section h2 {{ font-size: 14px; font-weight: 700; color: #fff; background: {accent}; display: inline-block; padding: 4px 14px; border-radius: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }}
        .section-item {{ margin-bottom: 14px; padding: 10px 14px; background: #fafafa; border-radius: 6px; border: 1px solid #f1f5f9; }}
        .item-header {{ display: flex; justify-content: space-between; align-items: baseline; }}
        .item-header strong {{ font-size: 14px; }}
        .item-date {{ font-size: 12px; color: #94a3b8; font-weight: 500; background: #f1f5f9; padding: 1px 8px; border-radius: 3px; }}
        .item-sub {{ font-size: 13px; color: #64748b; margin-bottom: 4px; }}
        .item-tech {{ font-size: 12px; color: {accent}; font-weight: 600; font-family: 'Consolas', 'Courier New', monospace; }}
        ul {{ padding-left: 18px; font-size: 13px; color: #334155; }}
        li {{ margin-bottom: 3px; }}
        p {{ font-size: 13px; color: #334155; }}
        .skills-wrap {{ display: flex; flex-wrap: wrap; gap: 6px; }}
        .skill-tag {{ display: inline-block; padding: 4px 10px; background: #ecfdf5; color: #065f46; border-radius: 4px; font-size: 12px; font-weight: 600; font-family: 'Consolas', 'Courier New', monospace; border: 1px solid #bbf7d0; }}
        @media print {{ body {{ background: #fff; }} .resume {{ padding: 20px; }} }}
        """
    else:  # classic
        css = f"""
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.6; background: #fff; }}
        .resume {{ max-width: 800px; margin: 0 auto; padding: 40px; }}
        .header {{ text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid {accent}; }}
        .header h1 {{ font-size: 28px; color: {accent}; margin-bottom: 4px; }}
        .header .role {{ font-size: 14px; color: #64748b; }}
        .header .contact {{ font-size: 13px; color: #64748b; }}
        .header .contact a {{ color: {accent}; text-decoration: none; }}
        .summary {{ font-size: 14px; color: #475569; margin-bottom: 20px; text-align: center; }}
        .section {{ margin-bottom: 20px; }}
        .section h2 {{ font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: {accent}; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px; }}
        .section-item {{ margin-bottom: 12px; }}
        .item-header {{ display: flex; justify-content: space-between; align-items: baseline; }}
        .item-header strong {{ font-size: 15px; }}
        .item-date {{ font-size: 13px; color: #64748b; }}
        .item-sub {{ font-size: 14px; color: #475569; margin-bottom: 4px; }}
        .item-tech {{ font-size: 12px; color: {accent}; }}
        ul {{ padding-left: 18px; font-size: 14px; color: #334155; }}
        li {{ margin-bottom: 3px; }}
        p {{ font-size: 14px; color: #334155; }}
        .skills-wrap {{ display: flex; flex-wrap: wrap; gap: 6px; }}
        .skill-tag {{ display: inline-block; padding: 3px 10px; background: #f1f5f9; border-radius: 4px; font-size: 13px; color: #334155; }}
        @media print {{ body {{ background: #fff; }} .resume {{ padding: 20px; }} }}
        """

    role_html = f"<div class='role'>{data.target_role}</div>" if data.target_role else ""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{data.full_name} - Resume</title>
<style>{css}</style>
</head>
<body>
<div class="resume">
  <div class="header">
    <h1>{data.full_name}</h1>
    {role_html}
    <div class="contact">{contact_html}</div>
  </div>
  {sections}
</div>
</body>
</html>"""
    return html


# ── Helper methods removed, using universal db_utils ──


def _calculate_ats_score(data: ResumeBuilderRequest, domain: str = "Software Engineering / CS / IT") -> int:
    """Deterministic ATS score based on resume completeness and domain quality."""
    score = 0
    domain_data = get_domain_knowledge(domain)
    
    # ── Domain Keyword Bonus (max 10) ──
    core_skills = {s.lower() for s in domain_data["core_skills"]}
    tools = {t.lower() for t in domain_data["tools"]}
    user_skills_lower = {s.lower() for s in data.skills}
    
    matched_core = len(user_skills_lower.intersection(core_skills))
    matched_tools = len(user_skills_lower.intersection(tools))
    domain_bonus = min(10, (matched_core * 2) + (matched_tools * 2))
    score += domain_bonus

    # Contact info (max 15)
    if data.full_name:
        score += 5
    if data.email:
        score += 5
    if data.phone:
        score += 3
    if data.linkedin:
        score += 2

    # Summary (max 12)
    if data.summary:
        words = len(data.summary.split())
        if words >= 30:
            score += 12
        elif words >= 15:
            score += 8
        else:
            score += 4

    # Skills (max 15)
    skill_count = len(data.skills)
    if skill_count >= 8:
        score += 15
    elif skill_count >= 5:
        score += 12
    elif skill_count >= 3:
        score += 8
    elif skill_count >= 1:
        score += 4

    # Experience (max 30)
    for exp in data.experience[:3]:  # cap at 3 entries
        title_pts = 2 if exp.get("title") else 0
        company_pts = 2 if exp.get("company") else 0
        duration_pts = 1 if exp.get("duration") else 0
        score += title_pts + company_pts + duration_pts

        points = [p for p in exp.get("points", []) if p.strip()]
        for pt in points[:4]:  # cap at 4 bullets per entry
            words = pt.lower().split()
            # Action verb start?
            if words and words[0] in ACTION_VERBS:
                score += 1
            # Quantified?
            if any(c.isdigit() for c in pt):
                score += 1
            # Sufficient length?
            if len(words) >= 8:
                score += 0.5

    # Education (max 10)
    for edu in data.education[:2]:
        if edu.get("degree"):
            score += 3
        if edu.get("institution"):
            score += 1.5
        if edu.get("year"):
            score += 0.5

    # Projects (max 10)
    for proj in data.projects[:3]:
        if proj.get("name"):
            score += 1.5
        if proj.get("description") and len(proj["description"].split()) >= 10:
            score += 1.5
        if proj.get("tech"):
            score += 0.5

    # Target role (max 3)
    if data.target_role:
        score += 3

    # Template selection bonus (max 5 — all templates are ATS-friendly)
    score += 5

    return max(0, min(100, int(score)))


@router.post("/build", response_model=ResumeBuilderResponse)
async def build_resume(request: ResumeBuilderRequest, user = Depends(get_current_user)):
    """Generate an ATS-friendly resume from user data."""
    
    domain = "Software Engineering / CS / IT"
    from db.supabase_client import supabase
    if supabase:
        try:
            profile = supabase.table("profiles").select("domain").eq("id", str(user.id)).maybe_single().execute()
            if profile.data and profile.data.get("domain"):
                domain = profile.data["domain"]
        except Exception:
            pass

    html = generate_resume_html(request)
    score = _calculate_ats_score(request, domain)

    # ── Build personalized tips ──
    tips = [
        "Use standard section headings (Experience, Education, Skills).",
        "Save as PDF to preserve formatting across systems.",
    ]
    if not request.summary:
        tips.append("Add a professional summary — resumes with summaries rank higher in ATS.")
    if len(request.skills) < 5:
        tips.append("Add more skills — aim for 8–12 relevant skills matching the job description.")
    if not request.linkedin:
        tips.append("Add your LinkedIn URL — most recruiters check LinkedIn profiles.")
    exp_points = [p for e in request.experience for p in e.get("points", []) if p.strip()]
    has_numbers = any(any(c.isdigit() for c in p) for p in exp_points)
    if not has_numbers and exp_points:
        tips.append("Quantify achievements with numbers (e.g., 'Reduced load time by 40%').")
    if len(request.experience) == 0:
        tips.append("Add work experience or internships to strengthen your resume.")
    if len(request.projects) == 0:
        tips.append("Add projects to showcase your practical skills.")
    tips.append("Include exact keywords from the job description in your skills and bullet points.")

    # ── Save to Supabase ──
    save_to_supabase("resume_builds", {
        "user_id": str(user.id),
        "full_name": request.full_name,
        "email": request.email,
        "target_role": request.target_role,
        "template": request.template,
        "ats_score_estimate": score,
        "resume_data": request.model_dump(),
    })
    save_to_supabase("activity_log", {
        "user_id": str(user.id),
        "activity_type": "resume_build",
        "action": f"Resume built for {request.target_role or 'General'} — ATS estimate: {score}/100",
        "metadata": {"score": score, "template": request.template, "name": request.full_name},
    })

    return ResumeBuilderResponse(
        html=html,
        template=request.template,
        ats_tips=tips,
        ats_score_estimate=score,
    )


@router.get("/templates")
async def get_templates():
    return {"templates": [{**v, "id": k} for k, v in TEMPLATES.items()]}


class ResumeAnalysis(BaseModel):
    overall_score: int
    sections: dict
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    ats_score: int
    keyword_match: int

def extract_text(file: UploadFile, contents: bytes) -> str:
    if file.filename.endswith(".docx"):
        doc = Document(io.BytesIO(contents))
        return "\n".join([p.text for p in doc.paragraphs])
    elif file.filename.endswith(".pdf"):
        text = ""
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    else:
        return contents.decode(errors="ignore")


def _normalize_text(text: str) -> str:
    """Collapse whitespace and strip for cleaner LLM input."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


@router.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume(file: UploadFile = File(...), user = Depends(get_current_user)):
    # Validate file type
    if not file.filename:
        raise HTTPException(400, "No filename provided")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("pdf", "docx", "txt"):
        raise HTTPException(400, f"Unsupported file type: .{ext}. Upload PDF, DOCX, or TXT.")

    contents = await file.read()

    # Validate file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB.")

    raw_text = extract_text(file, contents)
    text = _normalize_text(raw_text)[:4000]

    if len(text.split()) < 20:
        raise HTTPException(422, "Resume text is too short. Please upload a valid resume document.")

    # ── Fetch User Domain ──
    domain = "Software Engineering / CS / IT"
    from db.supabase_client import supabase
    if supabase:
        try:
            profile = supabase.table("profiles").select("domain").eq("id", str(user.id)).maybe_single().execute()
            if profile.data and profile.data.get("domain"):
                domain = profile.data["domain"]
        except Exception:
            pass

    # ── 1. Check Cache ──
    import hashlib
    text_hash = hashlib.md5((text + domain).encode('utf-8')).hexdigest()
    
    from db.supabase_client import supabase
    if supabase:
        try:
            recent_analyses = (
                supabase.table("resume_analyses")
                .select("*")
                .eq("user_id", str(user.id))
                .eq("analysis_type", "full")
                .order("created_at", desc=True)
                .limit(20)
                .execute()
            )
            for row in (recent_analyses.data or []):
                raw = row.get("raw_result") or {}
                if raw.get("file_hash") == text_hash:
                    print(f"[Resume] Serving cached analysis for hash {text_hash}")
                    return raw
        except Exception as e:
            print(f"[Resume] Cache check failed: {e}")

    # ── 2. Generate New Analysis ──
    domain_data = get_domain_knowledge(domain)
    domain_name = domain_data["name"]

    prompt = f"""Analyze this resume as an expert ATS (Applicant Tracking System) evaluator specifically for the {domain_name} engineering domain.

You MUST return a JSON object with EXACTLY this schema — no extra keys, no missing keys:

{{
  "overall_score": <integer 0-100>,
  "sections": {{
    "experience": {{"score": <integer 0-100>, "feedback": "<1-2 sentence feedback>"}},
    "skills": {{"score": <integer 0-100>, "feedback": "<1-2 sentence feedback>"}},
    "education": {{"score": <integer 0-100>, "feedback": "<1-2 sentence feedback>"}},
    "formatting": {{"score": <integer 0-100>, "feedback": "<1-2 sentence feedback>"}}
  }},
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>", "<actionable suggestion 4>"],
  "ats_score": <integer 0-100>,
  "keyword_match": <integer 0-100>
}}

Scoring criteria:
- overall_score: weighted average of all section scores
- ats_score: how well this would pass automated ATS parsing (keyword density, standard headings, formatting)
- keyword_match: estimated match against core {domain_name} industry requirements and tools
- experience: action verbs, quantified accomplishments, clarity, relevance to {domain_name}
- skills: number and relevance of technical tools uniquely associated with {domain_name}
- education: completeness and relevance
- formatting: ATS-friendly structure, standard headings, clean layout

Be honest and specific. Each suggestion must be actionable.

Resume text:
{text}"""

    fallback = {
        "overall_score": 65,
        "sections": {
            "experience": {"score": 65, "feedback": "Experience section could benefit from more quantified achievements and stronger action verbs."},
            "skills": {"score": 65, "feedback": "Consider adding more relevant technical skills matching your target role."},
            "education": {"score": 75, "feedback": "Education section is adequate."},
            "formatting": {"score": 70, "feedback": "Consider using more standard section headings for better ATS compatibility."},
        },
        "strengths": ["Resume content is present", "Readable format"],
        "weaknesses": ["Insufficient quantified metrics", "Skills section could be expanded"],
        "suggestions": [
            "Add numbers to bullet points (e.g., 'Reduced load time by 40%')",
            "Use strong action verbs at the start of each bullet point",
            "Add a professional summary at the top of your resume",
            "Include keywords from the target job description",
        ],
        "ats_score": 65,
        "keyword_match": 55,
    }

    result = call_llm_json(prompt, fallback=fallback)

    # Ensure required fields exist with safe defaults
    result.setdefault("overall_score", 65)
    result.setdefault("ats_score", 65)
    result.setdefault("keyword_match", 55)
    result.setdefault("sections", fallback["sections"])
    result.setdefault("strengths", fallback["strengths"])
    result.setdefault("weaknesses", fallback["weaknesses"])
    result.setdefault("suggestions", fallback["suggestions"])

    # Ensure sections dict has all required keys
    for key in ("experience", "skills", "education", "formatting"):
        if key not in result["sections"]:
            result["sections"][key] = fallback["sections"].get(key, {"score": 65, "feedback": "No data available."})

    # Add hash to result for future caching
    result["file_hash"] = text_hash
    result["extracted_text"] = text

    # ── Save to Supabase ──
    save_to_supabase("resume_analyses", {
        "user_id": str(user.id),
        "analysis_type": "full",
        "overall_score": result.get("overall_score"),
        "ats_score": result.get("ats_score"),
        "keyword_match": result.get("keyword_match"),
        "sections": result.get("sections", {}),
        "strengths": result.get("strengths", []),
        "weaknesses": result.get("weaknesses", []),
        "suggestions": result.get("suggestions", []),
        "raw_result": result,
    })

    save_to_supabase("activity_log", {
        "user_id": str(user.id),
        "activity_type": "resume",
        "action": f"Resume analyzed — Score: {result.get('overall_score', 0)}/100",
        "metadata": {"overall_score": result.get("overall_score"), "ats_score": result.get("ats_score")},
    })

    return result
