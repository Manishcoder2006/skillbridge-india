import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_public_institution_endpoint_exposes_safe_fields_only():
    """
    Security Rule 8: Public listing must only expose safe onboarding info.
    """
    response = client.get("/api/v1/institutions/public")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for inst in data:
        assert "id" in inst
        assert "name" in inst
        assert "code" in inst
        assert "departments" in inst
        # Ensure private fields are NOT exposed
        assert "contact_phone" not in inst
        assert "contact_email" not in inst

def test_safe_profile_update_ignores_tampering_role_and_tenant():
    """
    Security Rule 2: Normal users cannot tamper with role or institution_id.
    """
    headers = {"Authorization": "Bearer demo_token_student"}
    tamper_payload = {
        "full_name": "Aarav Sharma Updated",
        "phone": "+91 9988776655",
        "role": "super_admin",               # Attempt to escalate role
        "institution_id": "fake-inst-id",    # Attempt to change tenant
        "verification_status": "verified"
    }
    response = client.put("/api/v1/users/profile", json=tamper_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    # Name and phone updated
    assert data["full_name"] == "Aarav Sharma Updated"
    assert data["phone"] == "+91 9988776655"
    # Role and tenant remain intact (tamper attempt was dropped)
    assert data["role"] == "student"
    assert data["institution_id"] == "a1000000-0000-0000-0000-000000000001"

def test_unauthorized_role_access_to_admin_endpoint_blocked():
    """
    Security Rule 4: Student attempting to access institution admin endpoint must receive 403 Forbidden.
    """
    headers = {"Authorization": "Bearer demo_token_student"}
    response = client.get("/api/v1/institutions/my-institution", headers=headers)
    assert response.status_code == 403

def test_institution_admin_can_access_own_institution():
    headers = {"Authorization": "Bearer demo_token_institution_admin"}
    response = client.get("/api/v1/institutions/my-institution", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "IITD"

def test_institution_admin_members_scoped_to_own_institution():
    headers = {"Authorization": "Bearer demo_token_institution_admin"}
    response = client.get("/api/v1/users/institution-members", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Every member returned belongs to IIT Delhi
    for member in data:
        assert member["email"] in ["student@iitd.ac.in", "faculty@iitd.ac.in", "admin@iitd.ac.in", "new_student_2026@test.com"]
