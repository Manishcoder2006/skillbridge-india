-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 4 Seed Data: Industry / HR Ecosystem
-- ============================================================================

-- 1. Seed Companies
INSERT INTO public.companies (
    id, name, code, industry_type, website, logo_url, description, company_size, founded_year, company_type, headquarters_city, headquarters_state, contact_email, contact_phone, tech_stack, verification_status
) VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'Tata Consultancy Services',
    'TCS',
    'Information Technology & Cloud Services',
    'https://www.tcs.com',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128',
    'Tata Consultancy Services is an IT services, consulting and business solutions organization that has been partnering with many of the worlds largest businesses in their transformation journeys.',
    '100000+',
    1968,
    'mnc',
    'Mumbai',
    'Maharashtra',
    'careers@tcs.com',
    '+91 22 6778 9999',
    ARRAY['React', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes']::TEXT[],
    'verified'
),
(
    'c1000000-0000-0000-0000-000000000002',
    'Infosys Limited',
    'INFOSYS',
    'Digital Services & Enterprise Consulting',
    'https://www.infosys.com',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128',
    'Infosys is a global leader in next-generation digital services and consulting. We enable clients in more than 50 countries to navigate their digital transformation.',
    '100000+',
    1981,
    'mnc',
    'Bengaluru',
    'Karnataka',
    'campus@infosys.com',
    '+91 80 2852 0261',
    ARRAY['Python', 'Java', 'Spring Boot', 'React', 'Azure', 'Data Structures']::TEXT[],
    'verified'
),
(
    'c1000000-0000-0000-0000-000000000003',
    'L&T Technology Services',
    'LTTS',
    'Engineering R&D & Embedded Systems',
    'https://www.ltts.com',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=128',
    'L&T Technology Services (LTTS) is a global leader in Engineering and R&D (ER&D) services, partnering with 69 of the Fortune 500 companies.',
    '20000-50000',
    2012,
    'enterprise',
    'Vadodara',
    'Gujarat',
    'hr@ltts.com',
    '+91 265 670 5000',
    ARRAY['C++', 'Python', 'Embedded Systems', 'IoT', 'Linux', 'ROS']::TEXT[],
    'verified'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Link Demo HR User (Priya Nair) to TCS
INSERT INTO public.company_members (
    id, company_id, user_id, designation, department, is_primary_contact
) VALUES (
    'cm100000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000003',
    'Lead Technical Talent Partner',
    'Campus & Academic Relations',
    TRUE
)
ON CONFLICT (company_id, user_id) DO NOTHING;

-- 3. Update existing opportunities with company_id linkage
UPDATE public.opportunities
SET company_id = 'c1000000-0000-0000-0000-000000000001',
    created_by_user_id = 'u1000000-0000-0000-0000-000000000003',
    status = 'active',
    openings_count = 15
WHERE id = 'g1000000-0000-0000-0000-000000000001';

UPDATE public.opportunities
SET company_id = 'c1000000-0000-0000-0000-000000000002',
    status = 'active',
    openings_count = 25
WHERE id = 'g1000000-0000-0000-0000-000000000002';
