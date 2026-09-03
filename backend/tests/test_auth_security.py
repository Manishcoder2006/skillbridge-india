import time
import jwt
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

LEARNING_PATH_PAYLOAD = {
    "topic": "Frontend Development",
    "difficulty": "beginner",
    "learning_goal": "interview_prep"
}

def create_simulated_jwt(role="student", expired=False, sub="u1000000-0000-0000-0000-000000000001"):
    exp_time = int(time.time()) - 3600 if expired else int(time.time()) + 3600
    payload = {
        "sub": sub,
        "email": f"{role}@skillbridge.edu",
        "user_metadata": {
            "full_name": f"Test {role.title()}",
            "role": role,
        },
        "role": "authenticated",
        "aud": "authenticated",
        "exp": exp_time,
    }
    return jwt.encode(payload, "test_secret", algorithm="HS256")


def test_1_valid_student_supabase_jwt_allowed():
    """1. Valid student Supabase JWT is accepted by the learning endpoint."""
    valid_jwt = create_simulated_jwt(role="student")
    res = client.get("/api/v1/learning/ai/paths", headers={"Authorization": f"Bearer {valid_jwt}"})
    assert res.status_code == 200, f"Expected 200 for valid student JWT, got {res.status_code}: {res.text}"


def test_2_expired_jwt_rejected():
    """2. Expired JWT is strictly rejected with HTTP 401."""
    expired_jwt = create_simulated_jwt(role="student", expired=True)
    res = client.post(
        "/api/v1/learning/ai/path",
        json=LEARNING_PATH_PAYLOAD,
        headers={"Authorization": f"Bearer {expired_jwt}"}
    )
    assert res.status_code == 401, f"Expected 401 for expired JWT, got {res.status_code}: {res.text}"
    assert "detail" in res.json()


def test_3_invalid_garbage_jwt_rejected():
    """3. Malformed/invalid token is strictly rejected with HTTP 401."""
    res = client.post(
        "/api/v1/learning/ai/path",
        json=LEARNING_PATH_PAYLOAD,
        headers={"Authorization": "Bearer not_a_valid_jwt_token_12345"}
    )
    assert res.status_code == 401, f"Expected 401 for garbage token, got {res.status_code}: {res.text}"


def test_4_missing_token_rejected():
    """4. Request with missing Authorization header is strictly rejected with HTTP 401."""
    res = client.post("/api/v1/learning/ai/path", json=LEARNING_PATH_PAYLOAD)
    assert res.status_code == 401, f"Expected 401 for missing token, got {res.status_code}: {res.text}"


def test_5_non_student_role_forbidden():
    """5. Valid non-student token (e.g. industry HR or faculty) is rejected with HTTP 403 Forbidden."""
    hr_jwt = create_simulated_jwt(role="industry_hr", sub="h1000000-0000-0000-0000-000000000001")
    res = client.post(
        "/api/v1/learning/ai/path",
        json=LEARNING_PATH_PAYLOAD,
        headers={"Authorization": f"Bearer {hr_jwt}"}
    )
    assert res.status_code == 403, f"Expected 403 for non-student role, got {res.status_code}: {res.text}"


def test_6_learning_endpoint_strictly_requires_auth():
    """6. Direct role strings without valid token structure are rejected."""
    res = client.post(
        "/api/v1/learning/ai/path",
        json=LEARNING_PATH_PAYLOAD,
        headers={"Authorization": "Bearer student"}
    )
    assert res.status_code == 401, f"Expected 401 for plain role string, got {res.status_code}: {res.text}"
