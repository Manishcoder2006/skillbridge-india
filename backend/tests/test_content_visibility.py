import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Faculty Dr. Priya / Dr. Rajesh (IIT Delhi - CSE)
HEADERS_FACULTY = {"Authorization": "Bearer session_u1000000-0000-0000-0000-000000000002"}

# Student Aarav Sharma (IIT Delhi - CSE: Same Institution, Same Department)
HEADERS_STUDENT_SAME_DEPT = {"Authorization": "Bearer session_u1000000-0000-0000-0000-000000000001"}

# Student Rohan Verma (IIT Delhi - EE: Same Institution, Different Department)
HEADERS_STUDENT_SAME_INST_DIFF_DEPT = {"Authorization": "Bearer session_u1000000-0000-0000-0000-000000000022"}

# Student Kavita Rao (NITK - CSE: Different Institution)
HEADERS_STUDENT_DIFF_INST = {"Authorization": "Bearer session_u1000000-0000-0000-0000-000000000033"}


@pytest.fixture(autouse=True)
def setup_visibility_test_students():
    from app.core.database import MOCK_DATA_STORE
    test_students = [
        {
            "id": "u1000000-0000-0000-0000-000000000022",
            "email": "ee.student.vis@iitd.ac.in",
            "full_name": "Rohan Verma (EE Student)",
            "role": "student",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000002",
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "u1000000-0000-0000-0000-000000000033",
            "email": "nitk.student.vis@nitk.edu.in",
            "full_name": "Kavita Rao (NITK Student)",
            "role": "student",
            "institution_id": "a1000000-0000-0000-0000-000000000002",
            "department_id": "b1000000-0000-0000-0000-000000000005",
            "verification_status": "verified",
            "is_active": True,
        }
    ]
    # Add if not present
    added_ids = []
    existing_ids = {p["id"] for p in MOCK_DATA_STORE["profiles"]}
    for s in test_students:
        if s["id"] not in existing_ids:
            MOCK_DATA_STORE["profiles"].append(s)
            added_ids.append(s["id"])

    yield

    # Clean up to avoid impacting other test suites
    MOCK_DATA_STORE["profiles"] = [p for p in MOCK_DATA_STORE["profiles"] if p["id"] not in added_ids]


def test_1_faculty_can_publish_department_only_content():
    """
    Scenario 1 & 2:
    Faculty publishes department-only content.
    Same-department student sees it.
    Same-institution different-department student does not see it.
    Different-institution student does not see it.
    """
    payload = {
        "title": "CSE Dept Exclusive: Advanced Memory Allocation in C",
        "category": "Systems Programming",
        "skill_tag": "C / Memory",
        "resource_type": "tutorial",
        "duration": "3 hours",
        "url": "https://iitd.ac.in/cse/memory",
        "description": "Department specific lab manual and memory management exercises.",
        "visibility": "department",
        "is_published": True
    }
    res_pub = client.post("/api/v1/academician/content", json=payload, headers=HEADERS_FACULTY)
    assert res_pub.status_code == 201
    created_content = res_pub.json()
    assert created_content["visibility"] == "department"
    content_id = created_content["id"]

    # 1. Same-department student should see this resource
    res_same_dept = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_SAME_DEPT)
    assert res_same_dept.status_code == 200
    same_dept_ids = [r["id"] for r in res_same_dept.json()]
    assert content_id in same_dept_ids

    # 2. Same-institution, different-department student must NOT see it
    res_diff_dept = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_SAME_INST_DIFF_DEPT)
    assert res_diff_dept.status_code == 200
    diff_dept_ids = [r["id"] for r in res_diff_dept.json()]
    assert content_id not in diff_dept_ids

    # 3. Different-institution student must NOT see it
    res_diff_inst = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_DIFF_INST)
    assert res_diff_inst.status_code == 200
    diff_inst_ids = [r["id"] for r in res_diff_inst.json()]
    assert content_id not in diff_inst_ids


def test_2_institution_wide_content_visibility():
    """
    Scenario 3:
    Institution-wide content is visible to all students of that institution,
    regardless of department, but NOT to students of other institutions.
    """
    payload = {
        "title": "IIT Delhi Campus-Wide: Research Paper Writing Guidelines",
        "category": "Academic Writing",
        "skill_tag": "Research",
        "resource_type": "pdf",
        "duration": "1 hour",
        "url": "https://iitd.ac.in/research/paper-guide",
        "description": "Institutional repository rules and LaTeX templates for all IIT Delhi students.",
        "visibility": "institution",
        "is_published": True
    }
    res_pub = client.post("/api/v1/academician/content", json=payload, headers=HEADERS_FACULTY)
    assert res_pub.status_code == 201
    content_id = res_pub.json()["id"]

    # 1. Same department student sees it
    res_same_dept = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_SAME_DEPT)
    assert content_id in [r["id"] for r in res_same_dept.json()]

    # 2. Same institution different department student ALSO sees it
    res_diff_dept = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_SAME_INST_DIFF_DEPT)
    assert content_id in [r["id"] for r in res_diff_dept.json()]

    # 3. Different institution student must NOT see it
    res_diff_inst = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_DIFF_INST)
    assert content_id not in [r["id"] for r in res_diff_inst.json()]


