-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 5 Row Level Security (RLS) Policies: AI Logs & Cached Insights
-- ============================================================================

ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cached_recommendations ENABLE ROW LEVEL SECURITY;

-- 1. AI Request Logs Policies
CREATE POLICY "Users can view their own AI request logs"
    ON public.ai_request_logs
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Authenticated users can insert AI logs"
    ON public.ai_request_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- 2. AI Cached Recommendations Policies
CREATE POLICY "Users can access their own cached AI recommendations"
    ON public.ai_cached_recommendations
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );
