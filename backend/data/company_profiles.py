"""
Company Intelligence Database

Curated knowledge about top companies for use in Resume Tailoring,
Domain Switching, and Mock Interviews. 
Includes FAANG, Consulting, Finance, Startups, and more.
"""

COMPANY_DB = {
    # ── FAANG & Big Tech ──
    "google": {
        "name": "Google",
        "industry": "Big Tech",
        "culture": "Engineering-first, data-driven, innovative (Googleyness)",
        "resume_preferences": {
            "preferred_template": "technical",
            "section_order": ["experience", "projects", "skills", "education"],
            "values_keywords": ["scale", "distributed systems", "algorithms", "impact", "data-driven"],
            "tone": "Concise, metrics-heavy, straightforward",
        },
        "interview_style": "Algorithmic, System Design, Behavioral (Googleyness)",
        "growth_areas": ["AI/ML", "Cloud", "Hardware"],
        "avg_salary_range": {"sde1": "$130k-$170k", "sde2": "$180k-$240k", "senior": "$250k+"},
    },
    "amazon": {
        "name": "Amazon",
        "industry": "Big Tech / E-commerce",
        "culture": "Customer-obsessed, ownership, bias for action (Leadership Principles)",
        "resume_preferences": {
            "preferred_template": "classic",
            "section_order": ["experience", "projects", "skills", "education"],
            "values_keywords": ["delivered", "owned", "scaled", "customer", "results"],
            "tone": "Action-oriented, data-backed, highlighting ownership",
        },
        "interview_style": "STAR method behavioral based on LP, Data Structures, System Design",
        "growth_areas": ["AWS", "Logistics Tech", "AI", "Devices"],
        "avg_salary_range": {"sde1": "$120k-$160k", "sde2": "$170k-$230k", "senior": "$240k+"},
    },
    "apple": {
        "name": "Apple",
        "industry": "Big Tech / Hardware",
        "culture": "Secretive, design-focused, perfectionist, collaborative",
        "resume_preferences": {
            "preferred_template": "minimal",
            "section_order": ["experience", "skills", "projects", "education"],
            "values_keywords": ["user experience", "performance", "optimization", "design", "shipped"],
            "tone": "Elegant, focused on product quality and end-user impact",
        },
        "interview_style": "Domain-specific deep dives, architecture, collaborative problem solving",
        "growth_areas": ["AR/VR", "Silicon", "Services", "Health"],
        "avg_salary_range": {"ict2": "$130k-$170k", "ict3": "$180k-$240k", "ict4": "$250k+"},
    },
    "meta": {
        "name": "Meta",
        "industry": "Big Tech / Social",
        "culture": "Move fast, hacker culture, impact-driven",
        "resume_preferences": {
            "preferred_template": "technical",
            "section_order": ["skills", "experience", "projects", "education"],
            "values_keywords": ["hacked", "scaled", "billions", "growth", "performance"],
            "tone": "Fast-paced, high impact, highlighting engineering velocity",
        },
        "interview_style": "Fast-paced algorithmic (2 questions/45 min), System Design, Behavioral",
        "growth_areas": ["Reality Labs (VR/AR)", "AI", "Monetization"],
        "avg_salary_range": {"e3": "$130k-$160k", "e4": "$180k-$240k", "e5": "$250k+"},
    },
    "microsoft": {
        "name": "Microsoft",
        "industry": "Big Tech / Enterprise",
        "culture": "Growth mindset, inclusive, enterprise-focused",
        "resume_preferences": {
            "preferred_template": "classic",
            "section_order": ["experience", "projects", "education", "skills"],
            "values_keywords": ["enterprise", "integration", "accessibility", "cloud", "collaboration"],
            "tone": "Professional, highlighting teamwork and enterprise scale",
        },
        "interview_style": "System Design, Practical Coding, Behavioral, debugging",
        "growth_areas": ["Azure", "AI (OpenAI integration)", "Gaming"],
        "avg_salary_range": {"59-60": "$110k-$140k", "61-62": "$140k-$180k", "63-64": "$190k+"},
    },
    "netflix": {
        "name": "Netflix",
        "industry": "Big Tech / Entertainment",
        "culture": "Freedom and Responsibility, stunning colleagues, high performance",
        "resume_preferences": {
            "preferred_template": "modern",
            "section_order": ["experience", "projects", "skills", "education"],
            "values_keywords": ["streaming", "availability", "high-performance", "metrics", "A/B testing"],
            "tone": "Direct, emphasizing extreme ownership and high technical bar",
        },
        "interview_style": "Deep technical knowledge, domain expertise, core values alignment",
        "growth_areas": ["Gaming", "Live Streaming", "Ad-supported tier"],
        "avg_salary_range": {"senior": "$350k-$500k+"},
    },

    # ── FinTech & Finance ──
    "stripe": {
        "name": "Stripe",
        "industry": "FinTech",
        "culture": "Developer-first, rigorous execution, high agency",
        "resume_preferences": {
            "preferred_template": "modern",
            "section_order": ["projects", "experience", "skills", "education"],
            "values_keywords": ["API", "infrastructure", "developer experience", "reliability", "payments"],
            "tone": "Maker-focused, highly technical, clean and readable",
        },
        "interview_style": "Practical bug bash, integration tests, pair programming",
        "growth_areas": ["Global Expansion", "Banking as a Service", "Crypto"],
        "avg_salary_range": {"l1": "$120k-$150k", "l2": "$160k-$210k", "l3": "$220k+"},
    },
    "goldman_sachs": {
        "name": "Goldman Sachs",
        "industry": "Investment Banking",
        "culture": "High pressure, prestigious, analytical",
        "resume_preferences": {
            "preferred_template": "classic",
            "section_order": ["education", "experience", "projects", "skills"],
            "values_keywords": ["analytical", "risk", "quantitative", "leadership", "capital"],
            "tone": "Highly formal, conservative, quantifiable financial impact",
        },
        "interview_style": "Math/Probability, Brainteasers, Hard DSA, Behavioral (Why Finance?)",
        "growth_areas": ["Quantitative Trading", "Risk Tech", "Consumer Banking"],
        "avg_salary_range": {"analyst": "$90k-$120k", "associate": "$150k-$200k"},
    },
    "bloomberg": {
        "name": "Bloomberg",
        "industry": "FinTech / Media",
        "culture": "Fast-paced, C++ heavy, data-centric",
        "resume_preferences": {
            "preferred_template": "technical",
            "section_order": ["skills", "experience", "education", "projects"],
            "values_keywords": ["latency", "real-time", "high-throughput", "C++", "data"],
            "tone": "Technical depth, focus on performance and real-time systems",
        },
        "interview_style": "System Design (real-time chat/trading), Algorithms, C++ specifics",
        "growth_areas": ["Machine Learning (BloombergGPT)", "Trading Systems"],
        "avg_salary_range": {"swe": "$160k-$200k"},
    },

    # ── Consulting ──
    "deloitte": {
        "name": "Deloitte",
        "industry": "Consulting",
        "culture": "Client-facing, structured, networking-heavy",
        "resume_preferences": {
            "preferred_template": "classic",
            "section_order": ["experience", "education", "skills", "projects"],
            "values_keywords": ["client", "delivered", "stakeholders", "transformation", "strategy"],
            "tone": "Formal, impact and value delivery focused, professional",
        },
        "interview_style": "Case Studies, Behavioral, Technical fit",
        "growth_areas": ["Digital Transformation", "Cybersecurity", "Cloud Implementation"],
        "avg_salary_range": {"analyst": "$80k-$100k", "consultant": "$110k-$140k"},
    },
    "mckinsey": {
        "name": "McKinsey & Company",
        "industry": "Management Consulting",
        "culture": "Elite, analytical, top-down problem solving",
        "resume_preferences": {
            "preferred_template": "minimal",
            "section_order": ["education", "experience", "skills", "projects"],
            "values_keywords": ["leadership", "impact", "problem-solving", "strategy", "executive"],
            "tone": "Executive-level, concise, extreme focus on quantifiable impact",
        },
        "interview_style": "Intensive Case Interviews, Personal Experience Interview (PEI)",
        "growth_areas": ["QuantumBlack (AI)", "Digital", "Sustainability"],
        "avg_salary_range": {"ba": "$100k-$130k", "associate": "$180k-$220k"},
    },

    # ── Modern Tech & Startups ──
    "airbnb": {
        "name": "Airbnb",
        "industry": "Tech / Travel",
        "culture": "Design-led, community-focused, belonging",
        "resume_preferences": {
            "preferred_template": "modern",
            "section_order": ["experience", "projects", "education", "skills"],
            "values_keywords": ["community", "design", "user-centric", "host", "experience"],
            "tone": "Story-driven, visually clean, emphasizing user empathy",
        },
        "interview_style": "Core Values ('Be a Host'), Architecture, Frontend/Backend specific",
        "growth_areas": ["Experiences", "Long-term stays", "AI matchmaking"],
        "avg_salary_range": {"l3": "$130k-$160k", "l4": "$180k-$220k"},
    },
    "uber": {
        "name": "Uber",
        "industry": "Tech / Mobility",
        "culture": "Hustle, scale, data-driven, logistics",
        "resume_preferences": {
            "preferred_template": "technical",
            "section_order": ["experience", "skills", "projects", "education"],
            "values_keywords": ["scale", "marketplace", "routing", "real-time", "microservices"],
            "tone": "Technical, focused on overcoming hard scaling challenges",
        },
        "interview_style": "System Design (heavy on architecture/scaling), Algorithms",
        "growth_areas": ["Uber Eats", "Freight", "Autonomous Routing"],
        "avg_salary_range": {"l3": "$120k-$150k", "l4": "$160k-$210k", "l5a": "$220k+"},
    },
    "atlassian": {
        "name": "Atlassian",
        "industry": "Enterprise Software",
        "culture": "Open company, no bullshit, highly collaborative",
        "resume_preferences": {
            "preferred_template": "modern",
            "section_order": ["experience", "skills", "projects", "education"],
            "values_keywords": ["team", "collaboration", "agile", "platform", "shipped"],
            "tone": "Friendly but professional, emphasizing team success over solo heroism",
        },
        "interview_style": "React/Java focused, System Design, Values interview",
        "growth_areas": ["Cloud Migration", "AI (Atlassian Intelligence)"],
        "avg_salary_range": {"p3": "$110k-$140k", "p4": "$150k-$190k"},
    },

    # ── AI & Data ──
    "openai": {
        "name": "OpenAI",
        "industry": "Artificial Intelligence",
        "culture": "Research-heavy, intense, AGI mission-driven",
        "resume_preferences": {
            "preferred_template": "minimal",
            "section_order": ["projects", "experience", "skills", "education"],
            "values_keywords": ["transformers", "scaling", "GPU", "research", "safety"],
            "tone": "Academic yet highly practical, extremely technical",
        },
        "interview_style": "Research papers discussion, Deep Math/ML, Architecture, Coding",
        "growth_areas": ["AGI", "Multimodal", "Alignment"],
        "avg_salary_range": {"l4": "$200k-$300k", "l5": "$300k-$500k+"},
    },
    "databricks": {
        "name": "Databricks",
        "industry": "Data / AI",
        "culture": "Highly academic, deeply technical, fast growth",
        "resume_preferences": {
            "preferred_template": "technical",
            "section_order": ["skills", "experience", "education", "projects"],
            "values_keywords": ["distributed", "spark", "data lakes", "performance", "infrastructure"],
            "tone": "Deeply technical, focused on big data and low-level optimization",
        },
        "interview_style": "Hard Algorithms, Systems Engineering, Data Infrastructure",
        "growth_areas": ["Generative AI (MosaicML)", "Lakehouse"],
        "avg_salary_range": {"l3": "$150k-$180k", "l4": "$190k-$240k", "l5": "$250k+"},
    },
}

from typing import Optional

def get_company_profile(query: str) -> Optional[dict]:
    """
    Fuzzy match a company query against the COMPANY_DB.
    Returns the company profile dict or None if not found.
    """
    if not query:
        return None
        
    query_clean = query.lower().strip()
    
    # Exact match on key
    if query_clean in COMPANY_DB:
        return COMPANY_DB[query_clean]
        
    # Partial match on name
    for key, data in COMPANY_DB.items():
        name_val = data.get("name", "")
        if isinstance(name_val, str):
            name_clean = name_val.lower()
            if query_clean in name_clean or name_clean in query_clean:
                return data
            
    # Simple alias mapping
    aliases = {
        "fb": "meta",
        "facebook": "meta",
        "aws": "amazon",
        "google llc": "google",
        "alphabet": "google",
    }
    
    if query_clean in aliases:
        return COMPANY_DB[aliases[query_clean]]
        
    return None
