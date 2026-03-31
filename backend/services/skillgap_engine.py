"""
VidyaMitra — Production-Grade Skill Gap Analysis Engine
Architecture: Data Layer → Logic Layer → AI Layer (enhance only)

Reuses SKILL_GRAPH and ROLE_CONFIG from roadmap_engine for consistency.
"""

import hashlib
import json
import math
import os
import re
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ═══════════════════════════════════════════════════════════════════
# AI CLIENT
# ═══════════════════════════════════════════════════════════════════

_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
AI_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"


# ═══════════════════════════════════════════════════════════════════
# IMPORT SHARED DATA FROM ROADMAP ENGINE
# ═══════════════════════════════════════════════════════════════════

from services.roadmap_engine import SKILL_GRAPH, ROLE_CONFIG
from services.domain_knowledge import get_domain_knowledge, get_industry_benchmarks
from services.recommendations_engine import get_recommendations


# ═══════════════════════════════════════════════════════════════════
# ROLE SKILL REQUIREMENTS  (flattened for gap analysis)
# ═══════════════════════════════════════════════════════════════════

ROLE_SKILLS: dict[str, dict] = {
    # ── Software / IT Roles ──
    "frontend_developer": {
        "required": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git",
                     "Responsive Design", "REST APIs", "Testing", "Webpack/Vite"],
        "nice_to_have": ["Next.js", "GraphQL", "Tailwind CSS", "CI/CD", "Figma"],
    },
    "backend_developer": {
        "required": ["Python", "Node.js", "SQL", "REST APIs", "Git", "Docker",
                     "Authentication", "Database Design", "Testing", "Linux"],
        "nice_to_have": ["Kubernetes", "Message Queues", "GraphQL", "CI/CD", "Microservices"],
    },
    "data_scientist": {
        "required": ["Python", "Statistics", "Machine Learning", "SQL", "Pandas",
                     "NumPy", "Data Visualization", "Jupyter", "Git", "Linear Algebra"],
        "nice_to_have": ["Deep Learning", "NLP", "Apache Spark", "Cloud ML", "MLOps"],
    },
    "devops_engineer": {
        "required": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS/GCP/Azure",
                     "Terraform", "Git", "Scripting", "Monitoring", "Networking"],
        "nice_to_have": ["Ansible", "Service Mesh", "Security", "Helm", "GitOps"],
    },
    "mobile_developer": {
        "required": ["React Native", "JavaScript", "TypeScript", "Git", "REST APIs",
                     "State Management", "UI/UX", "Testing", "App Store Deployment",
                     "Performance Optimization"],
        "nice_to_have": ["Swift", "Kotlin", "Flutter", "GraphQL", "Firebase"],
    },
    "full_stack_developer": {
        "required": ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL",
                     "Git", "REST APIs", "Docker", "Testing"],
        "nice_to_have": ["TypeScript", "GraphQL", "CI/CD", "Cloud Services", "Redis"],
    },

    # ── ECE Roles ──
    "embedded_engineer": {
        "required": ["Digital Electronics", "Microcontrollers", "ARM", "I2C/SPI/UART",
                     "Embedded Systems", "Oscilloscopes", "RTOS", "Firmware"],
        "nice_to_have": ["PCB Design", "MATLAB", "Keil", "Computer Vision"],
    },
    "vlsi_engineer": {
        "required": ["Digital Electronics", "Verilog", "VHDL", "VLSI",
                     "FPGA Prototyping", "SystemVerilog", "Cadence"],
        "nice_to_have": ["ASIC Flow", "Static Timing Analysis", "MATLAB", "Signal Processing"],
    },
    "hardware_engineer": {
        "required": ["Analog Circuits", "Digital Electronics", "PCB Design",
                     "Schematic Capture", "Oscilloscopes", "Altium Designer"],
        "nice_to_have": ["Signal Integrity", "Mixed Signal", "KiCad", "LTspice"],
    },
    "telecom_engineer": {
        "required": ["Signal Processing", "Wireless Comms", "RF Design", "MATLAB",
                     "Analog Circuits", "5G / LTE"],
        "nice_to_have": ["Antenna Design", "Network Optimization", "Microwave Engineering", "Digital Filters"],
    },
    "dsp_engineer": {
        "required": ["Signal Processing", "MATLAB", "Digital Filters",
                     "Digital Electronics", "Simulink"],
        "nice_to_have": ["Audio/Video Processing", "FPGA Prototyping", "Computer Vision", "Verilog"],
    },

    # ── EEE Roles ──
    "power_engineer": {
        "required": ["Power Systems", "Circuits", "MATLAB", "Load Flow Analysis",
                     "Power Electronics", "ETAP"],
        "nice_to_have": ["PowerWorld", "Substation Design", "Smart Grids", "Homer"],
    },
    "control_engineer": {
        "required": ["Control Systems", "PLC", "PID Control", "MATLAB",
                     "Sensors", "SCADA"],
        "nice_to_have": ["DCS", "Automation", "Simulink", "Multisim"],
    },
    "renewable_engineer": {
        "required": ["Power Systems", "Power Electronics", "Solar PV",
                     "Wind Turbines", "Circuits", "Grid Integration"],
        "nice_to_have": ["Energy Storage", "Homer", "MATLAB", "Smart Grids"],
    },
    "electrical_designer": {
        "required": ["AutoCAD Electrical", "Circuits", "Panel Design",
                     "Lighting Design", "ETAP"],
        "nice_to_have": ["Revit MEP", "Dialux", "Power Systems"],
    },

    # ── Mechanical Roles ──
    "design_engineer": {
        "required": ["SolidWorks", "AutoCAD", "GD&T", "Material Science",
                     "Machine Design", "Mechanics", "ANSYS"],
        "nice_to_have": ["Prototyping", "DFM", "CATIA", "Fusion 360"],
    },
    "manufacturing_engineer": {
        "required": ["Manufacturing", "AutoCAD", "Quality Control",
                     "Root Cause Analysis", "Lean Six Sigma"],
        "nice_to_have": ["CAM", "PLC Programming", "Six Sigma", "SolidWorks"],
    },
    "robotics_engineer": {
        "required": ["Mechanics", "Kinematics", "ROS", "Python",
                     "Control Systems"],
        "nice_to_have": ["Mechatronics", "Computer Vision", "MATLAB", "Simulink"],
    },
    "thermal_engineer": {
        "required": ["Thermodynamics", "Heat Transfer", "Fluid Mechanics",
                     "ANSYS Fluent"],
        "nice_to_have": ["CFD", "HVAC Design", "MATLAB", "SolidWorks"],
    },
    "automotive_engineer": {
        "required": ["Machine Design", "Mechanics", "SolidWorks", "AutoCAD",
                     "Vehicle Dynamics"],
        "nice_to_have": ["EV Systems", "FEA", "CATIA", "Battery Design"],
    },

    # ── Civil Roles ──
    "structural_engineer": {
        "required": ["Structural Analysis", "AutoCAD", "Building Codes",
                     "Concrete Design", "Steel Design", "STAAD.Pro"],
        "nice_to_have": ["ETABS", "SAP2000", "Revit"],
    },
    "bim_engineer": {
        "required": ["Revit", "AutoCAD", "Clash Detection",
                     "Project Management", "Navisworks"],
        "nice_to_have": ["BIM 360", "AutoCAD 3D", "Dynamo", "Primavera"],
    },
    "construction_manager": {
        "required": ["Construction Planning", "Project Management",
                     "Cost Estimation", "Site Supervision", "Primavera"],
        "nice_to_have": ["MS Project", "Contract Management", "Quality Control"],
    },
    "geotechnical_engineer": {
        "required": ["Geotech", "Soil Mechanics", "Surveying",
                     "Site Investigation", "Foundation Design"],
        "nice_to_have": ["GeoStudio", "PLAXIS", "Retaining Walls", "AutoCAD"],
    },
    "transportation_engineer": {
        "required": ["Transportation", "AutoCAD", "Highway Design",
                     "Traffic Engineering", "Civil 3D"],
        "nice_to_have": ["Pavement Design", "VISSIM", "Synchro", "GIS / ArcGIS"],
    },
}


