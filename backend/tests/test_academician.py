import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS_FACULTY = {"Authorization": "Bearer demo_token_academician"}
HEADERS_STUDENT = {"Authorization": "Bearer demo_token_student"}
HEADERS_SUPER_ADMIN = {"Authorization": "Bearer demo_token_super_admin"}


def test_academician_dashboard_summary():
    res = client.get("/api/v1/academician/dashboard-summary", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    data = res.json()
    assert data["total_authorized_students"] >= 1
    assert "students_needing_attention_count" in data
    assert "assessment_completion_rate" in data
    assert "recent_student_activities" in data
    assert "recent_notifications" in data


def test_academician_profile_get_and_update():
    # Get profile
    res = client.get("/api/v1/academician/profile", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    data = res.json()
    assert "Dr." in data["full_name"]
    assert data["role"] == "academician"
    assert "Delhi" in data["institution_name"]

    # Update profile
    update_payload = {
        "designation": "Senior Professor & Dean of Academics",
        "experience_years": 16,
        "research_interests": ["Cloud Architecture", "Distributed Consensus", "Verifiable AI"]
    }
    res_update = client.put("/api/v1/academician/profile", json=update_payload, headers=HEADERS_FACULTY)
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["designation"] == "Senior Professor & Dean of Academics"
    assert updated["experience_years"] == 16


def test_authorized_students_roster_and_filtering():
    # All authorized students
    res = client.get("/api/v1/academician/students", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    students = res.json()
    assert len(students) >= 1
    # Check student names
    names = [s["full_name"] for s in students]
    assert "Aarav Sharma" in names

    # Search filter
    res_search = client.get("/api/v1/academician/students?search=Aarav", headers=HEADERS_FACULTY)
    assert res_search.status_code == 200
    assert len(res_search.json()) == 1
    assert res_search.json()[0]["full_name"] == "Aarav Sharma"

    # Status filter (attention)
    res_att = client.get("/api/v1/academician/students?status=attention", headers=HEADERS_FACULTY)
    assert res_att.status_code == 200
    for s in res_att.json():
        assert s["needs_attention"] is True


def test_authorized_student_detail_view():
    student_id = "u1000000-0000-0000-0000-000000000001"
    res = client.get(f"/api/v1/academician/students/{student_id}", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    data = res.json()
    assert data["full_name"] == "Aarav Sharma"
    assert "skills" in data
    assert "assessment_history" in data
    assert "projects" in data


def test_cross_institution_unauthorized_student_access_rejected():
    # Attempt to access student from IIT Madras (u2000000-0000-0000-0000-000000000099)
    foreign_student_id = "u2000000-0000-0000-0000-000000000099"
    res = client.get(f"/api/v1/academician/students/{foreign_student_id}", headers=HEADERS_FACULTY)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]


def test_student_analytics_aggregation():
    res = client.get("/api/v1/academician/analytics", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    data = res.json()
    assert data["total_authorized_students"] >= 1
    assert "top_verified_skills" in data
    assert "top_skill_gaps" in data
    assert "placement_readiness_breakdown" in data


def test_learning_content_crud():
    # Create
    new_content = {
        "title": "Asynchronous Event Driven Architectures",
        "category": "Cloud Computing",
        "skill_tag": "FastAPI",
        "resource_type": "workshop",
        "url": "https://fastapi.tiangolo.com/events",
        "description": "Comprehensive design tutorial for background queues and WebSockets.",
        "visibility": "department",
        "is_published": True
    }
    res_create = client.post("/api/v1/academician/content", json=new_content, headers=HEADERS_FACULTY)
    assert res_create.status_code == 201
    created = res_create.json()
    content_id = created["id"]
    assert created["title"] == new_content["title"]

    # Update
    res_update = client.put(
        f"/api/v1/academician/content/{content_id}",
        json={"title": "Asynchronous Event Driven Architectures (Updated Edition)"},
        headers=HEADERS_FACULTY
    )
    assert res_update.status_code == 200
    assert res_update.json()["title"] == "Asynchronous Event Driven Architectures (Updated Edition)"

    # Delete
    res_delete = client.delete(f"/api/v1/academician/content/{content_id}", headers=HEADERS_FACULTY)
    assert res_delete.status_code == 200
    assert res_delete.json()["success"] is True


def test_opportunity_discovery_and_recommendation():
    # List opportunities
    res = client.get("/api/v1/academician/opportunities", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    opps = res.json()
    assert len(opps) >= 1
    target_opp_id = opps[0]["id"]

    # Recommend to cohort
    rec_payload = {
        "opportunity_id": target_opp_id,
        "message": "Highly recommended for 3rd and 4th year CSE students."
    }
    res_rec = client.post(
        f"/api/v1/academician/opportunities/{target_opp_id}/recommend",
        json=rec_payload,
        headers=HEADERS_FACULTY
    )
    assert res_rec.status_code == 201
    assert res_rec.json()["opportunity_id"] == target_opp_id


def test_industry_collaboration_initiatives_and_participation():
    # List
    res = client.get("/api/v1/academician/collaboration", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    inits = res.json()
    assert len(inits) >= 1
    target_init_id = inits[0]["id"]

    # Express interest
    part_payload = {
        "interest_note": "Interested in participating as a Faculty Research Fellow."
    }
    res_part = client.post(
        f"/api/v1/academician/collaboration/{target_init_id}/participate",
        json=part_payload,
        headers=HEADERS_FACULTY
    )
    assert res_part.status_code == 201
    assert res_part.json()["status"] == "expressed"


def test_notifications_flow():
    # List notifications
    res = client.get("/api/v1/academician/notifications", headers=HEADERS_FACULTY)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 1

    # Mark all read
    res_read_all = client.put("/api/v1/academician/notifications/read-all", headers=HEADERS_FACULTY)
    assert res_read_all.status_code == 200
    assert "marked_count" in res_read_all.json()


def test_unauthorized_student_blocked_from_academician_routes():
    # Student role trying to access academician dashboard
    res = client.get("/api/v1/academician/dashboard-summary", headers=HEADERS_STUDENT)
    assert res.status_code == 403
    assert "not authorized" in res.json()["detail"].lower() or "forbidden" in res.json()["detail"].lower()
