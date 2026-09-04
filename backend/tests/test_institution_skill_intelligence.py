import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS_INSTITUTION_ADMIN = {"Authorization": "Bearer demo_token_institution_admin"}
HEADERS_STUDENT = {"Authorization": "Bearer demo_token_student"}
HEADERS_FACULTY = {"Authorization": "Bearer demo_token_academician"}


def test_institution_skill_intelligence_success():
    res = client.get("/api/v1/institutions/skill-intelligence", headers=HEADERS_INSTITUTION_ADMIN)
    assert res.status_code == 200
    data = res.json()
    assert "institution_id" in data
    assert "total_students" in data
    assert "total_assessed_students" in data
    assert "assessment_coverage_rate" in data
    assert "average_institutional_score" in data
    assert "strongest_skills" in data
    assert "critical_skill_gaps" in data
    assert "department_comparison" in data
    assert "competency_distribution" in data
    assert "historical_trends" in data
    assert data["total_students"] >= 1
    assert len(data["department_comparison"]) >= 1


def test_institution_skill_intelligence_unauthorized_student():
    res = client.get("/api/v1/institutions/skill-intelligence", headers=HEADERS_STUDENT)
    assert res.status_code == 403


def test_institution_skill_intelligence_unauthorized_faculty():
    res = client.get("/api/v1/institutions/skill-intelligence", headers=HEADERS_FACULTY)
    assert res.status_code == 403


def test_institution_skill_intelligence_unauthenticated():
    res = client.get("/api/v1/institutions/skill-intelligence")
    assert res.status_code == 401
