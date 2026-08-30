-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 6 Seed Data: National Skill Benchmarks & System Audit Logs
-- ============================================================================

INSERT INTO public.national_skill_benchmarks (skill_category, skill_name, industry_demand_score, student_proficiency_avg, gap_severity)
VALUES
    ('Full Stack & Web Architecture', 'React 18 & Frontend Frameworks', 95, 78, 'Moderate'),
    ('Backend & Cloud APIs', 'Python & FastAPI Microservices', 92, 72, 'Moderate'),
    ('DevOps & Containerization', 'Docker & Kubernetes', 88, 42, 'Critical'),
    ('Database & Multi-Tenancy', 'PostgreSQL & Row Level Security', 85, 54, 'Moderate'),
    ('Artificial Intelligence', 'Google Gemini & Groq API Integration', 90, 48, 'Critical'),
    ('Cloud Infrastructure', 'AWS & Cloud Deployment CI/CD', 86, 45, 'Critical')
ON CONFLICT (skill_name) DO NOTHING;

INSERT INTO public.admin_audit_logs (actor_id, action_type, target_entity, target_id, details)
VALUES
    ('u0000000-0000-0000-0000-000000000001', 'system_init', 'platform', 'skillbridge_core', '{"message": "Phase 6 platform governance initialized successfully"}'::jsonb),
    ('u0000000-0000-0000-0000-000000000001', 'institution_approve', 'institution', 'i1000000-0000-0000-0000-000000000001', '{"name": "IIT Delhi", "status": "verified"}'::jsonb),
    ('u0000000-0000-0000-0000-000000000001', 'company_verify', 'company', 'comp-001', '{"name": "Tata Consultancy Services", "tier": "Enterprise"}'::jsonb)
ON CONFLICT DO NOTHING;
