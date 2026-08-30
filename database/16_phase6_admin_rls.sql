-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 6 Row Level Security (RLS) Policies: Platform Governance
-- ============================================================================

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_skill_benchmarks ENABLE ROW LEVEL SECURITY;

-- 1. Super Admin unrestricted audit log access
DROP POLICY IF EXISTS "Super Admin audit logs access" ON public.admin_audit_logs;
CREATE POLICY "Super Admin audit logs access"
ON public.admin_audit_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 2. National skill benchmarks read policy (Public/Authenticated)
DROP POLICY IF EXISTS "Public read national benchmarks" ON public.national_skill_benchmarks;
CREATE POLICY "Public read national benchmarks"
ON public.national_skill_benchmarks
FOR SELECT
TO authenticated
USING (true);

-- 3. Only Super Admin can mutate benchmarks
DROP POLICY IF EXISTS "Super Admin mutate national benchmarks" ON public.national_skill_benchmarks;
CREATE POLICY "Super Admin mutate national benchmarks"
ON public.national_skill_benchmarks
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);
