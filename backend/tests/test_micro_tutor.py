import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS_STUDENT = {"Authorization": "Bearer demo_token_student"}

def test_micro_learning_path_lifecycle():
    # 1. Generate micro-learning path
    payload = {
        "topic": "Frontend Development",
        "difficulty": "beginner",
        "learning_goal": "interview_prep"
    }
    res = client.post("/api/v1/learning/ai/path", json=payload, headers=HEADERS_STUDENT)
    assert res.status_code == 201, f"Generate path failed: {res.text}"
    path_data = res.json()
    assert "id" in path_data
    path_id = path_data["id"]
    assert path_data["topic"] == "Frontend Development"
    assert len(path_data["lessons"]) >= 4

    first_lesson = path_data["lessons"][0]
    assert first_lesson["lesson_number"] == 1
    assert "script" in first_lesson
    assert "objective" in first_lesson

    # 2. Retrieve student learning paths
    list_res = client.get("/api/v1/learning/ai/paths", headers=HEADERS_STUDENT)
    assert list_res.status_code == 200
    paths_list = list_res.json()
    assert len(paths_list) > 0
    assert any(p["id"] == path_id for p in paths_list)

    # 3. Retrieve specific path by id
    get_res = client.get(f"/api/v1/learning/ai/path/{path_id}", headers=HEADERS_STUDENT)
    assert get_res.status_code == 200
    retrieved_path = get_res.json()
    assert retrieved_path["id"] == path_id
    assert len(retrieved_path["lessons"]) == len(path_data["lessons"])

    # 4. Contextual Ask AI Tutor
    ask_payload = {
        "path_id": path_id,
        "lesson_number": 1,
        "lesson_title": first_lesson["title"],
        "question": "What is the most crucial skill for a junior frontend developer?",
        "context_script": first_lesson["script"]
    }
    ask_res = client.post("/api/v1/learning/ai/ask", json=ask_payload, headers=HEADERS_STUDENT)
    assert ask_res.status_code == 200, f"Ask tutor failed: {ask_res.text}"
    ask_data = ask_res.json()
    assert "answer" in ask_data
    assert len(ask_data["answer"]) > 10
    assert "key_takeaway" in ask_data

    # 5. Update lesson progress
    progress_payload = {
        "path_id": path_id,
        "lesson_number": 1,
        "is_completed": True
    }
    prog_res = client.post("/api/v1/learning/ai/progress", json=progress_payload, headers=HEADERS_STUDENT)
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["is_completed"] is True

    # 6. Verify progress updated in path
    check_res = client.get(f"/api/v1/learning/ai/path/{path_id}", headers=HEADERS_STUDENT)
    assert check_res.status_code == 200
    updated_lessons = check_res.json()["lessons"]
    assert updated_lessons[0]["is_completed"] is True
