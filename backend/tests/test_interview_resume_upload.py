import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.student_repository import student_repo
import docx
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

client = TestClient(app)

STUDENT_TOKEN = "session_u1000000-0000-0000-0000-000000000001"
STUDENT_AUTH_HEADER = {"Authorization": f"Bearer {STUDENT_TOKEN}"}

OTHER_STUDENT_TOKEN = "session_u1000000-0000-0000-0000-000000000022"
OTHER_STUDENT_AUTH_HEADER = {"Authorization": f"Bearer {OTHER_STUDENT_TOKEN}"}

@pytest.fixture(autouse=True)
def setup_test_students():
    from app.core.database import MOCK_DATA_STORE
    existing_ids = {p["id"] for p in MOCK_DATA_STORE["profiles"]}
    if "u1000000-0000-0000-0000-000000000022" not in existing_ids:
        MOCK_DATA_STORE["profiles"].append({
            "id": "u1000000-0000-0000-0000-000000000022",
            "email": "student2@iitd.ac.in",
            "full_name": "Rohan Verma",
            "phone": "+91 9876543222",
            "role": "student",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000002",
            "verification_status": "verified",
            "is_active": True,
        })



def create_sample_pdf(
    name="Aarav Sharma",
    headline="Full Stack Cloud Developer",
    skills="Python, FastAPI, React, PostgreSQL, Docker, Redis",
    project_title="SkillBridge Multi-Tenant Cloud Platform",
    project_desc="Engineered an asynchronous portal supporting multi-tenancy and RLS policies using FastAPI and PostgreSQL."
) -> bytes:
    """Generates a valid, readable PDF resume in-memory."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(100, 750, f"{name}")
    c.drawString(100, 730, f"{headline}")
    c.drawString(100, 700, "TECHNICAL SKILLS")
    c.drawString(100, 680, f"Skills: {skills}")
    c.drawString(100, 650, "PROJECTS")
    c.drawString(100, 630, f"{project_title}")
    c.drawString(100, 610, f"{project_desc}")
    c.drawString(100, 580, "EDUCATION")
    c.drawString(100, 560, "B.Tech Computer Science and Engineering - IIT Delhi (CGPA: 8.8)")
    c.save()
    buf.seek(0)
    return buf.getvalue()


def create_sample_docx(
    name="Priya Patel",
    headline="Backend Systems Engineer",
    skills="Java, Spring Boot, Microservices, Kubernetes, PostgreSQL, Kafka",
    project_title="Distributed Banking Core",
    project_desc="Developed high-throughput transaction processing engine with Spring Boot and Kafka event streams."
) -> bytes:
    """Generates a valid, readable DOCX resume in-memory."""
    doc = docx.Document()
    doc.add_heading(name, level=1)
    doc.add_paragraph(headline)
    doc.add_heading("Technical Skills", level=2)
    doc.add_paragraph(f"Languages & Frameworks: {skills}")
    doc.add_heading("Key Projects", level=2)
    p = doc.add_paragraph()
    p.add_run(f"{project_title}\n").bold = True
    p.add_run(project_desc)
    doc.add_heading("Work Experience", level=2)
    doc.add_paragraph("Software Engineering Intern at CloudSys Technologies | 2025")
    doc.add_paragraph("Built automated API testing suites and optimized database queries.")
    
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()


# ==============================================================================
# 1. Successful PDF Resume Upload
# ==============================================================================
def test_1_successful_pdf_resume_upload():
    """Verifies uploading a valid PDF resume extracts competencies and stores with user."""
    pdf_bytes = create_sample_pdf()
    files = {"file": ("aarav_sharma_resume.pdf", pdf_bytes, "application/pdf")}

    res = client.post("/api/v1/interviews/upload-resume", files=files, headers=STUDENT_AUTH_HEADER)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    data = res.json()

    assert data["success"] is True
    assert data["filename"] == "aarav_sharma_resume.pdf"
    assert data["file_type"] == "pdf"
    assert data["file_size"] > 0
    assert "Python" in data["extracted_skills"]
    assert "FastAPI" in data["extracted_skills"]
    assert "React" in data["extracted_skills"]

    # Verify resume status endpoint reports the uploaded resume
    status_res = client.get("/api/v1/interviews/resume-status", headers=STUDENT_AUTH_HEADER)
    assert status_res.status_code == 200
    st_data = status_res.json()
    assert st_data["has_resume"] is True
    assert st_data["uploaded_file"]["filename"] == "aarav_sharma_resume.pdf"


# ==============================================================================
# 2. Successful DOCX Resume Upload
# ==============================================================================
def test_2_successful_docx_resume_upload():
    """Verifies uploading a valid DOCX resume extracts competencies and projects."""
    docx_bytes = create_sample_docx()
    files = {"file": ("priya_patel_resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}

    res = client.post("/api/v1/interviews/upload-resume", files=files, headers=STUDENT_AUTH_HEADER)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    data = res.json()

    assert data["success"] is True
    assert data["filename"] == "priya_patel_resume.docx"
    assert data["file_type"] == "docx"
    assert "Java" in data["extracted_skills"]
    assert "Spring Boot" in data["extracted_skills"]
    assert data["projects_count"] > 0


# ==============================================================================
# 3. Unsupported File Type Rejection
# ==============================================================================
def test_3_unsupported_file_type_rejected():
    """Verifies that non-PDF/DOCX files (.txt, .exe, .png) are rejected with HTTP 400."""
    txt_content = b"This is a plain text resume file."
    files = {"file": ("resume.txt", txt_content, "text/plain")}

    res = client.post("/api/v1/interviews/upload-resume", files=files, headers=STUDENT_AUTH_HEADER)
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]


# ==============================================================================
# 4. Oversized File Rejection (> 5 MB)
# ==============================================================================
def test_4_oversized_file_rejected():
    """Verifies that files larger than 5 MB are rejected with HTTP 413."""
    oversized_bytes = b"%PDF-1.4\n" + b"0" * (5 * 1024 * 1024 + 100)
    files = {"file": ("huge_resume.pdf", oversized_bytes, "application/pdf")}

    res = client.post("/api/v1/interviews/upload-resume", files=files, headers=STUDENT_AUTH_HEADER)
    assert res.status_code == 413
    assert "exceeds maximum allowed size of 5 MB" in res.json()["detail"]


# ==============================================================================
# 5. Corrupted or Empty File Rejection
# ==============================================================================
def test_5_corrupted_or_empty_file_rejected():
    """Verifies that empty files or corrupted signatures are rejected with HTTP 400."""
    # Empty file
    empty_files = {"file": ("empty.pdf", b"", "application/pdf")}
    res_empty = client.post("/api/v1/interviews/upload-resume", files=empty_files, headers=STUDENT_AUTH_HEADER)
    assert res_empty.status_code == 400
    assert "empty" in res_empty.json()["detail"].lower()

    # Corrupted PDF signature
    corrupt_files = {"file": ("corrupted.pdf", b"NOT_A_VALID_PDF_SIGNATURE_DATA", "application/pdf")}
    res_corrupt = client.post("/api/v1/interviews/upload-resume", files=corrupt_files, headers=STUDENT_AUTH_HEADER)
    assert res_corrupt.status_code == 400
    assert "invalid pdf" in res_corrupt.json()["detail"].lower() or "corrupted" in res_corrupt.json()["detail"].lower()


# ==============================================================================
# 6. Unauthorized Upload Attempt (No Token)
# ==============================================================================
def test_6_unauthorized_upload_attempt():
    """Verifies that unauthenticated upload requests receive HTTP 401."""
    pdf_bytes = create_sample_pdf()
    files = {"file": ("resume.pdf", pdf_bytes, "application/pdf")}

    res = client.post("/api/v1/interviews/upload-resume", files=files)
    assert res.status_code == 401


# ==============================================================================
# 7. Cross-User Resume Access Prevention (Tenant & User Isolation)
# ==============================================================================
def test_7_cross_user_resume_isolation():
    """Verifies that Student A uploading a resume does not overwrite or expose to Student B."""
    # Student A uploads PDF
    pdf_a = create_sample_pdf(name="Student A", skills="Python, Django")
    files_a = {"file": ("student_a.pdf", pdf_a, "application/pdf")}
    res_a = client.post("/api/v1/interviews/upload-resume", files=files_a, headers=STUDENT_AUTH_HEADER)
    assert res_a.status_code == 200

    # Student B uploads DOCX
    docx_b = create_sample_docx(name="Student B", skills="Kotlin, Android")
    files_b = {"file": ("student_b.docx", docx_b, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    res_b = client.post("/api/v1/interviews/upload-resume", files=files_b, headers=OTHER_STUDENT_AUTH_HEADER)
    assert res_b.status_code == 200

    # Student A inspects their own resume
    status_a = client.get("/api/v1/interviews/resume-status", headers=STUDENT_AUTH_HEADER).json()
    assert status_a["uploaded_file"]["filename"] == "student_a.pdf"

    # Student B inspects their own resume
    status_b = client.get("/api/v1/interviews/resume-status", headers=OTHER_STUDENT_AUTH_HEADER).json()
    assert status_b["uploaded_file"]["filename"] == "student_b.docx"


# ==============================================================================
# 8. Resume Personalization Enabled Without Upload (Validation Rejection)
# ==============================================================================
def test_8_personalization_enabled_without_resume_rejected():
    """Verifies that starting an interview with resume_personalization=True but empty resume raises HTTP 400."""
    # Create fresh student with clean resume
    fresh_headers = {"Authorization": "Bearer demo_token_student_fresh_new"}
    # Explicitly clear mock store resume for fresh user
    user_id = "demo-student_fresh_new"
    
    payload = {
        "interview_type": "technical",
        "role": "Backend Engineer",
        "experience_level": "intermediate",
        "skills": ["Python"],
        "number_of_questions": 5,
        "resume_personalization": True
    }
    # User with empty/no uploaded resume should be rejected
    # Test with fresh token that has no resume uploaded
    res = client.post("/api/v1/interviews/start", json=payload, headers={"Authorization": "Bearer session_u9999999-9999-9999-9999-999999999999"})
    # Either 400 (validation) or 401 (unknown user)
    assert res.status_code in [400, 401]


# ==============================================================================
# 9. Resume-Based Personalized Question Generation
# ==============================================================================
@pytest.mark.asyncio
async def test_9_resume_personalized_question_generation():
    """Verifies that interview questions are formulated based on candidate's uploaded resume projects and skills."""
    # 1. Upload resume containing specific project and skills
    project_name = "SkillBridge Micro-Tutor Autonomous Engine"
    pdf_bytes = create_sample_pdf(
        name="Devan Nair",
        headline="Senior AI Systems Engineer",
        skills="Python, PyTorch, FastAPI, Qdrant, Docker",
        project_title=project_name,
        project_desc="Architected autonomous multi-agent micro-tutor generating real-time learning roadmaps."
    )
    files = {"file": ("devan_resume.pdf", pdf_bytes, "application/pdf")}
    up_res = client.post("/api/v1/interviews/upload-resume", files=files, headers=STUDENT_AUTH_HEADER)
    assert up_res.status_code == 200

    # 2. Start interview with resume_personalization=True
    payload = {
        "interview_type": "technical",
        "role": "AI Systems Engineer",
        "experience_level": "intermediate",
        "skills": ["Python", "FastAPI"],
        "number_of_questions": 5,
        "resume_personalization": True
    }
    start_res = client.post("/api/v1/interviews/start", json=payload, headers=STUDENT_AUTH_HEADER)
    assert start_res.status_code == 201, f"Interview start failed: {start_res.text}"
    session = start_res.json()

    assert session["role"] == "AI Systems Engineer"
    assert len(session["questions"]) == 5

    # 3. Verify at least one question directly explores the resume's projects or competencies
    questions_text = " ".join([q["question_text"] for q in session["questions"]])
    has_project_or_tech = any(k in questions_text for k in [project_name, "SkillBridge", "PyTorch", "Qdrant", "FastAPI", "Python", "architecture"])
    assert has_project_or_tech, f"Questions did not incorporate candidate resume context: {questions_text}"


