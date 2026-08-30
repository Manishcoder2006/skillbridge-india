import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS_SUPER_ADMIN = {"Authorization": "Bearer demo_token_super_admin"}
HEADERS_STUDENT = {"Authorization": "Bearer demo_token_student"}
HEADERS_FACULTY = {"Authorization": "Bearer demo_token_academician"}


def test_admin_overview_telemetry():
    res = client.get("/api/v1/admin/overview", headers=HEADERS_SUPER_ADMIN)
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert "total_students" in data
    assert "total_institutions" in data
    assert data["platform_health"] == "Operational"


def test_admin_list_users_and_status_update():
    res = client.get("/api/v1/admin/users", headers=HEADERS_SUPER_ADMIN)
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 4
    student_user = users[0]
    
    # Update status
    res_update = client.patch(
        f"/api/v1/admin/users/{student_user['id']}/status",
        json={"status": "verified"},
        headers=HEADERS_SUPER_ADMIN
    )
    assert res_update.status_code == 200
    assert res_update.json()["user"]["verification_status"] == "verified"


def test_admin_list_institutions():
    res = client.get("/api/v1/admin/institutions", headers=HEADERS_SUPER_ADMIN)
    assert res.status_code == 200
    institutions = res.json()
    assert len(institutions) >= 1
    assert any(i["code"] == "IITD" for i in institutions)


def test_admin_list_companies_and_status():
    res = client.get("/api/v1/admin/companies", headers=HEADERS_SUPER_ADMIN)
    assert res.status_code == 200
    companies = res.json()
    assert len(companies) >= 1
    
    comp_id = companies[0]["id"]
    res_update = client.patch(
        f"/api/v1/admin/companies/{comp_id}/status",
        json={"status": "verified"},
        headers=HEADERS_SUPER_ADMIN
    )
    assert res_update.status_code == 200


def test_admin_opportunities_oversight():
    res = client.get("/api/v1/admin/opportunities", headers=HEADERS_SUPER_ADMIN)
    assert res.status_code == 200
    opps = res.json()
    assert len(opps) >= 1
    
    opp_id = opps[0]["id"]
    res_mod = client.patch(
        f"/api/v1/admin/opportunities/{opp_id}/status",
        json={"status": "active"},
        headers=HEADERS_SUPER_ADMIN
    )
    assert res_mod.status_code == 200


def test_admin_ai_telemetry():
    res = client.get("/api/v1/admin/ai-telemetry", headers=HEADERS_SUPER_ADMIN)
    assert res.status_code == 200
    data = res.json()
    assert "total_requests" in data
    assert "model_distribution" in data
    assert "average_latency_ms" in data


def test_admin_national_skill_benchmarks():
    res = client.get("/api/v1/admin/national-skills", headers=HEADERS_SUPER_ADMIN)
    assert res.status_code == 200
    data = res.json()
    assert "top_industry_demanded_skills" in data
    assert "macro_readiness_tiers" in data


def test_unauthorized_student_blocked_from_admin_endpoints():
    res = client.get("/api/v1/admin/overview", headers=HEADERS_STUDENT)
    assert res.status_code == 403

    res_faculty = client.get("/api/v1/admin/ai-telemetry", headers=HEADERS_FACULTY)
    assert res_faculty.status_code == 403
