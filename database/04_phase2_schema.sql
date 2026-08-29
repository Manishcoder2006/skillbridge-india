-- ==============================================================================
-- SkillBridge India - Phase 2 Schema: Student Ecosystem
-- Problem Statement: 26044 (SIH 2026)
-- Normalized tables for Student Skills, Assessments, Learning, Opportunities,
-- Applications, and Resume Builder.
-- ==============================================================================

-- 1. Student Skills
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'technical', -- 'technical', 'soft', 'domain'
    proficiency_level VARCHAR(30) NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_name)
);

-- 2. Assessments Catalog
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 15,
    total_questions INT NOT NULL DEFAULT 5,
    passing_percentage INT NOT NULL DEFAULT 60,
    difficulty VARCHAR(30) NOT NULL DEFAULT 'intermediate',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Assessment Questions
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g. ["Option A", "Option B", "Option C", "Option D"]
    correct_option_index INT NOT NULL, -- 0-indexed integer
    skill_tag VARCHAR(100) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Assessment Attempts & Results
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    total_marks INT NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    status VARCHAR(30) NOT NULL DEFAULT 'completed', -- 'completed', 'in_progress'
    strengths JSONB DEFAULT '[]'::JSONB, -- Array of identified strong skills
    skill_gaps JSONB DEFAULT '[]'::JSONB, -- Array of identified skill gaps
    submitted_answers JSONB DEFAULT '{}'::JSONB,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Learning Resources
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    skill_tag VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'course', -- 'course', 'tutorial', 'video', 'pdf', 'certification', 'workshop'
    provider VARCHAR(150) NOT NULL DEFAULT 'SkillBridge Learning',
    duration VARCHAR(50) NOT NULL DEFAULT '2 hours',
    url TEXT NOT NULL,
    level VARCHAR(30) NOT NULL DEFAULT 'intermediate',
    is_free BOOLEAN NOT NULL DEFAULT true,
    rating NUMERIC(3,2) DEFAULT 4.8,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Student Learning Progress
CREATE TABLE IF NOT EXISTS public.student_learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed'
    progress_percent INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_resource UNIQUE (student_id, resource_id)
);

-- 7. Opportunities (Jobs & Internships)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'internship', -- 'job', 'internship'
    location VARCHAR(150) NOT NULL DEFAULT 'Pan-India',
    work_mode VARCHAR(30) NOT NULL DEFAULT 'remote', -- 'remote', 'hybrid', 'on_site'
    stipend_or_salary VARCHAR(100) NOT NULL DEFAULT 'Competitive',
    required_skills TEXT[] DEFAULT '{}',
    eligibility TEXT DEFAULT 'Open to relevant Engineering & Technology batches',
    description TEXT NOT NULL,
    application_deadline DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'applied', -- 'applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'
    notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_application UNIQUE (student_id, opportunity_id)
);

-- 9. Student Resumes
CREATE TABLE IF NOT EXISTS public.student_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline VARCHAR(255) DEFAULT 'Aspiring Software & Systems Engineer',
    summary TEXT,
    target_role VARCHAR(150) DEFAULT 'Full Stack Developer',
    education JSONB DEFAULT '[]'::JSONB,
    skills JSONB DEFAULT '[]'::JSONB,
    projects JSONB DEFAULT '[]'::JSONB,
    experience JSONB DEFAULT '[]'::JSONB,
    certifications JSONB DEFAULT '[]'::JSONB,
    achievements JSONB DEFAULT '[]'::JSONB,
    links JSONB DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON public.student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skill ON public.learning_resources(skill_tag);