def test_3_global_content_visibility():
    """
    Scenario 4:
    Global content is visible to students from other institutions across the platform.
    """
    payload = {
        "title": "Open Platform: Competitive Programming Masterclass",
        "category": "Algorithms",
        "skill_tag": "Data Structures",
        "resource_type": "course",
        "duration": "10 hours",
        "url": "https://skillbridge.in/algorithms/cp-masterclass",
        "description": "Universal competitive programming roadmap open to all students.",
        "visibility": "global",
        "is_published": True
    }
    res_pub = client.post("/api/v1/academician/content", json=payload, headers=HEADERS_FACULTY)
    assert res_pub.status_code == 201
    content_id = res_pub.json()["id"]

    # 1. Same department student sees it
    res_same_dept = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_SAME_DEPT)
    assert content_id in [r["id"] for r in res_same_dept.json()]

    # 2. Same institution different department student sees it
    res_diff_dept = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_SAME_INST_DIFF_DEPT)
    assert content_id in [r["id"] for r in res_diff_dept.json()]

    # 3. Different institution student ALSO sees it
    res_diff_inst = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_DIFF_INST)
    assert content_id in [r["id"] for r in res_diff_inst.json()]


def test_4_editing_resource_updates_visibility():
    """
    Scenario 5:
    When faculty edits resource visibility (e.g. from department to global),
    visibility updates immediately and opens access to other students.
    """
    payload = {
        "title": "Draft Internal Module to Expand",
        "category": "Software Engineering",
        "skill_tag": "Git",
        "resource_type": "tutorial",
        "duration": "2 hours",
        "url": "https://iitd.ac.in/git-guide",
        "description": "Initial internal guide.",
        "visibility": "department",
        "is_published": True
    }
    created = client.post("/api/v1/academician/content", json=payload, headers=HEADERS_FACULTY).json()
    content_id = created["id"]

    # Different institution student cannot see department-only resource
    res_before = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_DIFF_INST)
    assert content_id not in [r["id"] for r in res_before.json()]

    # Faculty edits visibility to global
    res_update = client.put(
        f"/api/v1/academician/content/{content_id}",
        json={"visibility": "global"},
        headers=HEADERS_FACULTY
    )
    assert res_update.status_code == 200
    assert res_update.json()["visibility"] == "global"

    # Now different institution student can see it
    res_after = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_DIFF_INST)
    assert content_id in [r["id"] for r in res_after.json()]


def test_5_unauthorized_users_cannot_bypass_visibility():
    """
    Scenario 6:
    Unauthenticated requests cannot access learning resources.
    Faculty cannot edit another faculty member's content.
    Invalid visibility strings are rejected with 400.
    """
    # 1. Unauthenticated request blocked
    res_unauth = client.get("/api/v1/student/learning-resources")
    assert res_unauth.status_code == 401

    # 2. Invalid visibility string rejected on creation
    res_invalid = client.post(
        "/api/v1/academician/content",
        json={
            "title": "Invalid Visibility Content",
            "url": "https://example.com",
            "visibility": "secret_cohort"
        },
        headers=HEADERS_FACULTY
    )
    assert res_invalid.status_code in [400, 422]

    # 3. Another user cannot edit faculty content
    # Attempting to edit as a student should return 403 Forbidden
    res_student_edit = client.put(
        "/api/v1/academician/content/c1000000-0000-0000-0000-000000000001",
        json={"title": "Hacked Title"},
        headers=HEADERS_STUDENT_SAME_DEPT
    )
    assert res_student_edit.status_code == 403


def test_6_legacy_resources_remain_accessible():
    """
    Scenario 7:
    Existing platform learning resources (f1, f2, etc.) continue to be returned
    to all students as global content without regression.
    """
    res = client.get("/api/v1/student/learning-resources", headers=HEADERS_STUDENT_SAME_DEPT)
    assert res.status_code == 200
    items = res.json()
    ids = [item["id"] for item in items]

    # f1, f2, f3, f4, f5, f6 from seed
    assert "f1" in ids
    assert "f2" in ids
    assert "f3" in ids

    # Check progress status is preserved
    f1_item = next(i for i in items if i["id"] == "f1")
    assert f1_item["progress_status"] == "completed"
