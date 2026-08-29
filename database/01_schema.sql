-- ==============================================================================
-- SkillBridge India - Database Schema (Phase 1 Foundation)
-- Problem Statement: 26044 (SIH 2026)
-- Multi-Tenant Institution Architecture with Strict Role-Based Access Control
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'student',
        'academician',
        'industry_hr',
        'institution_admin',
        'super_admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE institution_type AS ENUM (
        'university',
        'autonomous_college',
        'affiliated_college',
        'polytechnic',
        'iit_nit_iiit',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM (
        'pending',
        'verified',
        'rejected',
        'suspended'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE academician_role_level AS ENUM (
        'faculty',
        'hod',
        'dean',
        'placement_coordinator'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. INSTITUTIONS & DEPARTMENTS (Academic Tenancy)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type institution_type NOT NULL DEFAULT 'affiliated_college',
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(30),
    verification_status verification_status NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_institution_dept UNIQUE (institution_id, code)
);

-- ------------------------------------------------------------------------------
-- 3. COMPANIES (Industry Tenancy - Decoupled from Academic Institutions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry_sector VARCHAR(100),
    website VARCHAR(255),
    headquarters VARCHAR(150),
    verification_status verification_status NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BASE PROFILES (Linked 1:1 to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_institution_dept CHECK (
        (role IN ('student', 'academician', 'institution_admin') AND institution_id IS NOT NULL) OR
        (role IN ('industry_hr', 'super_admin'))
    )
);

-- ------------------------------------------------------------------------------
-- 5. ROLE-SPECIFIC EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    roll_number VARCHAR(100),
    batch_year INT,
    current_semester INT DEFAULT 1,
    cgpa NUMERIC(4,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_roll UNIQUE (institution_id, roll_number)
);

CREATE TABLE IF NOT EXISTS public.academician_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    employee_id VARCHAR(100),
    designation VARCHAR(150),
    role_level academician_role_level NOT NULL DEFAULT 'faculty',
    specialization TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_faculty_empid UNIQUE (institution_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.industry_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    designation VARCHAR(150),
    corporate_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.institution_admin_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    designation VARCHAR(150) DEFAULT 'Institutional Administrator',
    can_manage_departments BOOLEAN NOT NULL DEFAULT true,
    can_verify_faculty BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_institutions_code ON public.institutions(code);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(verification_status);
CREATE INDEX IF NOT EXISTS idx_departments_institution ON public.departments(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON public.student_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_department ON public.student_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_academician_profiles_institution ON public.academician_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_academician_profiles_department ON public.academician_profiles(department_id);

-- ------------------------------------------------------------------------------
-- 7. TIMESTAMPS & AUTOMATION TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_institutions_updated_at ON public.institutions;
CREATE TRIGGER trg_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_departments_updated_at ON public.departments;
CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_academician_profiles_updated_at ON public.academician_profiles;
CREATE TRIGGER trg_academician_profiles_updated_at BEFORE UPDATE ON public.academician_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_industry_profiles_updated_at ON public.industry_profiles;
CREATE TRIGGER trg_industry_profiles_updated_at BEFORE UPDATE ON public.industry_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_institution_admin_profiles_updated_at ON public.institution_admin_profiles;
CREATE TRIGGER trg_institution_admin_profiles_updated_at BEFORE UPDATE ON public.institution_admin_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 8. SECURITY TRIGGER: IMMUTABLE ROLE & TENANCY PROTECTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_immutable_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Only super_admin or internal service role triggers can change role, institution_id, department_id, or verification_status
    IF current_user <> 'service_role' AND (
        NEW.role IS DISTINCT FROM OLD.role OR
        NEW.institution_id IS DISTINCT FROM OLD.institution_id OR
        NEW.department_id IS DISTINCT FROM OLD.department_id OR
        NEW.verification_status IS DISTINCT FROM OLD.verification_status
    ) THEN
        -- Allow if current session user is super_admin
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot modify their own role, institution, department, or verification status directly.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_immutable_profile_fields();
