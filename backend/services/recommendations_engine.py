"""
VidyaMitra — Hackathon & Certification Recommendation Engine
Maps missing skills + domain to relevant hackathons, certifications, and platforms.
"""

from typing import Optional

# ═══════════════════════════════════════════════════════════════════
# HACKATHON KNOWLEDGE BASE
# ═══════════════════════════════════════════════════════════════════

HACKATHONS = [
    {
        "name": "Smart India Hackathon (SIH)",
        "platform": "SIH Portal",
        "url": "https://sih.gov.in",
        "type": "National",
        "frequency": "Annual (Dec)",
        "skills": ["Python", "React", "Machine Learning", "IoT", "Cloud", "SQL", "Node.js", "Docker", "Embedded Systems"],
        "domains": ["Software", "ECE", "EEE", "Mechanical", "Civil"],
        "description": "India's biggest hackathon — 48hr problem-solving with government/industry mentors. Open to all engineering branches.",
        "team_size": "6 members",
    },
    {
        "name": "Devfolio Hackathons",
        "platform": "Devfolio",
        "url": "https://devfolio.co/hackathons",
        "type": "Online + Offline",
        "frequency": "Weekly",
        "skills": ["React", "JavaScript", "TypeScript", "Node.js", "Python", "Solidity", "REST APIs", "Git", "Docker"],
        "domains": ["Software"],
        "description": "India's largest hackathon platform — 100+ hackathons/year. Great for web/mobile/blockchain projects.",
        "team_size": "2-5 members",
    },
    {
        "name": "HackerEarth Challenges",
        "platform": "HackerEarth",
        "url": "https://www.hackerearth.com/challenges",
        "type": "Online",
        "frequency": "Monthly",
        "skills": ["Python", "Data Structures", "Algorithms", "Machine Learning", "SQL", "Java", "C++"],
        "domains": ["Software"],
        "description": "Coding challenges and innovation hackathons with prizes. Good for DSA + ML skills.",
        "team_size": "1-4 members",
    },
    {
        "name": "MLH (Major League Hacking)",
        "platform": "MLH",
        "url": "https://mlh.io/seasons/2025/events",
        "type": "Global",
        "frequency": "Weekly",
        "skills": ["Python", "JavaScript", "React", "Git", "Docker", "Cloud", "REST APIs", "TypeScript"],
        "domains": ["Software"],
        "description": "World's largest hackathon league — 200+ events globally. Excellent for portfolio building.",
        "team_size": "2-4 members",
    },
    {
        "name": "Google Solution Challenge",
        "platform": "Google Developers",
        "url": "https://developers.google.com/community/gdsc-solution-challenge",
        "type": "Global",
        "frequency": "Annual (Jan–Mar)",
        "skills": ["Flutter", "Firebase", "Machine Learning", "Cloud", "Python", "TensorFlow", "React"],
        "domains": ["Software"],
        "description": "Build solutions for UN SDGs using Google tech. Cash prizes + Google mentorship.",
        "team_size": "1-4 members",
    },
    {
        "name": "IEEE Xtreme",
        "platform": "IEEE",
        "url": "https://ieeextreme.org",
        "type": "Global",
        "frequency": "Annual (Oct)",
        "skills": ["Algorithms", "Data Structures", "Python", "C++", "Java", "Problem Solving"],
        "domains": ["Software", "ECE", "EEE"],
        "description": "24-hour global programming competition by IEEE. Tests algorithmic thinking under pressure.",
        "team_size": "3 members",
    },
    {
        "name": "BAJA SAE India",
        "platform": "SAE India",
        "url": "https://www.bajasaeindia.org",
        "type": "National",
        "frequency": "Annual",
        "skills": ["Machine Design", "SolidWorks", "AutoCAD", "Manufacturing", "Vehicle Dynamics", "ANSYS"],
        "domains": ["Mechanical"],
        "description": "Design and build an off-road vehicle from scratch. Premier competition for Mechanical students.",
        "team_size": "15-25 members",
    },
    {
        "name": "SAE Aero Design",
        "platform": "SAE International",
        "url": "https://www.saeaerodesign.com",
        "type": "International",
        "frequency": "Annual",
        "skills": ["Fluid Mechanics", "SolidWorks", "ANSYS", "Manufacturing", "Mechanics"],
        "domains": ["Mechanical"],
        "description": "Design, build, and fly a remote-controlled aircraft. Focus on aerodynamic design + lightweight materials.",
        "team_size": "10-20 members",
    },
    {
        "name": "Robocon India",
        "platform": "DD Robocon / ABU",
        "url": "https://www.dd-robocon.com",
        "type": "National → International",
        "frequency": "Annual",
        "skills": ["Embedded Systems", "Microcontrollers", "Control Systems", "Mechanics", "ROS", "Python", "Sensors"],
        "domains": ["ECE", "EEE", "Mechanical"],
        "description": "Asia-Pacific robotic competition. Build robots to perform tasks. Top teams represent India internationally.",
        "team_size": "10-15 members",
    },
    {
        "name": "Texas Instruments Innovation Challenge (TIIC)",
        "platform": "Texas Instruments",
        "url": "https://www.ti.com/innovation-challenge",
        "type": "National",
        "frequency": "Annual",
        "skills": ["Embedded Systems", "Microcontrollers", "Analog Circuits", "Signal Processing", "PCB Design", "Sensors"],
        "domains": ["ECE", "EEE"],
        "description": "Design innovative embedded solutions using TI hardware. Great for ECE/EEE students.",
        "team_size": "2-3 members",
    },
    {
        "name": "Smart Grid Hackathon",
        "platform": "POSOCO / Ministry of Power",
        "url": "https://posoco.in",
        "type": "National",
        "frequency": "Annual",
        "skills": ["Power Systems", "MATLAB", "ETAP", "Smart Grids", "Power Electronics", "Renewable Energy"],
        "domains": ["EEE"],
        "description": "Solve power grid challenges using data analytics and IoT. Specific to electrical engineering.",
        "team_size": "3-5 members",
    },
    {
        "name": "ASCE Concrete Canoe / Steel Bridge",
        "platform": "ASCE",
        "url": "https://www.asce.org/students",
        "type": "International",
        "frequency": "Annual",
        "skills": ["Structural Analysis", "Concrete Design", "Steel Design", "Construction Planning", "AutoCAD"],
        "domains": ["Civil"],
        "description": "Design and build a concrete canoe or steel bridge. Premier Civil engineering competition.",
        "team_size": "10-20 members",
    },
    {
        "name": "EYANTRA (IIT Bombay)",
        "platform": "IIT Bombay",
        "url": "https://portal.e-yantra.org",
        "type": "National",
        "frequency": "Annual (Sep–Mar)",
        "skills": ["Embedded Systems", "Microcontrollers", "ROS", "Python", "Sensors", "Control Systems"],
        "domains": ["ECE", "EEE", "Mechanical"],
        "description": "6-month robotics competition with mentorship. Free hardware kit provided. Great for learning embedded development.",
        "team_size": "2-4 members",
    },
    {
        "name": "Kaggle Competitions",
        "platform": "Kaggle",
        "url": "https://www.kaggle.com/competitions",
        "type": "Online",
        "frequency": "Ongoing",
        "skills": ["Machine Learning", "Python", "Pandas", "NumPy", "Deep Learning", "Data Visualization", "Statistics"],
        "domains": ["Software"],
        "description": "World's largest data science competition platform. Build ML models on real datasets for prizes and rankings.",
        "team_size": "1-5 members",
    },
    {
        "name": "Hackathon by Hack Club",
        "platform": "Hack Club",
        "url": "https://hackathons.hackclub.com",
        "type": "Global",
        "frequency": "Ongoing",
        "skills": ["JavaScript", "React", "Python", "Git", "HTML", "CSS"],
        "domains": ["Software"],
        "description": "Student-organized hackathons worldwide. Beginner-friendly with mentorship.",
        "team_size": "1-4 members",
    },
]