# ═══════════════════════════════════════════════════════════════════
# CACHE
# ═══════════════════════════════════════════════════════════════════

_cache: dict[str, dict] = {}


def _cache_key(role: str, skills: list[str], level: str) -> str:
    raw = f"skillgap|{role}|{'|'.join(sorted(s.lower() for s in skills))}|{level}"
    return hashlib.sha256(raw.encode()).hexdigest()


# ═══════════════════════════════════════════════════════════════════
# CORE ANALYSIS  (deterministic, no AI)
# ═══════════════════════════════════════════════════════════════════

def _weighted_match(
    user_skills: list[str],
    required: list[str],
    nice_to_have: list[str],
) -> tuple[int, list[str], list[dict]]:
    """
    Compute a complexity-weighted match percentage.
    Returns (match_pct, matched_list, missing_details).
    """
    user_lower = {s.lower() for s in user_skills}

    matched = []
    missing = []
    total_weight = 0
    matched_weight = 0

    for skill in required:
        info = SKILL_GRAPH.get(skill, {"complexity": 2})
        weight = info["complexity"]
        total_weight += weight

        if skill.lower() in user_lower:
            matched.append(skill)
            matched_weight += weight
        else:
            missing.append(skill)

    # Nice-to-have count for 30% of the bonus weight
    nice_matched = [s for s in nice_to_have if s.lower() in user_lower]

    # Match % — required skills are 85% of score, nice-to-have 15%
    req_pct = (matched_weight / max(total_weight, 1)) * 85
    nice_pct = (len(nice_matched) / max(len(nice_to_have), 1)) * 15
    match_pct = min(100, int(round(req_pct + nice_pct)))

    # Assign priority based on prerequisite depth + complexity
    missing_details = []
    for i, skill in enumerate(missing):
        info = SKILL_GRAPH.get(skill, {"complexity": 2, "category": "core"})
        prereqs = info.get("prerequisites", []) if isinstance(info, dict) else []
        # Skills with no unmet prereqs are more urgent
        unmet_prereqs = [p for p in prereqs if p.lower() not in user_lower and p in required]

        if info["complexity"] >= 3 and len(unmet_prereqs) == 0:
            priority = "critical"
        elif info["complexity"] >= 2 and len(unmet_prereqs) <= 1:
            priority = "high"
        else:
            priority = "medium"

        # Override: first 3 missing skills by natural order are at least "high"
        if i < 3 and priority == "medium":
            priority = "high"

        missing_details.append({
            "name": skill,
            "level": "missing",
            "priority": priority,
            "complexity": info["complexity"],
            "category": info.get("category", "core"),
            "description": f"Essential for {skill} — required for this role.",
        })

    # Sort: critical first, then high, then medium; within same priority, higher complexity first
    priority_order = {"critical": 0, "high": 1, "medium": 2}
    missing_details.sort(key=lambda d: (priority_order.get(d["priority"], 9), -d["complexity"]))

    return match_pct, matched, missing_details