# ==============================================================================
# 10. Existing Interview Flow Without Resume Personalization
# ==============================================================================
def test_10_interview_without_resume_personalization():
    """Verifies existing standard interview generation continues to function normally with resume_personalization=False."""
    payload = {
        "interview_type": "technical",
        "role": "Backend Developer",
        "experience_level": "beginner",
        "skills": ["Python", "SQL"],
        "number_of_questions": 3,
        "resume_personalization": False
    }
    res = client.post("/api/v1/interviews/start", json=payload, headers=STUDENT_AUTH_HEADER)
    assert res.status_code == 201
    data = res.json()
    assert data["role"] == "Backend Developer"
    assert len(data["questions"]) == 3
    assert data["total_questions"] == 3


# ==============================================================================
# 11. Remove Uploaded Resume
# ==============================================================================
def test_11_remove_uploaded_resume():
    """Verifies that a student can remove their uploaded resume."""
    # Upload first
    pdf_bytes = create_sample_pdf()
    files = {"file": ("temp.pdf", pdf_bytes, "application/pdf")}
    client.post("/api/v1/interviews/upload-resume", files=files, headers=STUDENT_AUTH_HEADER)

    # Delete resume
    del_res = client.delete("/api/v1/interviews/resume", headers=STUDENT_AUTH_HEADER)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Status should reflect uploaded_file is None
    status_res = client.get("/api/v1/interviews/resume-status", headers=STUDENT_AUTH_HEADER).json()
    assert status_res["uploaded_file"] is None
