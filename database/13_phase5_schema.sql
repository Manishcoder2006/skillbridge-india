-- ============================================================================
-- SKILLBRIDGE INDIA — SIH 2026 PS 26044
-- Phase 5 Database Schema: AI Integration & Multi-Model Orchestration Logs
-- ============================================================================

-- 1. AI Request & Execution Logs
CREATE TABLE IF NOT EXISTS public.ai_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL,
    task_type VARCHAR(100) NOT NULL, -- skill_gap, career_guidance, learning_rec, resume_suggestion, candidate_match, cohort_insight, assistant_chat
    primary_model VARCHAR(50) NOT NULL, -- gemini-1.5-flash, grok-beta, multi_model_synthesis
    secondary_model VARCHAR(50),
    routing_strategy VARCHAR(50) DEFAULT 'auto', -- gemini_only, grok_only, hybrid_synthesis, fallback
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- completed, fallback_used, failed
    latency_ms INTEGER DEFAULT 0,
    tokens_estimated INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI Cached Recommendations (Performance & cost optimization)
CREATE TABLE IF NOT EXISTS public.ai_cached_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    response_json JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_task ON public.ai_request_logs(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON public.ai_cached_recommendations(cache_key);
