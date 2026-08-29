import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS_STUDENT = {"Authorization": "Bearer demo_token_student"}
HEADERS_FACULTY = {"Authorization": "Bearer demo_token_academician"}
HEADERS_HR = {"Authorization": "Bearer demo_token_industry_hr"}


def test_ai_engine_health():
    res = client.get("/api/v1/ai/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "gemini" in data["models"]
    assert "groq" in data["models"]


def test_student_skill_gap_analysis():
    payload = {
        "target_role": "Full Stack Cloud Engineer",
        "custom_skills": ["React", "Python", "FastAPI", "PostgreSQL"]
    }
    res = client.post("/api/v1/ai/student/skill-gap", json=payload, headers=HEADERS_STUDENT)
    assert res.status_code == 200
    data = res.json()
    assert data["target_role"] == payload["target_role"]
    assert data["readiness_percentage"] > 0
    assert len(data["strengths"]) > 0
    assert len(data["identified_gaps"]) > 0
    assert "ai_meta" in data


def test_student_career_recommendations():
    payload = {"interests": ["Cloud Architecture", "Backend Engineering"]}
    res = client.post("/api/v1/ai/student/career-recommendations", json=payload, headers=HEADERS_STUDENT)
    assert res.status_code == 200
    data = res.json()
    assert len(data["primary_recommendations"]) > 0
    first_path = data["primary_recommendations"][0]
    assert "role_title" in first_path
    assert "match_percentage" in first_path
    assert "ai_meta" in data


def test_student_learning_recommendations():
    payload = {"focus_skills": ["Docker", "Kubernetes"]}
    res = client.post("/api/v1/ai/student/learning-recommendations", json=payload, headers=HEADERS_STUDENT)
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommended_courses"]) > 0
    assert "ai_meta" in data


def test_student_resume_suggestions():
    payload = {
        "target_job_title": "Full Stack Developer",
        "custom_summary": "Motivated software engineer with experience in React and Python backend development."
    }
    res = client.post("/api/v1/ai/student/resume-suggestions", json=payload, headers=HEADERS_STUDENT)
    assert res.status_code == 200
    data = res.json()
    assert data["overall_ats_score"] >= 70
    assert len(data["enhanced_summary_draft"]) > 10
    assert len(data["recommended_keywords_to_add"]) > 0
    assert "ai_meta" in data


def test_industry_candidate_match():
    payload = {
        "opportunity_id": "g1000000-0000-0000-0000-000000000001",
        "model_mode": "hybrid"
    }
    res = client.post("/api/v1/ai/industry/candidate-match", json=payload, headers=HEADERS_HR)
    assert res.status_code == 200
    data = res.json()
    assert data["opportunity_id"] == payload["opportunity_id"]
    assert len(data["ranked_candidates"]) > 0
    top_cand = data["ranked_candidates"][0]
    assert top_cand["match_score"] > 0
    assert len(top_cand["matching_skills"]) > 0
    assert "ai_meta" in data


def test_academician_cohort_insights():
    payload = {"department_id": "b1000000-0000-0000-0000-000000000001"}
    res = client.post("/api/v1/ai/academician/student-insights", json=payload, headers=HEADERS_FACULTY)
    assert res.status_code == 200
    data = res.json()
    assert "mean_readiness_score" in data
    assert len(data["critical_cohort_skill_gaps"]) > 0
    assert len(data["pedagogical_interventions"]) > 0


def test_ai_assistant_chat():
    payload = {
        "message": "What career paths are recommended for a student with React and Python skills?",
        "conversation_history": []
    }
    res = client.post("/api/v1/ai/assistant/chat", json=payload, headers=HEADERS_STUDENT)
    assert res.status_code == 200
    data = res.json()
    assert len(data["reply"]) > 10
    assert data["role_context"] == "student"
    assert len(data["quick_suggestions"]) > 0


def test_unauthorized_role_blocked_from_specific_ai_routes():
    # Student attempting to access Industry Candidate Matching
    payload = {"opportunity_id": "g1000000-0000-0000-0000-000000000001"}
    res = client.post("/api/v1/ai/industry/candidate-match", json=payload, headers=HEADERS_STUDENT)
    assert res.status_code == 403
