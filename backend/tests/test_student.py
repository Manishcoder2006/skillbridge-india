import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

STUDENT_AUTH_HEADER = {"Authorization": "Bearer demo_token_student"}
FACULTY_AUTH_HEADER = {"Authorization": "Bearer demo_token_academician"}

def test_student_dashboard_summary():
    response = client.get("/api/v1/student/dashboard-summary", headers=STUDENT_AUTH_HEADER)
    assert response.status_code == 200
    data = response.json()
    assert "profile_completion_percent" in data
    assert "total_skills_count" in data
    assert "career_paths" in data
    assert len(data["career_paths"]) > 0

def test_student_profile_get_and_update():
    get_res = client.get("/api/v1/student/profile", headers=STUDENT_AUTH_HEADER)
    assert get_res.status_code == 200
    prof = get_res.json()
    assert prof["role"] == "student"

    update_payload = {
        "full_name": "Aarav Sharma (SIH)",
        "location": "New Delhi, India",
        "program": "B.Tech Computer Science & Engineering",
        "current_semester": 7,
        "cgpa": 8.95
    }
    put_res = client.put("/api/v1/student/profile", json=update_payload, headers=STUDENT_AUTH_HEADER)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["full_name"] == "Aarav Sharma (SIH)"
    assert updated["current_semester"] == 7

def test_student_skills_flow():
    # 1. Add skill
    new_skill = {
        "skill_name": "TypeScript",
        "category": "technical",
        "proficiency_level": "intermediate"
    }
    post_res = client.post("/api/v1/student/skills", json=new_skill, headers=STUDENT_AUTH_HEADER)
    assert post_res.status_code == 200
    skill_data = post_res.json()
    assert skill_data["skill_name"] == "TypeScript"
    skill_id = skill_data["id"]

    # 2. List skills
    list_res = client.get("/api/v1/student/skills", headers=STUDENT_AUTH_HEADER)
    assert list_res.status_code == 200
    skills = list_res.json()
    assert any(s["skill_name"] == "TypeScript" for s in skills)

    # 3. Delete skill
    del_res = client.delete(f"/api/v1/student/skills/{skill_id}", headers=STUDENT_AUTH_HEADER)
    assert del_res.status_code == 200

def test_skill_assessment_and_scoring():
    # 1. List assessments
    list_res = client.get("/api/v1/student/assessments", headers=STUDENT_AUTH_HEADER)
    assert list_res.status_code == 200
    assessments = list_res.json()
    assert len(assessments) >= 1
    assessment_id = assessments[0]["id"]

    # 2. Get detail with questions
    detail_res = client.get(f"/api/v1/student/assessments/{assessment_id}", headers=STUDENT_AUTH_HEADER)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["questions"]) > 0

    # 3. Submit answers
    # Answer q-1 (React) correctly: index 1
    # Answer q-2 (REST APIs) correctly: index 1
    # Answer q-3 (Responsive CSS) correctly: index 1
    # Answer q-4 (Database Security) incorrectly: index 0
    # Answer q-5 (FastAPI) correctly: index 1
    submit_payload = {
        "answers": {
            "q-1": 1,
            "q-2": 1,
            "q-3": 1,
            "q-4": 0,
            "q-5": 1
        }
    }
    submit_res = client.post(
        f"/api/v1/student/assessments/{assessment_id}/submit",
        json=submit_payload,
        headers=STUDENT_AUTH_HEADER
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert result["score"] == 4
    assert result["percentage"] == 80.0
    assert result["passed"] is True
    assert "React" in result["strengths"]
    assert "Database Security" in result["skill_gaps"]

def test_learning_resources_and_progress():
    # 1. List learning resources
    res = client.get("/api/v1/student/learning-resources", headers=STUDENT_AUTH_HEADER)
    assert res.status_code == 200
    resources = res.json()
    assert len(resources) > 0
    resource_id = resources[0]["id"]

    # 2. Update progress
    progress_payload = {
        "resource_id": resource_id,
        "status": "completed",
        "progress_percent": 100
    }
    update_res = client.post("/api/v1/student/learning-progress", json=progress_payload, headers=STUDENT_AUTH_HEADER)
    assert update_res.status_code == 200

def test_opportunity_browsing_and_application():
    # 1. List opportunities
    opp_res = client.get("/api/v1/student/opportunities", headers=STUDENT_AUTH_HEADER)
    assert opp_res.status_code == 200
    opps = opp_res.json()
    assert len(opps) > 0
    # Pick an unapplied opportunity (e.g. index 2 or 3)
    target_opp_id = next((o["id"] for o in opps if not o.get("is_applied")), opps[2]["id"] if len(opps) > 2 else opps[0]["id"])

    # 2. Apply for opportunity
    apply_payload = {"notes": "Eager to contribute with React and Python experience."}
    apply_res = client.post(
        f"/api/v1/student/opportunities/{target_opp_id}/apply",
        json=apply_payload,
        headers=STUDENT_AUTH_HEADER
    )
    assert apply_res.status_code == 200
    app_data = apply_res.json()
    assert app_data["status"] == "applied"

    # 3. Verify in student applications list
    apps_res = client.get("/api/v1/student/applications", headers=STUDENT_AUTH_HEADER)
    assert apps_res.status_code == 200
    apps = apps_res.json()
    assert any(a["opportunity_id"] == target_opp_id for a in apps)

def test_student_resume_builder():
    # 1. Fetch resume
    get_res = client.get("/api/v1/student/resume", headers=STUDENT_AUTH_HEADER)
    assert get_res.status_code == 200
    resume = get_res.json()
    assert "data" in resume

    # 2. Update resume
    resume_payload = resume["data"]
    resume_payload["headline"] = "Full Stack Engineer & Open Source Contributor"
    put_res = client.put("/api/v1/student/resume", json=resume_payload, headers=STUDENT_AUTH_HEADER)
    assert put_res.status_code == 200
    updated_resume = put_res.json()
    assert updated_resume["data"]["headline"] == "Full Stack Engineer & Open Source Contributor"

def test_unauthorized_role_blocked_from_student_routes():
    # Faculty attempting to access student dashboard endpoint
    res = client.get("/api/v1/student/dashboard-summary", headers=FACULTY_AUTH_HEADER)
    assert res.status_code == 403
