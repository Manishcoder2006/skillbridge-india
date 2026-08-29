-- ==============================================================================
-- SkillBridge India - Phase 2 Row Level Security (RLS) Policies
-- Strict Student Privacy and Owner-Only Access Scopes
-- ==============================================================================

ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_resumes ENABLE ROW LEVEL SECURITY;

-- 1. Student Skills Policies
CREATE POLICY "student_skills_self_manage" ON public.student_skills
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- 2. Assessments Policies (Public to authenticated students)
CREATE POLICY "assessments_public_read" ON public.assessments
    FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "assessment_questions_read" ON public.assessment_questions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessments
            WHERE id = assessment_questions.assessment_id AND is_active = true
        )
    );

-- 3. Assessment Attempts Policies (Private to student)
CREATE POLICY "assessment_attempts_self_manage" ON public.assessment_attempts
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- 4. Learning Resources Policies
CREATE POLICY "learning_resources_public_read" ON public.learning_resources
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- 5. Student Learning Progress
CREATE POLICY "learning_progress_self_manage" ON public.student_learning_progress
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- 6. Opportunities (Jobs & Internships)
CREATE POLICY "opportunities_public_read" ON public.opportunities
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- 7. Applications (Private to student)
CREATE POLICY "applications_self_manage" ON public.applications
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- 8. Resumes (Private to student)
CREATE POLICY "student_resumes_self_manage" ON public.student_resumes
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());
