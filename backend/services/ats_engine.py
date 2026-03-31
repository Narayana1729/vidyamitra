import re
from typing import Dict, Any

from services.skillgap_engine import ROLE_SKILLS

def get_role_skills(role: str) -> dict:
    return ROLE_SKILLS.get(role, ROLE_SKILLS.get("full_stack_developer", {"required": [], "nice_to_have": []}))

# Common action verbs expected in strong resumes
ACTION_VERBS = {
    "achieved", "improved", "trained", "mentored", "managed", "created", 
    "resolved", "lead", "led", "developed", "designed", "built", "implemented", 
    "spearheaded", "orchestrated", "optimized", "increased", "decreased", "saved",
    "launched", "delivered", "architected", "engineered", "scaled", "automated"
}

def analyze_bullet_point(bullet: str) -> dict:
    """Analyze a single bullet point for ATS best practices."""
    bullet_clean = bullet.strip()
    words = bullet_clean.lower().split()
    
    # Check for action verb at start (allowing for some punctuation/bullets)
    has_action_verb = False
    if words:
        first_word = re.sub(r'[^a-zA-Z]', '', words[0])
        has_action_verb = first_word in ACTION_VERBS

    # Check for metrics (numbers, percentages, dollars)
    has_metrics = bool(re.search(r'\d+%?|\$\d+', bullet_clean))
    
    return {
        "length": len(bullet_clean),
        "has_action_verb": has_action_verb,
        "has_metrics": has_metrics,
    }

def score_resume(data: Any) -> dict:
    """
    Deterministically score a resume and generate strengths/weaknesses.
    Replaces the LLM hallucinator.
    
    Expects data matching routers.resume_score.ScoreInput
    """
    total_score = 0
    max_score = 100
    
    strengths = []
    weaknesses = []
    
    # ── 1. Contact Information (15 pts) ──
    contact_score = 0
    if data.email: contact_score += 5
    if data.phone: contact_score += 5
    if getattr(data, 'linkedin', None) or getattr(data, 'github', None) or getattr(data, 'portfolio', None): 
        contact_score += 5
        
    total_score += contact_score
    if contact_score == 15:
        strengths.append("Strong contact information section with professional links")
    else:
        weaknesses.append("Missing crucial contact info (Phone, Email, or Professional Links)")

    # ── 2. Summary (10 pts) ──
    if getattr(data, 'summary', None):
        summary_len = len(data.summary)
        if 100 <= summary_len <= 500:
            total_score += 10
            strengths.append("Professional summary is concise and optimal length")
        else:
            total_score += 5
            weaknesses.append("Summary should be between 100-500 characters for optimal ATS parsing")
    else:
        weaknesses.append("Missing a professional summary section")

    # ── 3. Skills Match (25 pts) ──
    if getattr(data, 'skills', None):
        target_role = getattr(data, 'target_role', '').lower().replace(" ", "_")
        role_reqs = get_role_skills(target_role) if target_role else {"required": [], "nice_to_have": []}
        
        req_set = {s.lower() for s in role_reqs.get('required', [])}
        user_skills_lower = {s.lower() for s in data.skills}
        
        if req_set:
            overlap = req_set.intersection(user_skills_lower)
            match_pct = len(overlap) / len(req_set)
            skill_score = min(25, int(match_pct * 25) + 5) # Base 5 points just for having skills
            total_score += skill_score
            
            if match_pct > 0.7:
                strengths.append(f"Excellent keyword match ({int(match_pct*100)}%) against typical {data.target_role} requirements")
            elif match_pct < 0.4:
                missing_set = req_set - user_skills_lower
                missing_list = []
                for ms in missing_set:
                    missing_list.append(str(ms))
                    if len(missing_list) == 3:
                        break
                suggestions = ", ".join(missing_list)
                weaknesses.append(f"Missing core skills for {data.target_role}. Try adding: {suggestions}")
        else:
            # Generic fallback if role unknown
            skill_count = len(data.skills)
            score_addition = min(25, skill_count * 2)
            total_score += score_addition
            if skill_count >= 8:
                strengths.append("Healthy amount of technical/hard skills listed")
    else:
        weaknesses.append("No skills section detected. ATS scanners heavily rely on this.")

    # ── 4. Experience Impact (35 pts) ──
    experience = getattr(data, 'experience', [])
    if experience:
        exp_score = 0
        total_bullets = 0
        metrics_count = 0
        action_verbs_count = 0
        
        for exp in experience:
            desc = exp.get("description", "")
            bullets = [b for b in desc.split('\\n') if b.strip()] if desc else []
            
            for b in bullets:
                total_bullets += 1
                stats = analyze_bullet_point(b)
                if stats["has_metrics"]: metrics_count += 1
                if stats["has_action_verb"]: action_verbs_count += 1
        
        # Scoring logic
        if total_bullets > 0:
            metrics_ratio = metrics_count / total_bullets
            verbs_ratio = action_verbs_count / total_bullets
            
            # Up to 20 pts for metrics, 15 pts for action verbs
            exp_score += min(20, int(metrics_ratio * 40)) 
            exp_score += min(15, int(verbs_ratio * 20))
            
            total_score += exp_score
            
            if metrics_ratio >= 0.3:
                strengths.append(f"Strong use of quantifiable metrics in experience ({metrics_count} instances)")
            else:
                weaknesses.append("Experience bullets lack metrics (numbers/$/%). Add quantifiable results to stand out.")
                
            if verbs_ratio >= 0.7:
                strengths.append("Excellent use of strong action verbs to start bullet points")
            elif verbs_ratio < 0.4:
                weaknesses.append("Start more experience bullets with strong action verbs (e.g., 'Spearheaded', 'Optimized')")
    else:
        weaknesses.append("No experience section found. This hurts ATS scoring significantly.")

    # ── 5. Projects & Education (15 pts) ──
    edu_score = 0
    if getattr(data, 'education', []):
        edu_score += 5
    else:
        weaknesses.append("Missing education section")
        
    proj_score = 0
    if getattr(data, 'projects', []):
        proj_score += 10
        strengths.append("Projects section adds great practical evidence of skills")
    
    total_score += (edu_score + proj_score)

    # ── Final adjustments ──
    # Ensure min/max boundaries
    total_score = max(0, min(100, total_score))
    
    # Guarantee at least some feedback
    if not strengths: strengths.append("Template is parseable")
    if not weaknesses and total_score < 100: weaknesses.append("Keep refining bullets for maximum impact")
    
    # Sort weaknesses by importance (metrics and skills usually most important, but we just reverse to put generic last)
    
    return {
        "score": total_score,
        "strengths": [s for i, s in enumerate(strengths) if i < 4], # Keep top 4
        "weaknesses": [w for i, w in enumerate(weaknesses) if i < 4]
    }
