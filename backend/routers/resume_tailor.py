"""
Resume Tailor — AI-powered resume formatting for specific companies.

Adjusts template, section order, summary tone, and keyword emphasis
based on the target company / job description. Content stays untouched.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from routers.auth import get_current_user
from routers.resume import generate_resume_html, ResumeBuilderRequest, TEMPLATES
from utils.llm_utils import call_llm_json
from utils.db_utils import save_to_supabase

router = APIRouter()


# ── Request / Response Models ────────────────────────────────

class TailorRequest(BaseModel):
    """Student's resume data + target company info."""
    # Resume data (same fields as ResumeBuilderRequest)
    full_name: str
    email: str
    phone: str
    linkedin: str = ""
    summary: str = ""
    target_role: str = ""
    skills: list[str] = []
    experience: list[dict] = []
    education: list[dict] = []
    projects: list[dict] = []
    template: str = "classic"

    # Company / Job targeting
    company_name: str
    job_title: str = ""
    job_description: str = ""


class TailorResponse(BaseModel):
    original_html: str
    tailored_html: str
    changes: dict  # what was adjusted and why
    recommended_template: str
    tailored_summary: str
    section_order: list[str]
    keyword_highlights: list[str]


# ── Section re-ordering helper ───────────────────────────────

def _generate_reordered_html(data: ResumeBuilderRequest, section_order: list[str]) -> str:
    """
    Re-render the resume HTML with sections in the given order.
    Re-uses the existing generate_resume_html but injects custom section ordering.
    """
    from routers.resume import TEMPLATES
    import re as _re

    # Generate the base HTML with the (possibly new) template
    base_html = generate_resume_html(data)

    # Extract individual sections from the generated HTML
    # Sections are wrapped in <div class='section'><h2>SectionName</h2>...</div>
    section_pattern = r"(<div class='section'>\s*<h2>(.*?)</h2>.*?</div>(?:\s*</div>)?)"

    # Simpler approach: rebuild sections HTML in the requested order
    # Build each section's HTML independently
    sections_map = {}

    # Skills
    if data.skills:
        skills_html = "".join(f'<span class="skill-tag">{s}</span>' for s in data.skills)
        sections_map["skills"] = f"<div class='section'><h2>Skills</h2><div class='skills-wrap'>{skills_html}</div></div>"

    # Experience
    if data.experience:
        exp_html = ""
        for exp in data.experience:
            points = "".join(f"<li>{p}</li>" for p in exp.get("points", []) if p.strip())
            exp_html += f"""
            <div class="section-item">
                <div class="item-header">
                    <strong>{exp.get('title', '')}</strong>
                    <span class="item-date">{exp.get('duration', '')}</span>
                </div>
                <div class="item-sub">{exp.get('company', '')}</div>
                {"<ul>" + points + "</ul>" if points else ""}
            </div>"""
        sections_map["experience"] = f"<div class='section'><h2>Experience</h2>{exp_html}</div>"

    # Education
    if data.education:
        edu_html = ""
        for edu in data.education:
            edu_html += f"""
            <div class="section-item">
                <div class="item-header">
                    <strong>{edu.get('degree', '')}</strong>
                    <span class="item-date">{edu.get('year', '')}</span>
                </div>
                <div class="item-sub">{edu.get('institution', '')}</div>
            </div>"""
        sections_map["education"] = f"<div class='section'><h2>Education</h2>{edu_html}</div>"

    # Projects
    if data.projects:
        proj_html = ""
        for proj in data.projects:
            proj_html += f"""
            <div class="section-item">
                <strong>{proj.get('name', '')}</strong>
                {"<span class='item-tech'>" + proj.get('tech', '') + "</span>" if proj.get('tech') else ""}
                <p>{proj.get('description', '')}</p>
            </div>"""
        sections_map["projects"] = f"<div class='section'><h2>Projects</h2>{proj_html}</div>"

    # Build sections in the requested order
    ordered_sections = ""
    for section_name in section_order:
        key = section_name.lower().strip()
        if key in sections_map:
            ordered_sections += sections_map[key]

    # Add any sections not mentioned in the order (safety net)
    for key, html in sections_map.items():
        if key not in [s.lower().strip() for s in section_order]:
            ordered_sections += html

    # Now reconstruct the full HTML
    # Get the CSS + header from the base template
    tmpl = TEMPLATES.get(data.template, TEMPLATES["classic"])
    accent = tmpl["accent"]

    # Re-use generate_resume_html but replace the sections portion
    # Extract everything before and after sections from base_html
    summary_html = f"<div class='summary'>{data.summary}</div>" if data.summary else ""
    contact_parts = [data.email, data.phone]
    if data.linkedin:
        contact_parts.append(f'<a href="{data.linkedin}">LinkedIn</a>')
    contact_html = " &bull; ".join(contact_parts)
    role_html = f"<div class='role'>{data.target_role}</div>" if data.target_role else ""

    # Get just the CSS from the base HTML
    css_start = base_html.find("<style>") + 7
    css_end = base_html.find("</style>")
    css = base_html[css_start:css_end] if css_start > 6 and css_end > 0 else ""

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
  {summary_html}
  {ordered_sections}