# ═══════════════════════════════════════════════════════════════════
# CERTIFICATION KNOWLEDGE BASE
# ═══════════════════════════════════════════════════════════════════

CERTIFICATIONS = [
    {
        "name": "AWS Cloud Practitioner",
        "provider": "Amazon Web Services",
        "url": "https://aws.amazon.com/certification/certified-cloud-practitioner",
        "cost": "Free (student) / $100",
        "difficulty": "Beginner",
        "duration": "4-6 weeks",
        "skills": ["Cloud", "AWS", "Networking", "Linux"],
        "domains": ["Software"],
        "description": "Entry-level AWS certification. Learn cloud fundamentals, pricing, security. Highly recognized in industry.",
    },
    {
        "name": "AWS Solutions Architect – Associate",
        "provider": "Amazon Web Services",
        "url": "https://aws.amazon.com/certification/certified-solutions-architect-associate",
        "cost": "$150",
        "difficulty": "Intermediate",
        "duration": "8-12 weeks",
        "skills": ["Cloud", "AWS", "System Design", "Networking", "Docker", "Kubernetes"],
        "domains": ["Software"],
        "description": "Most in-demand cloud certification globally. Design scalable, reliable AWS architectures.",
    },
    {
        "name": "Google Cloud Digital Leader",
        "provider": "Google Cloud",
        "url": "https://cloud.google.com/certification/cloud-digital-leader",
        "cost": "Free (student) / $99",
        "difficulty": "Beginner",
        "duration": "4-6 weeks",
        "skills": ["Cloud", "Machine Learning", "Data Visualization"],
        "domains": ["Software"],
        "description": "Google Cloud fundamentals. Covers core services, ML basics, and cloud strategy.",
    },
    {
        "name": "Google TensorFlow Developer",
        "provider": "Google / Coursera",
        "url": "https://www.tensorflow.org/certificate",
        "cost": "$100",
        "difficulty": "Intermediate",
        "duration": "8-10 weeks",
        "skills": ["Deep Learning", "TensorFlow", "Python", "Machine Learning", "NLP", "Computer Vision"],
        "domains": ["Software"],
        "description": "Official TensorFlow certification. Build and train neural networks for real-world applications.",
    },
    {
        "name": "Coursera — Machine Learning Specialization",
        "provider": "Coursera (Stanford / Andrew Ng)",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "cost": "Free (audit) / $49/mo",
        "difficulty": "Beginner",
        "duration": "12 weeks",
        "skills": ["Machine Learning", "Python", "Statistics", "NumPy", "Linear Algebra"],
        "domains": ["Software"],
        "description": "Gold standard ML course by Andrew Ng. Covers supervised/unsupervised learning, neural networks basics.",
    },
    {
        "name": "Meta Front-End Developer Certificate",
        "provider": "Coursera (Meta)",
        "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        "cost": "Free (audit) / $49/mo",
        "difficulty": "Beginner",
        "duration": "7 months",
        "skills": ["React", "JavaScript", "HTML", "CSS", "Git", "Testing", "Responsive Design"],
        "domains": ["Software"],
        "description": "Industry-recognized frontend certificate by Meta. Covers React, responsive design, and modern web development.",
    },
    {
        "name": "GitHub Foundations Certification",
        "provider": "GitHub",
        "url": "https://resources.github.com/learn/certifications",
        "cost": "Free",
        "difficulty": "Beginner",
        "duration": "2-3 weeks",
        "skills": ["Git", "CI/CD", "Testing"],
        "domains": ["Software"],
        "description": "Free certification covering Git workflows, GitHub Actions, and collaboration practices.",
    },
    {
        "name": "Docker Certified Associate",
        "provider": "Docker / Mirantis",
        "url": "https://training.mirantis.com/certification/dca-certification-exam",
        "cost": "$195",
        "difficulty": "Intermediate",
        "duration": "6-8 weeks",
        "skills": ["Docker", "Kubernetes", "Linux", "Networking", "CI/CD"],
        "domains": ["Software"],
        "description": "Industry standard for containerization skills. Covers Docker architecture, networking, orchestration.",
    },
    {
        "name": "NPTEL — Digital Circuits",
        "provider": "NPTEL (IIT)",
        "url": "https://nptel.ac.in",
        "cost": "Free (audit) / ₹1000 (exam)",
        "difficulty": "Intermediate",
        "duration": "12 weeks",
        "skills": ["Digital Electronics", "VLSI", "Verilog"],
        "domains": ["ECE"],
        "description": "IIT-taught digital circuits and VLSI course. NPTEL certificate recognized across Indian industry.",
    },
    {
        "name": "NPTEL — Embedded Systems Design",
        "provider": "NPTEL (IIT)",
        "url": "https://nptel.ac.in",
        "cost": "Free (audit) / ₹1000 (exam)",
        "difficulty": "Intermediate",
        "duration": "12 weeks",
        "skills": ["Embedded Systems", "Microcontrollers", "RTOS", "ARM", "Firmware"],
        "domains": ["ECE"],
        "description": "Comprehensive embedded systems course covering architectures, real-time OS, and firmware programming.",
    },
    {
        "name": "Cadence Certified — OrCAD / Virtuoso",
        "provider": "Cadence Design Systems",
        "url": "https://www.cadence.com/en_US/home/training.html",
        "cost": "$200-500",
        "difficulty": "Advanced",
        "duration": "8-12 weeks",
        "skills": ["VLSI", "Analog Circuits", "PCB Design", "Cadence"],
        "domains": ["ECE"],
        "description": "Industry-standard VLSI/PCB design tool certification. Highly valued for semiconductor roles.",
    },
    {
        "name": "NPTEL — Power Systems",
        "provider": "NPTEL (IIT)",
        "url": "https://nptel.ac.in",
        "cost": "Free (audit) / ₹1000 (exam)",
        "difficulty": "Intermediate",
        "duration": "12 weeks",
        "skills": ["Power Systems", "Power Electronics", "MATLAB", "Load Flow Analysis"],
        "domains": ["EEE"],
        "description": "Power systems analysis and design. Covers load flow, fault analysis, and protection systems.",
    },
    {
        "name": "Certified Energy Manager (CEM)",
        "provider": "AEE (Association of Energy Engineers)",
        "url": "https://www.aeecenter.org/certifications/cem",
        "cost": "$250-400",
        "difficulty": "Intermediate",
        "duration": "8-12 weeks",
        "skills": ["Power Systems", "Renewable Energy", "Smart Grids", "Energy Storage"],
        "domains": ["EEE"],
        "description": "Globally recognized energy management certification. Great for renewable energy career paths.",
    },
    {
        "name": "MATLAB Onramp & Simulink Cert",
        "provider": "MathWorks",
        "url": "https://matlabacademy.mathworks.com",
        "cost": "Free",
        "difficulty": "Beginner",
        "duration": "2-4 weeks",
        "skills": ["MATLAB", "Simulink", "Signal Processing", "Control Systems"],
        "domains": ["ECE", "EEE", "Mechanical"],
        "description": "Free official MATLAB/Simulink certification by MathWorks. Self-paced, covers fundamentals to advanced.",
    },
    {
        "name": "Certified SolidWorks Associate (CSWA)",
        "provider": "Dassault Systèmes",
        "url": "https://www.solidworks.com/certifications",
        "cost": "Free (students)",
        "difficulty": "Beginner",
        "duration": "4-6 weeks",
        "skills": ["SolidWorks", "Machine Design", "GD&T"],
        "domains": ["Mechanical"],
        "description": "Free for students! Official SolidWorks certification covering 3D modeling, assemblies, and drawings.",
    },
    {
        "name": "ANSYS Certified — Structural / Fluent",
        "provider": "ANSYS",
        "url": "https://www.ansys.com/academic/students",
        "cost": "Free (student tracks)",
        "difficulty": "Intermediate",
        "duration": "6-8 weeks",
        "skills": ["ANSYS", "ANSYS Fluent", "Heat Transfer", "Fluid Mechanics", "Structural Analysis"],
        "domains": ["Mechanical", "Civil"],
        "description": "ANSYS simulation certification. Free student tracks available. Covers FEA, CFD, and structural analysis.",
    },
    {
        "name": "AutoCAD Certified User",
        "provider": "Autodesk",
        "url": "https://www.autodesk.com/certification",
        "cost": "Free (students) / $75",
        "difficulty": "Beginner",
        "duration": "4-6 weeks",
        "skills": ["AutoCAD", "Revit"],
        "domains": ["Civil", "Mechanical"],
        "description": "Official Autodesk certification. Free for students through Autodesk Education. Essential for Civil + Mech.",
    },
    {
        "name": "Revit Architecture Certification",
        "provider": "Autodesk",
        "url": "https://www.autodesk.com/certification/revit",
        "cost": "Free (students) / $150",
        "difficulty": "Intermediate",
        "duration": "6-8 weeks",
        "skills": ["Revit", "BIM 360", "Clash Detection", "AutoCAD"],
        "domains": ["Civil"],
        "description": "BIM-focused certification for architects and civil engineers. Growing demand in construction industry.",
    },
    {
        "name": "STAAD.Pro Certification",
        "provider": "Bentley Systems",
        "url": "https://education.bentley.com",
        "cost": "Free (students)",
        "difficulty": "Intermediate",
        "duration": "6-8 weeks",
        "skills": ["STAAD.Pro", "Structural Analysis", "Concrete Design", "Steel Design", "Building Codes"],
        "domains": ["Civil"],
        "description": "Structural analysis and design certification. Free for students through Bentley Academic Program.",
    },
    {
        "name": "Primavera P6 Certification",
        "provider": "Oracle",
        "url": "https://education.oracle.com/primavera",
        "cost": "$245",
        "difficulty": "Intermediate",
        "duration": "4-6 weeks",
        "skills": ["Primavera", "Project Management", "Construction Planning", "Cost Estimation"],
        "domains": ["Civil"],
        "description": "Industry-standard project scheduling certification. Essential for construction management career paths.",
    },
]


