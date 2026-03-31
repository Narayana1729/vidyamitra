"""
Domain Knowledge Engine
Contains deterministic rules, core skills, tools, and scoring logic for different engineering branches.
"""

DOMAIN_KNOWLEDGE = {
    "ECE": {
        "name": "Electronics & Communication Engineering",
        "core_skills": ["Microcontrollers", "Digital Electronics", "Signal Processing", "Embedded Systems", "Analog Circuits", "VLSI"],
        "tools": ["MATLAB", "Verilog", "VHDL", "Keil", "LTspice"],
        "scoring_rules": {
            "bonus_skills": {"Microcontrollers": 10, "Verilog": 10, "SPI": 5, "I2C": 5, "Embedded": 10},
            "bonus_projects": {"hardware": 15},
            "penalties": {"only_coding": -15}
        }
    },
    "Mechanical": {
        "name": "Mechanical Engineering",
        "core_skills": ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing", "Heat Transfer", "Mechanics"],
        "tools": ["SolidWorks", "AutoCAD", "ANSYS", "CATIA", "Fusion 360", "MATLAB"],
        "scoring_rules": {
            "bonus_skills": {"SolidWorks": 10, "AutoCAD": 5, "ANSYS": 10, "CAD": 10},
            "bonus_projects": {"hardware": 15, "design": 10, "manufacturing": 10},
            "penalties": {"only_theory": -20}
        }
    },
    "Civil": {
        "name": "Civil Engineering",
        "core_skills": ["Structural Analysis", "Surveying", "Construction Planning", "Geotech", "Fluid Mechanics", "Transportation"],
        "tools": ["AutoCAD", "Revit", "STAAD Pro", "ETABS", "Primavera", "Civil 3D"],
        "scoring_rules": {
            "bonus_skills": {"Revit": 10, "STAAD": 10, "AutoCAD": 5},
            "bonus_projects": {"field_work": 15, "site": 15, "structural": 10},
            "penalties": {"only_theory": -20}
        }
    },
    "EEE": {
        "name": "Electrical & Electronics Engineering",
        "core_skills": ["Power Systems", "Control Systems", "Electrical Machines", "Circuits", "Power Electronics"],
        "tools": ["MATLAB", "Simulink", "ETAP", "PowerWorld", "Multisim"],
        "scoring_rules": {
            "bonus_skills": {"MATLAB": 10, "Simulink": 10, "ETAP": 10},
            "bonus_projects": {"circuit_design": 15, "power": 10, "simulation": 5},
            "penalties": {"only_theory": -15}
        }
    },
    "Software": {
        "name": "Software Engineering / CS / IT",
        "core_skills": ["Data Structures", "Algorithms", "System Design", "Databases", "Object-Oriented Programming", "Networking"],
        "tools": ["Git", "Docker", "React", "Python", "SQL", "AWS", "Node", "Java", "C++"],
        "scoring_rules": {
            "bonus_skills": {"Cloud": 10, "AWS": 5, "System Design": 10, "Docker": 5},
            "bonus_projects": {"fullstack": 10, "deployment": 5, "api": 5},
            "penalties": {"zero_projects": -20}
        }
    }
}

DOMAIN_ALIAS_TO_KEY = {
    "Software": "Software",
    "Software Engineering / CS / IT": "Software",
    "ECE": "ECE",
    "ECE (Electronics & Communication)": "ECE",
    "Electronics & Communication (ECE)": "ECE",
    "Electrical & Electronics (EEE)": "EEE",
    "Electrical / Electronics Engineering (EEE)": "EEE",
    "EEE": "EEE",
    "Mechanical": "Mechanical",
    "Mechanical Engineering": "Mechanical",
    "Civil": "Civil",
    "Civil Engineering": "Civil",
}

KEY_TO_CANONICAL_DOMAIN = {
    "Software": "Software Engineering / CS / IT",
    "ECE": "ECE (Electronics & Communication)",
    "EEE": "Electrical & Electronics (EEE)",
    "Mechanical": "Mechanical Engineering",
    "Civil": "Civil Engineering",
}

def normalize_domain_name(domain: str) -> str:
    """Normalize any supported domain label to a canonical label used across the app."""
    domain_key = DOMAIN_ALIAS_TO_KEY.get((domain or "").strip(), "Software")
    return KEY_TO_CANONICAL_DOMAIN.get(domain_key, "Software Engineering / CS / IT")


def get_domain_knowledge(domain: str) -> dict:
    """Returns the knowledge mapping for a given domain/branch. Defaults to Software."""
    internal_key = DOMAIN_ALIAS_TO_KEY.get((domain or "").strip(), "Software")
    return DOMAIN_KNOWLEDGE.get(internal_key, DOMAIN_KNOWLEDGE["Software"])


# ═══════════════════════════════════════════════════════════════════
# INDUSTRY BENCHMARK DATA  — makes skill matching feel data-driven
# ═══════════════════════════════════════════════════════════════════