</div>
</body>
</html>"""
    return html


# ── Main endpoint ────────────────────────────────────────────

@router.post("/tailor", response_model=TailorResponse)
async def tailor_resume(req: TailorRequest, user=Depends(get_current_user)):
    """
    Tailor a resume's presentation for a specific company.
    Keeps all content identical — adjusts template, section order,
    summary tone, and keyword emphasis based on company/job analysis.
    """

    if not req.company_name.strip():
        raise HTTPException(400, "Company name is required")

    # ── Step 1: Generate the original resume HTML ──
    original_data = ResumeBuilderRequest(
        full_name=req.full_name,
        email=req.email,
        phone=req.phone,
        linkedin=req.linkedin,
        summary=req.summary,
        target_role=req.target_role,
        skills=req.skills,
        experience=req.experience,
        education=req.education,
        projects=req.projects,
        template=req.template,
    )
    original_html = generate_resume_html(original_data)

    # ── Step 2: Check Company DB ──
    from data.company_profiles import get_company_profile
    company_data = get_company_profile(req.company_name)
    
    available_templates = list(TEMPLATES.keys())
    skills_str = ", ".join(req.skills) if req.skills else "None listed"
    
    if company_data:
        pref = company_data["resume_preferences"]
        prompt = f"""You are a resume formatting expert. A student is applying to {company_data['name']} ({company_data['industry']}).
We already KNOW this company's exact resume preferences. Your job is to generate the exact JSON applying these rules.

COMPANY KNOWN PREFERENCES:
- Target template: {pref['preferred_template']}
- Ideal section order: {pref['section_order']}
- Core values & keywords to emphasize: {pref['values_keywords']}
- Required tone: {pref['tone']}

STUDENT'S CURRENT RESUME:
- Skills: {skills_str}
- Target role: {req.target_role}
- Current summary: {req.summary[:200] if req.summary else "None"}
- Job Description: {req.job_description[:500] if req.job_description else "Not provided"}

Return STRICT JSON matching this schema:
{{
  "recommended_template": "{pref['preferred_template']}",
  "section_order": {pref['section_order']},
  "summary_rewrite": "<rewrite the summary to match the '{pref['tone']}' tone and include some values like {pref['values_keywords']}. Max 2 sentences. Ensure it reads naturally for a {req.target_role}.>",
  "keyword_highlights": ["<pick exactly 3-5 skills from the student's list that match the company's tech stack or job description>"],
  "formatting_notes": "Tailored for {company_data['name']}'s {company_data['culture']} culture. Adjusted section order and summary tone to match their preference for {pref['tone'].lower()}."
}}"""
    else:
        prompt = f"""You are a resume formatting expert. A student is applying to a specific company.
Your job is to recommend FORMATTING changes only — do NOT change their skills, experience, or achievements.

STUDENT'S CURRENT RESUME:
- Current template: {req.template}
- Skills: {skills_str}
- Target role: {req.target_role}
- Has summary: {"Yes" if req.summary else "No"}
- Current summary: {req.summary[:200] if req.summary else "None"}

