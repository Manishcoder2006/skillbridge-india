-- ==============================================================================
-- SkillBridge India - Phase 3 Schema: Academician / Faculty Ecosystem
-- Problem Statement: 26044 (SIH 2026)
-- Normalized tables for Faculty Content, Opportunity Recommendations,
-- Industry Collaboration Initiatives, and Notifications.
-- ==============================================================================

-- 1. Faculty Learning Content
CREATE TABLE IF NOT EXISTS public.faculty_learning_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    skill_tag VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'tutorial', -- 'course', 'tutorial', 'video', 'pdf', 'workshop'
    url TEXT NOT NULL,
    description TEXT,
    visibility VARCHAR(30) NOT NULL DEFAULT 'department', -- 'department', 'institution', 'public'
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Opportunity Recommendations (Faculty -> Students)
CREATE TABLE IF NOT EXISTS public.opportunity_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Industry Collaboration Initiatives
CREATE TABLE IF NOT EXISTS public.industry_collaboration_initiatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'workshop', 'guest_lecture', 'faculty_development', 'joint_research', 'mentorship'
    company_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    mode VARCHAR(30) NOT NULL DEFAULT 'hybrid', -- 'online', 'hybrid', 'on_site'
    duration VARCHAR(50) NOT NULL DEFAULT '2 Weeks',
    deadline DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'completed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Collaboration Participations (Faculty RSVP / Expression of Interest)
CREATE TABLE IF NOT EXISTS public.collaboration_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id UUID NOT NULL REFERENCES public.industry_collaboration_initiatives(id) ON DELETE CASCADE,
    academician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_note TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'expressed', -- 'expressed', 'accepted', 'completed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_faculty_initiative UNIQUE (initiative_id, academician_id)
);

-- 5. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system', -- 'student', 'opportunity', 'collaboration', 'system'
    is_read BOOLEAN NOT NULL DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_faculty_content_dept ON public.faculty_learning_content(department_id, institution_id);
CREATE INDEX IF NOT EXISTS idx_faculty_content_author ON public.faculty_learning_content(academician_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_recs_dept ON public.opportunity_recommendations(department_id);
CREATE INDEX IF NOT EXISTS idx_collab_participations_faculty ON public.collaboration_participations(academician_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);
