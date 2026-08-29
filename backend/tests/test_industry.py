import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS_HR = {
    "Authorization": "Bearer demo_token_industry_hr"
}

HEADERS_STUDENT = {
    "Authorization": "Bearer demo_token_student"
}


def test_industry_dashboard_summary():
    res = client.get("/api/v1/industry/dashboard-summary", headers=HEADERS_HR)
    assert res.status_code == 200
    data = res.json()
    assert "company" in data
    assert "active_jobs" in data
    assert "total_applications" in data
    assert "recent_applications" in data


def test_company_profile_get_and_update():
    # Get profile
    res = client.get("/api/v1/industry/company-profile", headers=HEADERS_HR)
    assert res.status_code == 200
    data = res.json()
    assert "Tata Consultancy Services" in data["name"]
    assert data["verification_status"] == "verified"

    # Update profile
    update_payload = {
        "description": "Global leader in IT consulting and digital transformation services.",
        "company_size": "100000+",
        "tech_stack": ["React", "Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Kubernetes", "Next.js"]
    }
    res_update = client.put("/api/v1/industry/company-profile", json=update_payload, headers=HEADERS_HR)
    assert res_update.status_code == 200
    updated_data = res_update.json()
    assert updated_data["description"] == update_payload["description"]
    assert "Next.js" in updated_data["tech_stack"]


def test_job_and_internship_postings_crud():
    # 1. Create a new Job Posting
    job_payload = {
        "title": "Cloud DevOps Engineer (Associate)",
        "type": "job",
        "description": "Build high-availability CI/CD deployment pipelines and manage multi-region cloud infrastructure.",
        "required_skills": ["Docker", "Kubernetes", "Python", "Linux"],
        "preferred_skills": ["Terraform", "AWS"],
        "eligibility": "B.Tech CSE/IT 2026 Batch with CGPA >= 7.0",
        "location": "Bengaluru",
        "work_mode": "hybrid",
        "stipend_or_salary": "₹9.5 LPA",
        "openings_count": 8,
        "application_deadline": "2026-12-31",
        "status": "active"
    }
    res_create = client.post("/api/v1/industry/postings", json=job_payload, headers=HEADERS_HR)
    assert res_create.status_code == 201
    created_job = res_create.json()
    assert created_job["title"] == job_payload["title"]
    assert created_job["openings_count"] == 8
    job_id = created_job["id"]

    # 2. List Postings
    res_list = client.get("/api/v1/industry/postings", headers=HEADERS_HR)
    assert res_list.status_code == 200
    postings = res_list.json()
    assert any(p["id"] == job_id for p in postings)

    # 3. Update Posting
    update_payload = {
        "openings_count": 12,
        "stipend_or_salary": "₹10.5 LPA"
    }
    res_update = client.put(f"/api/v1/industry/postings/{job_id}", json=update_payload, headers=HEADERS_HR)
    assert res_update.status_code == 200
    assert res_update.json()["openings_count"] == 12

    # 4. Delete Posting
    res_delete = client.delete(f"/api/v1/industry/postings/{job_id}", headers=HEADERS_HR)
    assert res_delete.status_code == 200
    assert res_delete.json()["success"] is True


def test_applications_management_and_status_update():
    # 1. List Applications
    res = client.get("/api/v1/industry/applications", headers=HEADERS_HR)
    assert res.status_code == 200
    apps = res.json()
    assert len(apps) >= 1
    app_id = apps[0]["application_id"]
    student_id = apps[0]["student_id"]

    # 2. Update status to 'shortlisted'
    status_payload = {
        "status": "shortlisted",
        "review_notes": "Candidate demonstrates strong full stack foundation and verified React skills."
    }
    res_status = client.put(
        f"/api/v1/industry/applications/{app_id}/status",
        json=status_payload,
        headers=HEADERS_HR
    )
    assert res_status.status_code == 200
    updated_app = res_status.json()
    assert updated_app["status"] == "shortlisted"

    # 3. Update status to 'interview' with schedule
    interview_payload = {
        "status": "interview",
        "review_notes": "Round 1 Technical System Design scheduled.",
        "interview_scheduled_at": "2026-09-05T10:00:00Z",
        "interview_link": "https://meet.skillbridge.in/tcs-interview-101"
    }
    res_interview = client.put(
        f"/api/v1/industry/applications/{app_id}/status",
        json=interview_payload,
        headers=HEADERS_HR
    )
    assert res_interview.status_code == 200
    assert res_interview.json()["status"] == "interview"


def test_candidate_recruiter_profile_view():
    student_id = "u1000000-0000-0000-0000-000000000001"
    res = client.get(f"/api/v1/industry/candidates/{student_id}", headers=HEADERS_HR)
    assert res.status_code == 200
    cand = res.json()
    assert cand["student_id"] == student_id
    assert "Aarav" in cand["full_name"]
    assert "verified_skills" in cand
    assert "projects" in cand
    assert "resume_summary" in cand


def test_ai_candidate_matching_foundation():
    opp_id = "g1000000-0000-0000-0000-000000000001"
    res = client.get(f"/api/v1/industry/matching/{opp_id}", headers=HEADERS_HR)
    assert res.status_code == 200
    match_data = res.json()
    assert match_data["opportunity_id"] == opp_id
    assert len(match_data["matched_candidates"]) >= 1
    top_cand = match_data["matched_candidates"][0]
    assert "match_score" in top_cand
    assert "matched_skills" in top_cand
    assert "compatibility_tier" in top_cand


def test_industry_collaboration_proposal():
    # 1. List proposals
    res_list = client.get("/api/v1/industry/collaboration", headers=HEADERS_HR)
    assert res_list.status_code == 200

    # 2. Create proposal
    proposal_payload = {
        "title": "National Hackathon: Autonomous Cloud Systems 2026",
        "initiative_type": "hackathon",
        "target_domain": "Distributed Systems & Cloud Computing",
        "description": "48-hour national campus hackathon with industry mentors and cash prizes.",
        "target_audience": "All 3rd and 4th year engineering students",
        "slots_available": 200,
        "timeline": "December 2026",
        "contact_email": "hackathon@tcs.com"
    }
    res_create = client.post("/api/v1/industry/collaboration", json=proposal_payload, headers=HEADERS_HR)
    assert res_create.status_code == 201
    created = res_create.json()
    assert created["title"] == proposal_payload["title"]


def test_industry_analytics():
    res = client.get("/api/v1/industry/analytics", headers=HEADERS_HR)
    assert res.status_code == 200
    data = res.json()
    assert "status_breakdown" in data
    assert "recruitment_funnel" in data
    assert "top_in_demand_skills" in data
    assert "posting_performance" in data


def test_unauthorized_student_blocked_from_industry_routes():
    res = client.get("/api/v1/industry/dashboard-summary", headers=HEADERS_STUDENT)
    assert res.status_code == 403
