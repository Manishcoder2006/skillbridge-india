-- ==============================================================================
-- SkillBridge India - Row Level Security (RLS) Policies (Phase 1 Foundation)
-- Multi-Tenant Institution Isolation & Strict Role-Based Data Scoping
-- ==============================================================================

-- Enable RLS on all foundation tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_admin_profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Helper Security Functions (SECURITY DEFINER to avoid recursive RLS checks)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_institution_id()
RETURNS UUID AS $$
    SELECT institution_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_department_id()
RETURNS UUID AS $$
    SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. INSTITUTIONS POLICIES
-- ------------------------------------------------------------------------------
-- Public / authenticated users can view active, verified institutions
CREATE POLICY "institutions_public_read" ON public.institutions
    FOR SELECT
    USING (is_active = true AND verification_status = 'verified');

-- Institution Admins can view their own institution even if pending
CREATE POLICY "institutions_admin_read" ON public.institutions
    FOR SELECT
    TO authenticated
    USING (
        id = public.get_auth_institution_id() AND
        public.get_auth_role() IN ('institution_admin', 'super_admin')
    );

-- Super Admins have full access to institutions
CREATE POLICY "institutions_super_admin_all" ON public.institutions
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');

-- ------------------------------------------------------------------------------
-- 2. DEPARTMENTS POLICIES
-- ------------------------------------------------------------------------------
-- Read departments of verified institutions or matching current user's institution
CREATE POLICY "departments_read" ON public.departments
    FOR SELECT
    USING (
        is_active = true AND (
            institution_id = public.get_auth_institution_id() OR
            EXISTS (
                SELECT 1 FROM public.institutions
                WHERE id = departments.institution_id
                AND is_active = true
                AND verification_status = 'verified'
            )
        )
    );

-- Institution Admin can manage departments of their own institution
CREATE POLICY "departments_admin_manage" ON public.departments
    FOR ALL
    TO authenticated
    USING (
        institution_id = public.get_auth_institution_id() AND
        public.get_auth_role() = 'institution_admin'
    )
    WITH CHECK (
        institution_id = public.get_auth_institution_id() AND
        public.get_auth_role() = 'institution_admin'
    );

-- Super Admins can manage all departments
CREATE POLICY "departments_super_admin_all" ON public.departments
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');

-- ------------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- User can view own profile
CREATE POLICY "profiles_self_read" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Institution Admin can view profiles in their own institution
CREATE POLICY "profiles_institution_admin_read" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        institution_id = public.get_auth_institution_id() AND
        public.get_auth_role() = 'institution_admin'
    );

-- Academicians can view student profiles in their department
CREATE POLICY "profiles_academician_dept_read" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        institution_id = public.get_auth_institution_id() AND
        department_id = public.get_auth_department_id() AND
        public.get_auth_role() = 'academician'
    );

-- Super Admins can view and manage all profiles
CREATE POLICY "profiles_super_admin_all" ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');

-- User can update own profile (trigger prevents updating role, institution_id, etc.)
CREATE POLICY "profiles_self_update" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4. STUDENT PROFILES POLICIES (Privacy & Department-Level Scoping)
-- ------------------------------------------------------------------------------
-- Student can view own record
CREATE POLICY "student_self_read" ON public.student_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Academicians can view students in their own department only
CREATE POLICY "student_academician_read" ON public.student_profiles
    FOR SELECT
    TO authenticated
    USING (
        institution_id = public.get_auth_institution_id() AND
        department_id = public.get_auth_department_id() AND
        public.get_auth_role() = 'academician'
    );

-- Institution Admin can view students in their institution
CREATE POLICY "student_inst_admin_read" ON public.student_profiles
    FOR SELECT
    TO authenticated
    USING (
        institution_id = public.get_auth_institution_id() AND
        public.get_auth_role() = 'institution_admin'
    );

-- Super Admin can view all student records
CREATE POLICY "student_super_admin_all" ON public.student_profiles
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');

-- Student can update own details
CREATE POLICY "student_self_update" ON public.student_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 5. ACADEMICIAN PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "academician_self_read" ON public.academician_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "academician_inst_colleagues_read" ON public.academician_profiles
    FOR SELECT
    TO authenticated
    USING (
        institution_id = public.get_auth_institution_id() AND
        public.get_auth_role() IN ('academician', 'institution_admin')
    );

CREATE POLICY "academician_super_admin_all" ON public.academician_profiles
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "academician_self_update" ON public.academician_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6. INDUSTRY PROFILES & COMPANIES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "companies_read" ON public.companies
    FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "companies_super_admin_all" ON public.companies
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "industry_self_read" ON public.industry_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "industry_self_update" ON public.industry_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "industry_super_admin_all" ON public.industry_profiles
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');

-- ------------------------------------------------------------------------------
-- 7. INSTITUTION ADMIN PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "inst_admin_self_read" ON public.institution_admin_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "inst_admin_super_admin_all" ON public.institution_admin_profiles
    FOR ALL
    TO authenticated
    USING (public.get_auth_role() = 'super_admin');
