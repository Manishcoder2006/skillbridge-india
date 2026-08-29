-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 4 Database Schema: Industry / HR Ecosystem
-- ============================================================================

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    industry_type VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    company_size VARCHAR(50) DEFAULT '1000-5000',
    founded_year INTEGER,
    company_type VARCHAR(50) DEFAULT 'enterprise', -- enterprise, startup, mnc, public_sector
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(100),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    social_links JSONB DEFAULT '{}'::jsonb,
    verification_status VARCHAR(50) DEFAULT 'verified',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Company Members (Mapping HR / Recruiters to Companies)
CREATE TABLE IF NOT EXISTS public.company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    designation VARCHAR(100) NOT NULL DEFAULT 'Talent Acquisition Specialist',
    department VARCHAR(100) DEFAULT 'Human Resources',
    is_primary_contact BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- 3. Extend Opportunities metadata for Phase 4 HR management
ALTER TABLE IF EXISTS public.opportunities
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS openings_count INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active', -- active, draft, closed
    ADD COLUMN IF NOT EXISTS preferred_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS responsibilities TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS duration VARCHAR(50);

-- 4. Application Reviews (Detailed HR evaluation history)
CREATE TABLE IF NOT EXISTS public.application_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.student_applications(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    review_notes TEXT,
    interview_scheduled_at TIMESTAMPTZ,
    interview_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Industry-Created Collaboration Initiatives
CREATE TABLE IF NOT EXISTS public.industry_collaboration_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    initiative_type VARCHAR(100) NOT NULL, -- workshop, fdp, joint_research, mentorship, hackathon
    target_domain VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    target_audience VARCHAR(100) DEFAULT 'all_students_faculty',
    slots_available INTEGER DEFAULT 50,
    timeline VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal lookup and tenant filtering
CREATE INDEX IF NOT EXISTS idx_companies_code ON public.companies(code);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_company ON public.opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_application_reviews_app ON public.application_reviews(application_id);