# ═══════════════════════════════════════════════════════════════════
# AI ENRICHMENT  — single call for roadmap + plan + projects
# ═══════════════════════════════════════════════════════════════════

_SKILLGAP_AI_SYSTEM = """You are VidyaMitra's career advisor AI.
You receive a user's skill gap analysis: their target role, matched skills, and missing skills with priorities.

You MUST return a single JSON object with EXACTLY these 3 top-level keys:

1. "priority_roadmap": array of phase objects, each with:
   - "phase": phase number (1-based)
   - "title": short descriptive title
   - "skills": array of skill names to learn in this phase
   - "duration": estimated duration string (e.g. "2 weeks", "1 month")
   - "focus": 1-sentence description of what this phase focuses on

2. "learning_plan": object with:
   - "weekly_structure": array of 7 strings, one per day (Mon-Sun), each describing what to study
   - "daily_hours": recommended hours per day (number)
   - "milestones": array of 4-6 milestone strings with timeframes
   - "tips": array of 3-5 actionable tips

3. "project_suggestions": array of 3-5 project objects, each with:
   - "name": project name
   - "description": 2-3 sentence description
   - "skills_practiced": array of skill names this project covers
   - "difficulty": "beginner" | "intermediate" | "advanced"
   - "estimated_time": duration string (e.g. "1-2 weeks")

STRICT RULES:
- Only use skill names from the provided missing skills list
- Output MUST be valid JSON — no markdown, no explanation
- Projects must be realistic and buildable
- Daily hours should be 1-3 based on complexity"""