# ═══════════════════════════════════════════════════════════════════
# MATCHING ENGINE
# ═══════════════════════════════════════════════════════════════════

def _skill_overlap(item_skills: list[str], target_skills: list[str]) -> int:
    """Count how many skills overlap (case-insensitive)."""
    item_lower = {s.lower() for s in item_skills}
    target_lower = {s.lower() for s in target_skills}
    return len(item_lower & target_lower)


def _domain_match(item_domains: list[str], user_domain: str) -> bool:
    """Check if the item's domain list contains the user's domain."""
    from services.domain_knowledge import DOMAIN_ALIAS_TO_KEY
    user_key = DOMAIN_ALIAS_TO_KEY.get(user_domain, "Software")
    return user_key in item_domains or "all" in item_domains


def get_recommendations(
    missing_skills: list[str],
    all_skills: list[str],
    domain: str = "Software Engineering / CS / IT",
    max_hackathons: int = 5,
    max_certifications: int = 5,
) -> dict:
    """
    Return recommended hackathons + certifications based on
    the user's missing skills and domain.
    """
    from services.domain_knowledge import DOMAIN_ALIAS_TO_KEY
    user_key = DOMAIN_ALIAS_TO_KEY.get((domain or "").strip(), "Software")

    combined_skills = list(set(missing_skills + all_skills))

    # ── Score hackathons ──
    scored_hackathons = []
    for h in HACKATHONS:
        if not _domain_match(h["domains"], domain):
            continue
        overlap = _skill_overlap(h["skills"], combined_skills)
        missing_overlap = _skill_overlap(h["skills"], missing_skills)
        if overlap == 0:
            continue
        score = missing_overlap * 3 + overlap  # weight missing skills higher
        matching = [s for s in h["skills"] if s.lower() in {sk.lower() for sk in combined_skills}]
        scored_hackathons.append({
            "name": h["name"],
            "platform": h["platform"],
            "url": h["url"],
            "type": h["type"],
            "frequency": h["frequency"],
            "description": h["description"],
            "team_size": h["team_size"],
            "matching_skills": matching,
            "relevance_score": min(100, int(score * 10)),
        })

    scored_hackathons.sort(key=lambda x: x["relevance_score"], reverse=True)

    # ── Score certifications ──
    scored_certs = []
    for c in CERTIFICATIONS:
        if not _domain_match(c["domains"], domain):
            continue
        overlap = _skill_overlap(c["skills"], combined_skills)
        missing_overlap = _skill_overlap(c["skills"], missing_skills)
        if overlap == 0:
            continue
        score = missing_overlap * 3 + overlap
        matching = [s for s in c["skills"] if s.lower() in {sk.lower() for sk in combined_skills}]
        scored_certs.append({
            "name": c["name"],
            "provider": c["provider"],
            "url": c["url"],
            "cost": c["cost"],
            "difficulty": c["difficulty"],
            "duration": c["duration"],
            "description": c["description"],
            "matching_skills": matching,
            "relevance_score": min(100, int(score * 10)),
        })

    scored_certs.sort(key=lambda x: x["relevance_score"], reverse=True)

    return {
        "hackathon_recommendations": scored_hackathons[:max_hackathons],
        "certification_recommendations": scored_certs[:max_certifications],
    }
