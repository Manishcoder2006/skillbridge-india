-- ==============================================================================
-- SkillBridge India - Foundation Seed Data (Phase 1)
-- ==============================================================================

-- 1. Sample Institutions
INSERT INTO public.institutions (id, name, code, type, website, city, state, contact_email, verification_status, is_active)
VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Indian Institute of Technology Delhi', 'IITD', 'iit_nit_iiit', 'https://home.iitd.ac.in', 'New Delhi', 'Delhi', 'admin@iitd.ac.in', 'verified', true),
    ('a1000000-0000-0000-0000-000000000002', 'National Institute of Technology Karnataka', 'NITK', 'iit_nit_iiit', 'https://www.nitk.ac.in', 'Surathkal', 'Karnataka', 'admin@nitk.edu.in', 'verified', true),
    ('a1000000-0000-0000-0000-000000000003', 'College of Engineering, Guindy', 'CEG-AU', 'autonomous_college', 'https://ceg.annauniv.edu', 'Chennai', 'Tamil Nadu', 'dean@ceg.annauniv.edu', 'verified', true),
    ('a1000000-0000-0000-0000-000000000004', 'Pune Institute of Computer Technology', 'PICT', 'affiliated_college', 'https://pict.edu', 'Pune', 'Maharashtra', 'principal@pict.edu', 'verified', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Sample Departments
INSERT INTO public.departments (id, institution_id, name, code, description)
VALUES
    -- IIT Delhi Departments
    ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science & Engineering'),
    ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Electrical Engineering', 'EE', 'Department of Electrical Engineering'),
    ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering'),

    -- NITK Surathkal Departments
    ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Information Technology', 'IT', 'Department of Information Technology'),
    ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science & Engineering'),
    ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Electronics & Communication', 'ECE', 'Department of ECE'),

    -- CEG Anna University Departments
    ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science'),
    ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Information Science and Technology', 'IST', 'Department of IST'),

    -- PICT Departments
    ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'Computer Engineering', 'COMP', 'Department of Computer Engineering'),
    ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004', 'Artificial Intelligence & Data Science', 'AIDS', 'Department of AI & Data Science')
ON CONFLICT (institution_id, code) DO NOTHING;

-- 3. Sample Companies (Industry Tenancy)
INSERT INTO public.companies (id, name, industry_sector, website, headquarters, verification_status, is_active)
VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Tata Consultancy Services', 'Information Technology & Consulting', 'https://www.tcs.com', 'Mumbai', 'verified', true),
    ('c1000000-0000-0000-0000-000000000002', 'Infosys Limited', 'IT Services', 'https://www.infosys.com', 'Bengaluru', 'verified', true),
    ('c1000000-0000-0000-0000-000000000003', 'Larsen & Toubro', 'Engineering & Construction', 'https://www.larsentoubro.com', 'Mumbai', 'verified', true)
ON CONFLICT (id) DO NOTHING;
