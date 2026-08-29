-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 4 Row Level Security (RLS) Policies: Industry / HR
-- ============================================================================

-- Enable RLS on all Phase 4 tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_collaboration_proposals ENABLE ROW LEVEL SECURITY;

-- 1. Companies Policies
-- Public / authenticated read for active verified companies
CREATE POLICY "Public read for verified companies"
    ON public.companies
    FOR SELECT
    USING (is_active = TRUE);

-- Only HR members of the company or super admins can update company details
CREATE POLICY "Company HR update own company"
    ON public.companies
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_members cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
            AND cm.is_active = TRUE
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- 2. Company Members Policies
CREATE POLICY "View company members"
    ON public.company_members
    FOR SELECT
    TO authenticated
    USING (
        company_id IN (
            SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid()
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- 3. Opportunities HR Management Policies
CREATE POLICY "HR manage company opportunities"
    ON public.opportunities
    FOR ALL
    TO authenticated
    USING (
        company_id IN (
            SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid() AND cm.is_active = TRUE
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    )
    WITH CHECK (
        company_id IN (
            SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid() AND cm.is_active = TRUE
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- 4. Application Reviews Policies
CREATE POLICY "HR view and create reviews for company applications"
    ON public.application_reviews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_applications sa
            JOIN public.opportunities o ON sa.opportunity_id = o.id
            JOIN public.company_members cm ON o.company_id = cm.company_id
            WHERE sa.id = application_reviews.application_id
            AND cm.user_id = auth.uid()
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- 5. Industry Collaboration Proposals Policies
CREATE POLICY "Public read active collaboration proposals"
    ON public.industry_collaboration_proposals
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "HR manage own collaboration proposals"
    ON public.industry_collaboration_proposals
    FOR ALL
    TO authenticated
    USING (
        created_by_user_id = auth.uid()
        OR company_id IN (
            SELECT cm.company_id FROM public.company_members cm WHERE cm.user_id = auth.uid() AND cm.is_active = TRUE
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );
