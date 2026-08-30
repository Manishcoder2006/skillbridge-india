-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 6 Database Schema: Super Admin & National Platform Governance
-- ============================================================================

-- 1. System Activity & Governance Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'user_verify', 'institution_approve', 'company_verify', 'posting_moderate'
    target_entity TEXT NOT NULL, -- 'user', 'institution', 'company', 'opportunity'
    target_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. National Skill Mapping Analytics Cache
CREATE TABLE IF NOT EXISTS public.national_skill_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_category TEXT NOT NULL,
    skill_name TEXT NOT NULL UNIQUE,
    industry_demand_score INT DEFAULT 85,
    student_proficiency_avg INT DEFAULT 65,
    gap_severity TEXT DEFAULT 'Moderate', -- 'Critical', 'Moderate', 'Low'
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for governance queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);
