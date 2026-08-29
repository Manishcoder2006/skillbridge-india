-- ==============================================================================
-- SkillBridge India - Phase 3 Seed Data: Academician Ecosystem
-- ==============================================================================

-- 1. Faculty Learning Content
INSERT INTO public.faculty_learning_content (id, academician_id, institution_id, department_id, title, category, skill_tag, resource_type, url, description, visibility, is_published)
VALUES
    ('c1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'High-Concurrency Database Architecture & RLS', 'Databases', 'PostgreSQL', 'workshop', 'https://internal.iitd.ac.in/cs/rls-guide', 'Faculty lecture notes and practical code patterns for PostgreSQL Row Level Security in multi-tenant cloud applications.', 'department', true),
    ('c1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'FastAPI Microservices Design Principles', 'Backend Engineering', 'FastAPI', 'tutorial', 'https://internal.iitd.ac.in/cs/fastapi-design', 'Design patterns for asynchronous Python microservices and Pydantic validation layers.', 'institution', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Industry Collaboration Initiatives
INSERT INTO public.industry_collaboration_initiatives (id, title, category, company_name, description, mode, duration, deadline, status)
VALUES
    ('i1000000-0000-0000-0000-000000000001', 'TCS AI Innovation & Distributed Systems Joint R&D', 'joint_research', 'Tata Consultancy Services', 'Faculty research collaboration on distributed consensus algorithms and verifiable multi-tenant systems. Travel & compute grants included.', 'hybrid', '6 Months', '2026-11-30', 'open'),
    ('i1000000-0000-0000-0000-000000000002', 'Infosys National Cloud Architecture Faculty Development Program', 'faculty_development', 'Infosys Limited', 'Hands-on training for academicians in container orchestration, microservices monitoring, and industrial CI/CD workflows.', 'online', '2 Weeks', '2026-10-15', 'open'),
    ('i1000000-0000-0000-0000-000000000003', 'L&T Smart Infrastructure Industry Mentorship Initiative', 'mentorship', 'Larsen & Toubro', 'Engage as a faculty co-mentor for student hackathon teams working on national infrastructure digitization.', 'hybrid', '4 Weeks', '2026-10-25', 'open')
ON CONFLICT (id) DO NOTHING;

-- 3. Opportunity Recommendations
INSERT INTO public.opportunity_recommendations (id, academician_id, opportunity_id, institution_id, department_id, message)
VALUES
    ('r1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000002', 'g1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Recommended for 3rd and 4th-year CSE students proficient in React and Python. TCS Innovation Labs internship.')
ON CONFLICT (id) DO NOTHING;

-- 4. Notifications
INSERT INTO public.notifications (id, recipient_id, title, message, type, is_read, link_url)
VALUES
    ('n1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000002', 'Student Assessment Milestone', 'Aarav Sharma completed Full Stack Web Development Readiness with an 80% score.', 'student', false, '/dashboard/academician/students'),
    ('n1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000002', 'New Industry Collaboration Open', 'TCS AI Innovation Joint R&D program is now accepting faculty expressions of interest.', 'collaboration', false, '/dashboard/academician/collaboration'),
    ('n1000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000002', 'Department Opportunity Posted', 'New Associate Software Engineer opportunity posted by Infosys matching 12 department students.', 'opportunity', true, '/dashboard/academician/opportunities')
ON CONFLICT (id) DO NOTHING;
