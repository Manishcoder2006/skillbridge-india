import pytest
import jwt
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_multi_student_registration_and_profile_isolation():
    """
    Test 1: Full registration, login, and profile isolation for two distinct students.
    Verifies that newly registered accounts always see their own identity
    and NEVER the demo user (Aarav Sharma) or another student's profile.
    """
    # --------------------------------------------------------------------------
    # 1. Register Student A (Ananya Roy)
    # --------------------------------------------------------------------------
    student_a_payload = {
        "email": "ananya.roy.sih2026@test.com",
        "password": "Password123!",
        "full_name": "Ananya Roy",
        "role": "student",
        "institution_id": "a1000000-0000-0000-0000-000000000001",
        "department_id": "b1000000-0000-0000-0000-000000000001",
        "phone": "+91 9123456780"
    }

    res_reg_a = client.post("/api/v1/auth/register", json=student_a_payload)
    assert res_reg_a.status_code in [200, 201], f"Registration A failed: {res_reg_a.text}"
    data_reg_a = res_reg_a.json()
    assert data_reg_a["user"]["full_name"] == "Ananya Roy"
    assert data_reg_a["user"]["email"] == "ananya.roy.sih2026@test.com"
    student_a_id = data_reg_a["user"]["id"]
    token_a = data_reg_a["access_token"]

    # Student A Profile Fetch
    res_prof_a = client.get(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res_prof_a.status_code == 200
    data_a = res_prof_a.json()
    assert data_a["id"] == student_a_id
    assert data_a["full_name"] == "Ananya Roy"
    assert data_a["email"] == "ananya.roy.sih2026@test.com"
    assert data_a["full_name"] != "Aarav Sharma"
    assert data_a["email"] != "student@iitd.ac.in"

    # --------------------------------------------------------------------------
    # 2. Register Student B (Kabir Mehta)
    # --------------------------------------------------------------------------
    student_b_payload = {
        "email": "kabir.mehta.sih2026@test.com",
        "password": "Password123!",
        "full_name": "Kabir Mehta",
        "role": "student",
        "institution_id": "a1000000-0000-0000-0000-000000000002",
        "department_id": "b1000000-0000-0000-0000-000000000004",
        "phone": "+91 9876543299"
    }

    res_reg_b = client.post("/api/v1/auth/register", json=student_b_payload)
    assert res_reg_b.status_code in [200, 201], f"Registration B failed: {res_reg_b.text}"
    data_reg_b = res_reg_b.json()
    assert data_reg_b["user"]["full_name"] == "Kabir Mehta"
    assert data_reg_b["user"]["email"] == "kabir.mehta.sih2026@test.com"
    student_b_id = data_reg_b["user"]["id"]
    token_b = data_reg_b["access_token"]

    # Student B Profile Fetch
    res_prof_b = client.get(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res_prof_b.status_code == 200
    data_b = res_prof_b.json()
    assert data_b["id"] == student_b_id
    assert data_b["full_name"] == "Kabir Mehta"
    assert data_b["email"] == "kabir.mehta.sih2026@test.com"
    assert data_b["full_name"] != "Aarav Sharma"
    assert data_b["full_name"] != "Ananya Roy"

    # --------------------------------------------------------------------------
    # 3. Security Test: Anti-Tampering Query Parameter Protection
    # Student B attempts to access Student A's profile via query parameters
    # --------------------------------------------------------------------------
    res_tamper = client.get(
        f"/api/v1/student/profile?student_id={student_a_id}&user_id={student_a_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res_tamper.status_code == 200
    data_tamper = res_tamper.json()
    # Must STILL return Student B's profile, ignoring query parameter injection
    assert data_tamper["id"] == student_b_id
    assert data_tamper["full_name"] == "Kabir Mehta"
    assert data_tamper["full_name"] != "Ananya Roy"
    assert data_tamper["full_name"] != "Aarav Sharma"


def test_jwt_token_decoding_and_dynamic_identity():
    """
    Test 2: Verifies that when a live Supabase JWT is presented,
    FastAPI correctly resolves the authenticated user from the JWT payload
    and does NOT fall back to Aarav Sharma.
    """
    custom_uuid = "99999999-aaaa-bbbb-cccc-000000000099"
    jwt_payload = {
        "sub": custom_uuid,
        "email": "rohan.verma@testinstitute.edu",
        "user_metadata": {
            "full_name": "Rohan Verma",
            "role": "student",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "phone": "+91 9988776655"
        },
        "role": "authenticated",
        "aud": "authenticated",
        "exp": 1999999999
    }

    # Encode JWT without secret verification required on decoder
    simulated_jwt = jwt.encode(jwt_payload, "dummy_secret_for_test", algorithm="HS256")

    # Fetch profile using simulated Supabase JWT
    res = client.get(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {simulated_jwt}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == custom_uuid
    assert data["full_name"] == "Rohan Verma"
    assert data["email"] == "rohan.verma@testinstitute.edu"
    assert data["full_name"] != "Aarav Sharma"
    assert data["email"] != "student@iitd.ac.in"


def test_login_flow_preserves_new_user_identity():
    """
    Test 3: Verify that login via API retrieves the exact profile matching credentials.
    """
    email = "tanya.sen.sih2026@test.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Tanya Sen",
        "role": "student",
        "institution_id": "a1000000-0000-0000-0000-000000000001",
        "department_id": "b1000000-0000-0000-0000-000000000001",
    })

    res_login = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert login_data["user"]["full_name"] == "Tanya Sen"

    # Profile check with received access token
    res_prof = client.get(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {login_data['access_token']}"}
    )
    assert res_prof.status_code == 200
    assert res_prof.json()["full_name"] == "Tanya Sen"
    assert res_prof.json()["email"] == email