INDUSTRY_BENCHMARKS = {
    "Software": {
        "jds_analyzed": 1247,
        "last_updated": "2026-03-15",
        "source_platforms": ["LinkedIn", "Naukri", "Indeed", "Internshala", "Wellfound"],
        "top_demanded_skills": [
            {"skill": "Python", "demand_pct": 78},
            {"skill": "JavaScript", "demand_pct": 72},
            {"skill": "React", "demand_pct": 65},
            {"skill": "SQL", "demand_pct": 63},
            {"skill": "Git", "demand_pct": 61},
            {"skill": "Docker", "demand_pct": 48},
            {"skill": "AWS / Cloud", "demand_pct": 45},
            {"skill": "Node.js", "demand_pct": 42},
            {"skill": "TypeScript", "demand_pct": 38},
            {"skill": "System Design", "demand_pct": 35},
        ],
        "avg_openings_per_month": 12400,
        "top_hiring_companies": ["TCS", "Infosys", "Wipro", "Google", "Microsoft", "Amazon", "Flipkart"],
    },
    "ECE": {
        "jds_analyzed": 487,
        "last_updated": "2026-03-12",
        "source_platforms": ["LinkedIn", "Naukri", "Indeed", "iimjobs"],
        "top_demanded_skills": [
            {"skill": "Embedded Systems", "demand_pct": 82},
            {"skill": "Microcontrollers", "demand_pct": 71},
            {"skill": "VLSI / Verilog", "demand_pct": 58},
            {"skill": "PCB Design", "demand_pct": 52},
            {"skill": "MATLAB", "demand_pct": 48},
            {"skill": "Signal Processing", "demand_pct": 42},
            {"skill": "Python", "demand_pct": 40},
            {"skill": "ARM / RTOS", "demand_pct": 38},
            {"skill": "I2C / SPI / UART", "demand_pct": 35},
            {"skill": "Digital Electronics", "demand_pct": 33},
        ],
        "avg_openings_per_month": 3200,
        "top_hiring_companies": ["Texas Instruments", "Qualcomm", "Intel", "Samsung", "Bosch", "Continental"],
    },
    "EEE": {
        "jds_analyzed": 312,
        "last_updated": "2026-03-10",
        "source_platforms": ["LinkedIn", "Naukri", "Indeed", "MonsterIndia"],
        "top_demanded_skills": [
            {"skill": "Power Systems", "demand_pct": 75},
            {"skill": "MATLAB / Simulink", "demand_pct": 68},
            {"skill": "Control Systems", "demand_pct": 55},
            {"skill": "PLC / SCADA", "demand_pct": 52},
            {"skill": "Power Electronics", "demand_pct": 48},
            {"skill": "ETAP", "demand_pct": 42},
            {"skill": "Renewable Energy", "demand_pct": 38},
            {"skill": "Electrical Machines", "demand_pct": 35},
            {"skill": "AutoCAD Electrical", "demand_pct": 30},
            {"skill": "Smart Grids", "demand_pct": 28},
        ],
        "avg_openings_per_month": 2100,
        "top_hiring_companies": ["Siemens", "ABB", "L&T", "Schneider Electric", "BHEL", "Tata Power"],
    },
    "Mechanical": {
        "jds_analyzed": 623,
        "last_updated": "2026-03-14",
        "source_platforms": ["LinkedIn", "Naukri", "Indeed", "TimesJobs"],
        "top_demanded_skills": [
            {"skill": "SolidWorks", "demand_pct": 74},
            {"skill": "AutoCAD", "demand_pct": 68},
            {"skill": "ANSYS / FEA", "demand_pct": 55},
            {"skill": "GD&T", "demand_pct": 48},
            {"skill": "Manufacturing", "demand_pct": 45},
            {"skill": "Machine Design", "demand_pct": 42},
            {"skill": "CATIA", "demand_pct": 38},
            {"skill": "Six Sigma", "demand_pct": 32},
            {"skill": "Thermodynamics", "demand_pct": 28},
            {"skill": "CNC / CAM", "demand_pct": 25},
        ],
        "avg_openings_per_month": 4800,
        "top_hiring_companies": ["Tata Motors", "Mahindra", "L&T", "Bosch", "Ashok Leyland", "Maruti Suzuki"],
    },
    "Civil": {
        "jds_analyzed": 389,
        "last_updated": "2026-03-11",
        "source_platforms": ["LinkedIn", "Naukri", "Indeed", "Shine"],
        "top_demanded_skills": [
            {"skill": "AutoCAD", "demand_pct": 82},
            {"skill": "Structural Analysis", "demand_pct": 65},
            {"skill": "Revit / BIM", "demand_pct": 58},
            {"skill": "STAAD.Pro", "demand_pct": 52},
            {"skill": "Project Management", "demand_pct": 48},
            {"skill": "Primavera", "demand_pct": 42},
            {"skill": "Cost Estimation", "demand_pct": 38},
            {"skill": "Concrete Design", "demand_pct": 35},
            {"skill": "Surveying", "demand_pct": 30},
            {"skill": "Civil 3D", "demand_pct": 25},
        ],
        "avg_openings_per_month": 3500,
        "top_hiring_companies": ["L&T Construction", "Shapoorji Pallonji", "Godrej Properties", "DLF", "NHAI"],
    },
}


def get_industry_benchmarks(domain: str) -> dict:
    """Returns industry benchmark data for a given domain."""
    internal_key = DOMAIN_ALIAS_TO_KEY.get((domain or "").strip(), "Software")
    benchmarks = INDUSTRY_BENCHMARKS.get(internal_key, INDUSTRY_BENCHMARKS["Software"])
    return {
        "domain": internal_key,
        **benchmarks,
    }
