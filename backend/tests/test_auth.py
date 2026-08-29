import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_super_admin_self_registration_rejected():
    """
    Security Rule 1: Public/self registration as Super Admin MUST be strictly rejected!
    """
    payload = {
        "email": "hacker_admin@test.com",
        "password": "Password123!",
        "full_name": "Fake Admin",
        "role": "super_admin"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422  # Pydantic validation rejection

def test_institution_admin_self_registration_rejected():
    """
    Security Rule 3: Public/self registration as Institution Admin MUST be strictly rejected!
    """
    payload = {
        "email": "fake_inst_admin@test.com",
        "password": "Password123!",
        "full_name": "Fake Inst Admin",
        "role": "institution_admin",
        "institution_id": "a1000000-0000-0000-0000-000000000001"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422

def test_student_registration_success():
    payload = {
        "email": "new_student_2026@test.com",
        "password": "Password123!",
        "full_name": "Rohan Gupta",
        "role": "student",
        "institution_id": "a1000000-0000-0000-0000-000000000001",
        "department_id": "b1000000-0000-0000-0000-000000000001",
        "phone": "+91 9999988888"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "new_student_2026@test.com"
    assert data["user"]["role"] == "student"
    assert "access_token" in data

def test_student_login():
    payload = {
        "email": "student@iitd.ac.in",
        "password": "any_dev_password"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "student"
    assert "access_token" in data

def test_unauthenticated_protected_route_blocked():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_authenticated_profile_retrieval():
    headers = {"Authorization": "Bearer demo_token_student"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "student"
    assert data["email"] == "student@iitd.ac.in"