TARGET COMPANY: {req.company_name}
JOB TITLE: {req.job_title or "Not specified"}
JOB DESCRIPTION: {req.job_description[:1000] if req.job_description else "Not provided"}

AVAILABLE TEMPLATES: {available_templates}
- "classic": Traditional single-column, serif headings, Fortune 500 style
- "modern": Contemporary with bold color accents, clean hierarchy
- "minimal": Whitespace-focused, centered, elegant, understated
- "technical": Skills-forward, tech-focused, two-tone, monospace code style

Return STRICT JSON matching this schema:
{{
  "recommended_template": "<one of: {', '.join(available_templates)}>",
  "section_order": ["<ordered list of: skills, experience, education, projects>"],
  "summary_rewrite": "<rewritten professional summary with same content but tone adjusted for this company culture. Max 2 sentences.>",
  "keyword_highlights": ["<skill1 to emphasize>", "<skill2 to emphasize>"],
  "formatting_notes": "<1-2 sentences explaining WHY these format changes suit this company>"
}}
"""

    fallback = {
        "recommended_template": company_data["resume_preferences"]["preferred_template"] if company_data else req.template,
        "section_order": company_data["resume_preferences"]["section_order"] if company_data else ["skills", "experience", "education", "projects"],
        "summary_rewrite": req.summary or f"Results-driven professional targeting {req.target_role} roles.",
        "keyword_highlights": req.skills[:5] if req.skills else [],
        "formatting_notes": f"Tailored format for {company_data['name'] if company_data else req.company_name}.",
    }

    llm_result = call_llm_json(prompt, fallback=fallback)

    # ── Step 3: Validate and sanitize LLM output ──
    rec_template = llm_result.get("recommended_template", req.template)
    if rec_template not in TEMPLATES:
        rec_template = req.template

    section_order = llm_result.get("section_order", ["skills", "experience", "education", "projects"])
    # Ensure valid section names
    valid_sections = {"skills", "experience", "education", "projects"}
    section_order = [s for s in section_order if s.lower().strip() in valid_sections]
    if not section_order:
        section_order = ["skills", "experience", "education", "projects"]

    summary_rewrite = llm_result.get("summary_rewrite", req.summary) or req.summary
    keyword_highlights = llm_result.get("keyword_highlights", [])
    # Only keep highlights that exist in the student's actual skills
    skills_lower = {s.lower() for s in req.skills}
    keyword_highlights = [k for k in keyword_highlights if k.lower() in skills_lower]

    formatting_notes = llm_result.get("formatting_notes", "Format adjusted for this company.")

    # ── Step 4: Generate the tailored resume HTML ──
    tailored_data = ResumeBuilderRequest(
        full_name=req.full_name,
        email=req.email,
        phone=req.phone,
        linkedin=req.linkedin,
        summary=summary_rewrite,
        target_role=req.target_role,
        skills=req.skills,  # unchanged
        experience=req.experience,  # unchanged
        education=req.education,  # unchanged
        projects=req.projects,  # unchanged
        template=rec_template,  # potentially changed
    )

    tailored_html = _generate_reordered_html(tailored_data, section_order)

    # ── Step 5: Build change summary ──
    changes = {
        "template_changed": rec_template != req.template,
        "original_template": req.template,
        "new_template": rec_template,
        "section_order": section_order,
        "summary_adjusted": summary_rewrite != req.summary,
        "keywords_emphasized": keyword_highlights,
        "explanation": formatting_notes,
    }

    # ── Step 6: Save to Supabase ──
    save_to_supabase("activity_log", {
        "user_id": str(user.id),
        "activity_type": "resume_tailor",
        "action": f"Resume tailored for {req.company_name} — Template: {rec_template}",
        "metadata": {
            "company": req.company_name,
            "job_title": req.job_title,
            "original_template": req.template,
            "tailored_template": rec_template,
            "section_order": section_order,
        },
    })

    return TailorResponse(
        original_html=original_html,
        tailored_html=tailored_html,
        changes=changes,
        recommended_template=rec_template,
        tailored_summary=summary_rewrite,
        section_order=section_order,
        keyword_highlights=keyword_highlights,
    )
