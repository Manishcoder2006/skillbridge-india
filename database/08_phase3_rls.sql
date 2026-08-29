-- ==============================================================================
-- SkillBridge India - Phase 3 Row Level Security (RLS) Policies
-- Department Scoping, Faculty Content, Collaboration, and Notifications
-- ==============================================================================

ALTER TABLE public.faculty_learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_collaboration_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Faculty Learning Content Policies
CREATE POLICY "faculty_content_self_manage" ON public.faculty_learning_content
    FOR ALL
    TO authenticated
    USING (academician_id = auth.uid())
    WITH CHECK (academician_id = auth.uid());

CREATE POLICY "faculty_content_dept_read" ON public.faculty_learning_content
    FOR SELECT
    TO authenticated
    USING (
        is_published = true AND (
            visibility = 'public'
            OR institution_id = (SELECT institution_id FROM public.profiles WHERE id = auth.uid())
            OR department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid())
        )
    );

-- 2. Opportunity Recommendations Policies
CREATE POLICY "opportunity_recs_manage" ON public.opportunity_recommendations
    FOR ALL
    TO authenticated
    USING (academician_id = auth.uid())
    WITH CHECK (academician_id = auth.uid());

CREATE POLICY "opportunity_recs_student_read" ON public.opportunity_recommendations
    FOR SELECT
    TO authenticated
    USING (
        department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid())
        OR institution_id = (SELECT institution_id FROM public.profiles WHERE id = auth.uid())
    );

-- 3. Industry Collaboration Initiatives Policies
CREATE POLICY "collab_initiatives_read" ON public.industry_collaboration_initiatives
    FOR SELECT
    TO authenticated
    USING (status = 'open');

-- 4. Collaboration Participations Policies
CREATE POLICY "collab_participations_self_manage" ON public.collaboration_participations
    FOR ALL
    TO authenticated
    USING (academician_id = auth.uid())
    WITH CHECK (academician_id = auth.uid());

-- 5. Notifications Policies
CREATE POLICY "notifications_self_manage" ON public.notifications
    FOR ALL
    TO authenticated
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());
