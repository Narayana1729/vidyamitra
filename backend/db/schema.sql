-- ============================================================
-- VidyaMitra — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 0. User Profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,                                     -- same as auth.users.id
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'company')),
    company_name TEXT DEFAULT '',
    domain TEXT DEFAULT 'Software Engineering / CS / IT',    -- Engineering Branch
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 0.5 ADD MISSING COLUMNS TO EXISTING TABLES (Fixes ERROR: 42703)
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'Software Engineering / CS / IT';
ALTER TABLE IF EXISTS resume_analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS resume_builds ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS skill_analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS roadmaps ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS interview_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS interview_sessions ADD COLUMN IF NOT EXISTS interview_type TEXT DEFAULT 'technical';
ALTER TABLE IF EXISTS interview_sessions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'intermediate';
ALTER TABLE IF EXISTS interview_sessions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';

ALTER TABLE IF EXISTS interview_answers ADD COLUMN IF NOT EXISTS is_followup BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS interview_answers ADD COLUMN IF NOT EXISTS code_snippet TEXT DEFAULT '';
ALTER TABLE IF EXISTS interview_answers ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';

ALTER TABLE IF EXISTS activity_log ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 1. Resume Analyses (from /api/resume/analyze and /api/resume/score)
CREATE TABLE IF NOT EXISTS resume_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    analysis_type TEXT NOT NULL DEFAULT 'full',          -- 'full' or 'ats_score'
    overall_score INTEGER,
    ats_score INTEGER,
    keyword_match INTEGER,
    sections JSONB DEFAULT '{}',
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    suggestions JSONB DEFAULT '[]',
    raw_result JSONB DEFAULT '{}',                       -- full AI response
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Resume Builds (from /api/resume/build)
CREATE TABLE IF NOT EXISTS resume_builds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT,
    target_role TEXT,
    template TEXT DEFAULT 'classic',
    ats_score_estimate INTEGER,
    resume_data JSONB DEFAULT '{}',                      -- all user input
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Skill Gap Analyses (from /api/skills/analyze)
CREATE TABLE IF NOT EXISTS skill_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_role TEXT NOT NULL,
    experience_level TEXT DEFAULT 'Beginner',
    match_percentage INTEGER,
    matched_skills JSONB DEFAULT '[]',
    missing_skills JSONB DEFAULT '[]',
    priority_roadmap JSONB DEFAULT '[]',
    learning_plan JSONB DEFAULT '{}',
    project_suggestions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Learning Roadmaps (from /api/roadmap/generate)
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_role TEXT NOT NULL,
    current_level TEXT DEFAULT 'Beginner',
    total_duration TEXT,
    phases JSONB DEFAULT '[]',
    tips JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Interview Sessions (from /api/interview/start)
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    questions JSONB DEFAULT '[]',
    total_questions INTEGER DEFAULT 0,
    interview_type TEXT DEFAULT 'technical',
    difficulty TEXT DEFAULT 'intermediate',
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Interview Answers (from /api/interview/evaluate)
CREATE TABLE IF NOT EXISTS interview_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES interview_sessions(session_id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    score INTEGER,
    feedback TEXT,
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    model_answer TEXT,
    is_followup BOOLEAN DEFAULT false,
    code_snippet TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Activity Log (unified feed for dashboard)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,                          -- 'resume', 'skill', 'interview', 'roadmap', 'resume_build'
    action TEXT NOT NULL,                                 -- human-readable description
    metadata JSONB DEFAULT '{}',                          -- extra data (scores, role, etc.)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Jobs (posted by companies)
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    skills_required JSONB DEFAULT '[]',                   -- ["Python", "React", "SQL"]
    location TEXT DEFAULT '',
    job_type TEXT DEFAULT 'Full-time' CHECK (job_type IN ('Full-time', 'Part-time', 'Internship', 'Contract', 'Remote')),
    salary_range TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Job Applications (students apply to jobs)
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cover_letter TEXT DEFAULT '',
    resume_score INTEGER,                                 -- auto-filled from latest analysis
    matched_skills JSONB DEFAULT '[]',
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'hired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(job_id, student_id)                            -- one application per student per job
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created ON resume_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session ON interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_analyses_created ON skill_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_analyses_user ON skill_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_created ON roadmaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);

-- 10. Tracked Applications Kanban Tracking (Phase 7 - Personal Board)
CREATE TABLE IF NOT EXISTS tracked_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Wishlist', -- Wishlist, Applied, Interviewing, Offered, Rejected
    job_description TEXT,
    match_score INTEGER DEFAULT 0, -- Auto-computed by ATS Engine
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Coding Profiles
CREATE TABLE IF NOT EXISTS coding_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    leetcode_username TEXT,
    codeforces_username TEXT,
    github_username TEXT,
    hackerrank_username TEXT,
    profile_data JSONB DEFAULT '{}',
    coding_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- 12. AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    placement_probability FLOAT,
    verdict TEXT,
    top_factors JSONB DEFAULT '[]',
    cluster_id INTEGER,
    archetype TEXT,
    archetype_emoji TEXT,
    archetype_description TEXT,
    best_role TEXT,
    role_confidence FLOAT,
    skill_health JSONB DEFAULT '{}',
    readiness_timeline JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- 13. Daily Plans
CREATE TABLE IF NOT EXISTS daily_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_date TEXT NOT NULL,
    plan_data JSONB DEFAULT '{}',
    completed_tasks JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, plan_date)
);

-- 14. User Goals
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- 15. Higher Studies Progress
CREATE TABLE IF NOT EXISTS higher_studies_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    track TEXT NOT NULL,
    roadmap_prefs JSONB DEFAULT '{}',
    struck_out_days JSONB DEFAULT '{}',
    quiz_history JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, track)
);

-- ============================================================
-- Additional Indexes for new Phase 7 & AI features
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tracked_applications_user ON tracked_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_profiles_user ON coding_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user ON daily_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_higher_studies_progress_user ON higher_studies_progress(user_id);
