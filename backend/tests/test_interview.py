import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS_STUDENT = {"Authorization": "Bearer demo_token_student"}


def test_interview_lifecycle():
    # 1. Start interview
    start_payload = {
        "interview_type": "technical",
        "role": "Full Stack Developer",
        "experience_level": "intermediate",
        "skills": ["React", "FastAPI", "PostgreSQL", "Docker"],
        "interview_focus": "technical",
        "number_of_questions": 3,
        "resume_personalization": False
    }

    start_res = client.post("/api/v1/interviews/start", json=start_payload, headers=HEADERS_STUDENT)
    assert start_res.status_code in [200, 201], f"Start failed: {start_res.text}"
    session = start_res.json()
    interview_id = session["id"]
    assert session["role"] == "Full Stack Developer"
    assert len(session["questions"]) > 0

    first_q = session["questions"][0]
    first_q_id = first_q["id"]

    # 2. Submit candidate's spoken answer to Question 1
    answer_payload = {
        "question_id": first_q_id,
        "answer_text": "I design backends using a layered architecture with FastAPI, async route handlers, connection pooling in PostgreSQL, and Docker containerization."
    }
    ans_res = client.post(f"/api/v1/interviews/{interview_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
    assert ans_res.status_code == 200, f"Answer submit failed: {ans_res.text}"
    ans_data = ans_res.json()
    assert "score" in ans_data
    assert ans_data["score"] >= 0
    assert len(ans_data["strengths"]) > 0

    # 3. Adaptive next-question generation
    next_res = client.post(f"/api/v1/interviews/{interview_id}/next-question", headers=HEADERS_STUDENT)
    assert next_res.status_code == 200, f"Next question failed: {next_res.text}"
    next_q = next_res.json()
    if next_q:
        assert "question_text" in next_q
        assert "category" in next_q

    # 4. Complete interview and synthesize multi-model report
    comp_res = client.post(f"/api/v1/interviews/{interview_id}/complete", headers=HEADERS_STUDENT)
    assert comp_res.status_code == 200, f"Complete failed: {comp_res.text}"
    report = comp_res.json()
    assert report["overall_score"] >= 0
    assert len(report["category_scores"]) > 0
    assert len(report["strengths"]) > 0
    assert len(report["question_reviews"]) > 0

    # 5. Fetch report directly
    rep_res = client.get(f"/api/v1/interviews/{interview_id}/report", headers=HEADERS_STUDENT)
    assert rep_res.status_code == 200
    assert rep_res.json()["interview_id"] == interview_id

    # 6. Fetch interview history
    hist_res = client.get("/api/v1/interviews/history", headers=HEADERS_STUDENT)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) > 0