def _build_skillgap_prompt(
    target_role: str,
    matched_skills: list[str],
    missing_details: list[dict],
    level: str,
    domain: str,
) -> str:
    missing_summary = [
        {"name": m["name"], "priority": m["priority"], "complexity": m["complexity"]}
        for m in missing_details
    ]
    return f"""Engineering Domain: {domain}
Target Role: {target_role}
Experience Level: {level}
Skills User Has: {json.dumps(matched_skills)}
Missing Skills (prioritized): {json.dumps(missing_summary, indent=2)}

Generate the priority_roadmap, learning_plan, and project_suggestions as a single JSON object.
IMPORTANT: Your suggestions MUST be strictly relevant to the {domain} engineering branch. Do not suggest software framing (like building web apps) unless explicitly required. Build realistic hardware, physical, or specific domain engineering projects when applicable."""


def _extract_json(text: str) -> Optional[dict]:
    """Robustly extract JSON from LLM response."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None


# ── Domain-specific fallback project templates ──
_DOMAIN_PROJECT_TEMPLATES = {
    "ECE": [
        {"name": "IoT Sensor Network", "description": "Design and prototype an IoT sensor network using microcontrollers with I2C/SPI communication.", "difficulty": "beginner"},
        {"name": "FPGA-Based Signal Processor", "description": "Implement a digital filter on an FPGA using Verilog and verify it with real-world signals.", "difficulty": "intermediate"},
        {"name": "Embedded System with RTOS", "description": "Build a multi-tasked embedded application on ARM with RTOS, covering scheduling and inter-task communication.", "difficulty": "advanced"},
    ],
    "EEE": [
        {"name": "Solar PV System Simulator", "description": "Model and simulate a solar PV installation with MATLAB/Simulink, including inverter sizing and load analysis.", "difficulty": "beginner"},
        {"name": "PLC-Based Industrial Controller", "description": "Program a PLC to automate a process (conveyor, sorting) with sensor inputs and SCADA monitoring.", "difficulty": "intermediate"},
        {"name": "Microgrid Power Management", "description": "Design a microgrid integrating solar, battery storage, and grid power with load flow analysis in ETAP.", "difficulty": "advanced"},
    ],
    "Mechanical": [
        {"name": "CAD Assembly & Stress Analysis", "description": "Model a mechanical assembly in SolidWorks and perform FEA stress analysis in ANSYS to validate the design.", "difficulty": "beginner"},
        {"name": "CNC Manufacturing Process Plan", "description": "Create a complete manufacturing process plan including CAM toolpath generation and GD&T specification.", "difficulty": "intermediate"},
        {"name": "Thermal System CFD Study", "description": "Perform a CFD analysis of a heat exchanger or HVAC system using ANSYS Fluent with design optimization.", "difficulty": "advanced"},
    ],
    "Civil": [
        {"name": "Structural Analysis & Drawing", "description": "Analyze a multi-story frame in STAAD.Pro and produce detailed AutoCAD structural drawings.", "difficulty": "beginner"},
        {"name": "BIM Project Model", "description": "Create a full BIM model of a building in Revit with clash detection and Navisworks walkthrough.", "difficulty": "intermediate"},
        {"name": "Highway Alignment Design", "description": "Design a highway alignment with Civil 3D including grading, drainage, and pavement design.", "difficulty": "advanced"},
    ],
    "Software": [
        {"name": "Portfolio Web Application", "description": "Build a responsive portfolio website with modern frontend framework and deploy it.", "difficulty": "beginner"},
        {"name": "Full Stack Dashboard", "description": "Create a full-stack data dashboard with API backend, database, and interactive charts.", "difficulty": "intermediate"},
        {"name": "Open Source Dev Tool", "description": "Build or contribute to an open-source developer tool. Focus on real-world utility.", "difficulty": "advanced"},
    ],
}


def _detect_domain_key(target_role: str) -> str:
    """Detect which domain a role belongs to for fallback project selection."""
    role_lower = target_role.lower()
    ece_roles = ["embedded", "vlsi", "hardware", "telecom", "rf", "dsp"]
    eee_roles = ["power", "control", "renewable", "electrical"]
    mech_roles = ["design engineer", "manufacturing", "robotics", "thermal", "automotive", "mechanical"]
    civil_roles = ["structural", "bim", "construction", "geotechnical", "transportation", "civil"]
    for keyword in ece_roles:
        if keyword in role_lower:
            return "ECE"
    for keyword in eee_roles:
        if keyword in role_lower:
            return "EEE"
    for keyword in mech_roles:
        if keyword in role_lower:
            return "Mechanical"
    for keyword in civil_roles:
        if keyword in role_lower:
            return "Civil"
    return "Software"


def _fallback_enrichment(missing_details: list[dict], target_role: str) -> dict:
    """Deterministic fallback when AI fails. Domain-aware project suggestions."""
    # Group missing skills into phases of 2-3
    phases = []
    batch = []
    for m in missing_details:
        batch.append(m["name"])
        if len(batch) >= 3:
            phases.append(batch)
            batch = []
    if batch:
        phases.append(batch)

    priority_roadmap = []
    phase_labels = ["Foundation", "Core Skills", "Intermediate", "Advanced", "Mastery"]
    for i, skills in enumerate(phases):
        weeks = sum(SKILL_GRAPH.get(s, {"complexity": 2})["complexity"] for s in skills)
        priority_roadmap.append({
            "phase": i + 1,
            "title": phase_labels[min(i, len(phase_labels) - 1)],
            "skills": skills,
            "duration": f"{max(1, weeks)} weeks",
            "focus": f"Build competency in {', '.join(skills)}.",
        })

    all_missing = [m["name"] for m in missing_details]

    learning_plan = {
        "weekly_structure": [
            f"Monday: Study core concepts of {all_missing[0] if all_missing else 'fundamentals'}",
            "Tuesday: Practice exercises and hands-on lab work",
            "Wednesday: Build mini-project applying learned concepts",
            "Thursday: Study advanced patterns and edge cases",
            "Friday: Review, document learnings, and practice problems",
            "Saturday: Work on domain project",
            "Sunday: Review week's progress, plan next week",
        ],
        "daily_hours": 2,
        "milestones": [
            "Week 2: Complete foundational skill exercises",
            "Month 1: Build first domain project",
            "Month 2: Cover all critical-priority skills",
            "Month 3: Apply skills in a real-world project",
        ],
        "tips": [
            "Focus on one skill at a time — avoid context switching.",
            "Build projects that combine multiple skills for deeper learning.",
            "Join communities and forums specific to your engineering domain.",
            "Track progress daily to stay motivated.",
        ],
    }

    # Domain-aware project suggestions
    domain_key = _detect_domain_key(target_role)
    templates = _DOMAIN_PROJECT_TEMPLATES.get(domain_key, _DOMAIN_PROJECT_TEMPLATES["Software"])
    project_suggestions = []
    for tmpl in templates:
        project_suggestions.append({
            "name": tmpl["name"],
            "description": tmpl["description"],
            "skills_practiced": all_missing[:3] if all_missing else [],
            "difficulty": tmpl["difficulty"],
            "estimated_time": "1-2 weeks" if tmpl["difficulty"] == "beginner" else ("2-3 weeks" if tmpl["difficulty"] == "intermediate" else "3-4 weeks"),
        })

    return {
        "priority_roadmap": priority_roadmap,
        "learning_plan": learning_plan,
        "project_suggestions": project_suggestions,
    }


def _enrich_with_ai(
    target_role: str,
    matched_skills: list[str],
    missing_details: list[dict],
    level: str,
    domain: str,
    max_retries: int = 3,
) -> dict:
    """Call AI once to generate roadmap + plan + projects. Fallback on failure."""
    user_prompt = _build_skillgap_prompt(target_role, matched_skills, missing_details, level, domain)

    for attempt in range(max_retries):
        try:
            response = _client.chat.completions.create(
                model=AI_MODEL,
                messages=[
                    {"role": "system", "content": _SKILLGAP_AI_SYSTEM},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.4,
                max_tokens=4096,
            )
            raw = response.choices[0].message.content
            parsed = _extract_json(raw)
            if (
                parsed
                and isinstance(parsed, dict)
                and "priority_roadmap" in parsed
                and "learning_plan" in parsed
                and "project_suggestions" in parsed
            ):
                return _validate_enrichment(parsed, missing_details, target_role)
        except Exception as e:
            print(f"[SkillGapEngine] AI attempt {attempt + 1} failed: {e}")

    print("[SkillGapEngine] All AI retries exhausted, using fallback.")
    return _fallback_enrichment(missing_details, target_role)


# ═══════════════════════════════════════════════════════════════════
# VALIDATION LAYER
# ═══════════════════════════════════════════════════════════════════

def _validate_enrichment(data: dict, missing_details: list[dict], target_role: str) -> dict:
    """Sanitize AI output — replace bad/missing fields with fallback values."""
    fb = _fallback_enrichment(missing_details, target_role)

    # Validate priority_roadmap
    roadmap = data.get("priority_roadmap", [])
    if not isinstance(roadmap, list) or len(roadmap) == 0:
        roadmap = fb["priority_roadmap"]
    else:
        for i, phase in enumerate(roadmap):
            if not isinstance(phase, dict):
                roadmap[i] = fb["priority_roadmap"][min(i, len(fb["priority_roadmap"]) - 1)]
            else:
                phase.setdefault("phase", i + 1)
                phase.setdefault("title", f"Phase {i + 1}")
                phase.setdefault("skills", [])
                phase.setdefault("duration", "2 weeks")
                phase.setdefault("focus", "Build key competencies.")

    # Validate learning_plan
    plan = data.get("learning_plan", {})
    if not isinstance(plan, dict):
        plan = fb["learning_plan"]
    else:
        if not isinstance(plan.get("weekly_structure"), list) or len(plan["weekly_structure"]) < 7:
            plan["weekly_structure"] = fb["learning_plan"]["weekly_structure"]
        plan.setdefault("daily_hours", 2)
        if not isinstance(plan.get("milestones"), list) or len(plan["milestones"]) < 2:
            plan["milestones"] = fb["learning_plan"]["milestones"]
        if not isinstance(plan.get("tips"), list) or len(plan["tips"]) < 2:
            plan["tips"] = fb["learning_plan"]["tips"]

    # Validate project_suggestions
    projects = data.get("project_suggestions", [])
    if not isinstance(projects, list) or len(projects) == 0:
        projects = fb["project_suggestions"]
    else:
        valid_projects = []
        for p in projects:
            if isinstance(p, dict) and p.get("name") and p.get("description"):
                p.setdefault("skills_practiced", [])
                p.setdefault("difficulty", "intermediate")
                p.setdefault("estimated_time", "2 weeks")
                valid_projects.append(p)
        if not valid_projects:
            projects = fb["project_suggestions"]
        else:
            projects = valid_projects

    return {
        "priority_roadmap": roadmap,
        "learning_plan": plan,
        "project_suggestions": projects,
    }


# ═══════════════════════════════════════════════════════════════════
# MAIN ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════

def analyze_skill_gap(
    current_skills: list[str],
    target_role: str,
    experience_level: str = "Beginner",
    domain: str = "Software Engineering / CS / IT",
) -> dict:
    """
    Full pipeline: Match → Prioritize → AI Enrich → Validate → Output.
    Returns a JSON-ready dict with all 5 sections.
    """
    domain_data = get_domain_knowledge(domain)
    role_key = target_role.lower().replace(" ", "_")

    # ── Check cache ──
    ck = _cache_key(role_key, current_skills, experience_level + domain)
    if ck in _cache:
        cached = _cache[ck].copy()
        cached["cached"] = True
        return cached

    # ── 1. Get role requirements deterministically ──
    if role_key in ROLE_SKILLS:
        role_data = ROLE_SKILLS[role_key]
        required = role_data["required"]
        nice_to_have = role_data["nice_to_have"]
    else:
        # Fallback to domain's core skills and tools for non-IT branches
        required = domain_data["core_skills"]
        nice_to_have = domain_data["tools"]

    # ── 2. Compute weighted match ──
    match_pct, matched, missing_details = _weighted_match(
        current_skills, required, nice_to_have,
    )

    # ── 3. Get role display name ──
    role_names = {
        # Software / IT
        "frontend_developer": "Frontend Developer",
        "backend_developer": "Backend Developer",
        "data_scientist": "Data Scientist",
        "devops_engineer": "DevOps Engineer",
        "mobile_developer": "Mobile Developer",
        "full_stack_developer": "Full Stack Developer",
        # ECE
        "embedded_engineer": "Embedded Software Engineer",
        "vlsi_engineer": "VLSI Design Engineer",
        "hardware_engineer": "Hardware Design Engineer",
        "telecom_engineer": "Telecom / RF Engineer",
        "dsp_engineer": "DSP Engineer",
        # EEE
        "power_engineer": "Power Systems Engineer",
        "control_engineer": "Control Systems Engineer",
        "renewable_engineer": "Renewable Energy Engineer",
        "electrical_designer": "Electrical Design Engineer",
        # Mechanical
        "design_engineer": "Design Engineer",
        "manufacturing_engineer": "Manufacturing Engineer",
        "robotics_engineer": "Robotics Engineer",
        "thermal_engineer": "Thermal Engineer",
        "automotive_engineer": "Automotive Engineer",
        # Civil
        "structural_engineer": "Structural Engineer",
        "bim_engineer": "BIM Engineer",
        "construction_manager": "Construction Manager",
        "geotechnical_engineer": "Geotechnical Engineer",
        "transportation_engineer": "Transportation Engineer",
    }
    display_name = role_names.get(role_key, target_role)

    # ── 4. AI enrichment (roadmap + plan + projects) ──
    if missing_details:
        enrichment = _enrich_with_ai(
            display_name, matched, missing_details, experience_level, domain_data["name"]
        )
    else:
        # Perfect match — no enrichment needed
        enrichment = {
            "priority_roadmap": [],
            "learning_plan": {
                "weekly_structure": [
                    "Monday: Work on advanced topics and system design",
                    "Tuesday: Contribute to open-source projects",
                    "Wednesday: Practice coding challenges (LeetCode, HackerRank)",
                    "Thursday: Read tech blogs and research papers",
                    "Friday: Build side projects",
                    "Saturday: Network and mentor others",
                    "Sunday: Review and plan next week",
                ],
                "daily_hours": 1,
                "milestones": [
                    "Week 1: Set up advanced learning goals",
                    "Month 1: Complete a challenging side project",
                    "Month 2: Contribute to 2+ open-source projects",
                    "Month 3: Mentor a junior developer",
                ],
                "tips": [
                    "You have all required skills — focus on deepening expertise.",
                    "Consider learning nice-to-have skills for competitive advantage.",
                    "Build complex, production-grade projects to showcase mastery.",
                ],
            },
            "project_suggestions": [{
                "name": "Advanced Portfolio Project",
                "description": f"Build a comprehensive project showcasing your {display_name} expertise with production-grade architecture.",
                "skills_practiced": matched[:5],
                "difficulty": "advanced",
                "estimated_time": "3-4 weeks",
            }],
        }

    # ── 5. Get recommendations ──
    missing_skill_names = [m["name"] for m in missing_details]
    recs = get_recommendations(
        missing_skills=missing_skill_names,
        all_skills=current_skills,
        domain=domain,
    )

    # ── 6. Get industry benchmarks ──
    benchmarks = get_industry_benchmarks(domain)

    # ── 7. Assemble response ──
    result = {
        "target_role": display_name,
        "match_percentage": match_pct,
        "matched_skills": matched,
        "missing_skills": [
            {
                "name": m["name"],
                "level": m["level"],
                "priority": m["priority"],
                "description": m["description"],
            }
            for m in missing_details
        ],
        "priority_roadmap": enrichment["priority_roadmap"],
        "learning_plan": enrichment["learning_plan"],
        "project_suggestions": enrichment["project_suggestions"],
        "hackathon_recommendations": recs["hackathon_recommendations"],
        "certification_recommendations": recs["certification_recommendations"],
        "industry_benchmarks": benchmarks,
        "cached": False,
    }

    # ── 8. Cache it ──
    _cache[ck] = result

    return result
