import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.interview_repository import interview_repo

client = TestClient(app)

HEADERS_STUDENT = {"Authorization": "Bearer demo_token_student"}


def test_interview_lifecycle():
    # 1. Start interview
    start_payload = {
        "interview_type": "technical",
        "role": "Full Stack Developer",
        "experience_level": "intermediate",
        "skills": ["React", "FastAPI", "PostgreSQL", "Docker"],
        "interview_focus": "technical",
        "number_of_questions": 3,
        "resume_personalization": False
    }

    mock_questions = {
        "questions": [
            {
                "id": "q-1",
                "question_number": 1,
                "question_text": "How do you design a layered backend with FastAPI and PostgreSQL?",
                "category": "Architecture",
                "difficulty": "intermediate",
                "hint": "Discuss async route handlers, connection pooling, and Docker containerization.",
                "evaluation_criteria": ["Layered architecture", "Connection pooling", "Containerization"],
                "expected_key_points": ["Layered architecture", "Connection pooling", "Containerization"]
            }
        ]
    }

    mock_eval = {
        "is_off_topic": False,
        "is_fundamentally_incorrect": False,
        "technical_correctness": 35,
        "relevance": 23,
        "completeness": 18,
        "communication": 14,
        "assessment": "Strong technical explanation",
        "covered_key_points": ["Layered architecture", "Connection pooling"],
        "missing_key_points": ["Zero-downtime container migration"],
        "strengths": ["Solid architecture understanding"],
        "improvements": ["Elaborate on database migration strategies"],
        "suggested_answer_points": ["Alembic migrations"]
    }

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = (mock_questions, 200, False)

        start_res = client.post("/api/v1/interviews/start", json=start_payload, headers=HEADERS_STUDENT)
        assert start_res.status_code in [200, 201], f"Start failed: {start_res.text}"
        session = start_res.json()
        interview_id = session["id"]
        assert session["role"] == "Full Stack Developer"
        assert len(session["questions"]) > 0

        first_q = session["questions"][0]
        first_q_id = first_q["id"]

        # 2. Submit candidate's spoken answer to Question 1
        mock_gemini.return_value = (mock_eval, 200, False)
        answer_payload = {
            "question_id": first_q_id,
            "answer_text": "I design backends using a layered architecture with FastAPI, async route handlers, connection pooling in PostgreSQL, and Docker containerization."
        }
        ans_res = client.post(f"/api/v1/interviews/{interview_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
        assert ans_res.status_code == 200, f"Answer submit failed: {ans_res.text}"
        ans_data = ans_res.json()
        assert "score" in ans_data
        assert 0 <= ans_data["score"] <= 100
        assert ans_data["score"] == 35 + 23 + 18 + 14  # 90
        assert "technical_correctness" in ans_data
        assert "relevance" in ans_data
        assert "completeness" in ans_data
        assert "communication" in ans_data

        # 3. Adaptive next-question generation
        mock_gemini.return_value = ({
            "id": "q-2",
            "question_number": 2,
            "question_text": "How do you handle database indexing and concurrency in PostgreSQL?",
            "category": "Databases",
            "difficulty": "advanced",
            "hint": "Discuss index types and isolation levels.",
            "evaluation_criteria": ["B-tree indexes", "MVCC isolation"],
            "expected_key_points": ["B-tree indexes", "MVCC isolation"]
        }, 200, False)
        next_res = client.post(f"/api/v1/interviews/{interview_id}/next-question", headers=HEADERS_STUDENT)
        assert next_res.status_code == 200, f"Next question failed: {next_res.text}"
        next_q = next_res.json()
        if next_q:
            assert "question_text" in next_q
            assert "category" in next_q

        # 4. Complete interview and synthesize multi-model report
        comp_res = client.post(f"/api/v1/interviews/{interview_id}/complete", headers=HEADERS_STUDENT)
        assert comp_res.status_code == 200, f"Complete failed: {comp_res.text}"
        report = comp_res.json()
        assert 0 <= report["overall_score"] <= 100
        assert len(report["category_scores"]) > 0
        assert len(report["strengths"]) > 0
        assert len(report["question_reviews"]) > 0

        # 5. Fetch report directly
        rep_res = client.get(f"/api/v1/interviews/{interview_id}/report", headers=HEADERS_STUDENT)
        assert rep_res.status_code == 200
        assert rep_res.json()["interview_id"] == interview_id

        # 6. Fetch interview history
        hist_res = client.get("/api/v1/interviews/history", headers=HEADERS_STUDENT)
        assert hist_res.status_code == 200
        history = hist_res.json()
        assert len(history) > 0


# =============================================================================
# STRICT EVALUATION TEST SCENARIOS (TEST 1 - TEST 8)
# =============================================================================

def _setup_test_session(role: str, question_text: str, expected_key_points: list, interview_type: str = "technical") -> tuple[str, str]:
    """Helper to create an isolated session with a targeted question."""
    session_id = f"test-inv-{interview_type}"
    q_id = f"test-q-1"
    session_data = {
        "id": session_id,
        "user_id": "u1000000-0000-0000-0000-000000000001",
        "interview_type": interview_type,
        "role": role,
        "experience_level": "intermediate",
        "status": "in_progress",
        "total_questions": 1,
        "current_question_index": 0,
        "questions": [
            {
                "id": q_id,
                "question_number": 1,
                "question_text": question_text,
                "category": "Core Concept" if interview_type == "technical" else "Behavioral",
                "difficulty": "intermediate",
                "hint": "Provide a clear conceptual explanation with rationale.",
                "evaluation_criteria": expected_key_points,
                "expected_key_points": expected_key_points
            }
        ]
    }
    interview_repo.create_session(session_data)
    return session_id, q_id


def test_1_off_topic_answer_receives_low_score():
    """
    TEST 1:
    Question: "What is the difference between a process and a thread?"
    Answer: "Python is a programming language used to build applications."
    Expected: Low score (score <= 20). Proves irrelevant answers are NOT generously scored around 80%.
    """
    session_id, q_id = _setup_test_session(
        role="Systems Engineer",
        question_text="What is the difference between a process and a thread?",
        expected_key_points=[
            "Processes have independent virtual address space and private memory",
            "Threads share address space and heap memory of their parent process",
            "Processes provide stronger isolation with higher context-switch overhead",
            "Threads are lightweight execution units with lower creation/switching cost"
        ]
    )

    # Evaluator output identifying off-topic content (or even if LLM hallucinated, cap enforces <= 20)
    mock_llm_eval = {
        "is_off_topic": True,
        "is_fundamentally_incorrect": False,
        "technical_correctness": 2,
        "relevance": 2,
        "completeness": 0,
        "communication": 10,
        "assessment": "Off-topic response: candidate discusses Python projects instead of process vs thread",
        "covered_key_points": [],
        "missing_key_points": [
            "Processes have independent virtual address space and private memory",
            "Threads share address space and heap memory of their parent process"
        ],
        "strengths": ["Grammatically structured sentence"],
        "improvements": ["Directly answer the question asked regarding processes and threads"],
        "suggested_answer_points": ["Explain separate address space versus shared heap memory"]
    }

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = (mock_llm_eval, 180, False)

        answer_payload = {
            "question_id": q_id,
            "answer_text": "Python is a programming language used to build applications and I have built several projects in it."
        }
        res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
        assert res.status_code == 200
        data = res.json()

        # Must be capped at <= 20 for off-topic response
        assert data["score"] <= 20, f"Off-topic answer scored too high: {data['score']}"
        assert data["technical_correctness"] <= 5
        assert data["relevance"] <= 5


def test_2_accurate_technical_answer_receives_high_score():
    """
    TEST 2:
    Same question with accurate, comprehensive explanation.
    Expected: High score (score >= 75).
    """
    session_id, q_id = _setup_test_session(
        role="Systems Engineer",
        question_text="What is the difference between a process and a thread?",
        expected_key_points=[
            "Processes have independent virtual address space and private memory",
            "Threads share address space and heap memory of their parent process",
            "Processes provide stronger isolation with higher context-switch overhead",
            "Threads are lightweight execution units with lower creation/switching cost"
        ]
    )

    mock_llm_eval = {
        "is_off_topic": False,
        "is_fundamentally_incorrect": False,
        "technical_correctness": 38,
        "relevance": 24,
        "completeness": 18,
        "communication": 14,
        "assessment": "Accurate, clear, and comprehensive technical explanation",
        "covered_key_points": [
            "Processes have independent virtual address space and private memory",
            "Threads share address space and heap memory of their parent process",
            "Processes provide stronger isolation with higher context-switch overhead",
            "Threads are lightweight execution units with lower creation/switching cost"
        ],
        "missing_key_points": [],
        "strengths": ["Clear explanation of memory isolation", "Accurate distinction between processes and threads"],
        "improvements": ["Could mention specific IPC mechanisms"],
        "suggested_answer_points": ["Inter-process communication mechanisms"]
    }

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = (mock_llm_eval, 180, False)

        answer_payload = {
            "question_id": q_id,
            "answer_text": "A process is an independent program in execution with its own dedicated memory address space, file descriptors, and system resources, providing strong memory isolation. In contrast, threads are smaller lightweight execution units within the same process that share the process address space, heap memory, and open files, meaning context switching between threads has significantly lower overhead than between processes."
        }
        res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
        assert res.status_code == 200
        data = res.json()

        assert data["score"] >= 75, f"Accurate answer scored unexpectedly low: {data['score']}"
        assert data["technical_correctness"] >= 25
        assert data["relevance"] >= 18
        # Score should equal sum of dimensions
        expected_sum = data["technical_correctness"] + data["relevance"] + data["completeness"] + data["communication"]
        assert data["score"] == expected_sum


def test_3_refusal_answer_receives_very_low_score():
    """
    TEST 3:
    Question: "What is Redis used for?"
    Answer: "I don't know."
    Expected: Deterministic refusal score (score <= 5).
    """
    session_id, q_id = _setup_test_session(
        role="Backend Developer",
        question_text="What is Redis used for?",
        expected_key_points=["In-memory key-value data store", "In-memory caching", "Sub-millisecond latency"]
    )

    answer_payload = {
        "question_id": q_id,
        "answer_text": "I don't know."
    }
    res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
    assert res.status_code == 200
    data = res.json()

    assert data["score"] <= 5, f"Refusal answer received non-trivial score: {data['score']}"
    assert data["technical_correctness"] == 0
    assert data["relevance"] == 0


def test_4_short_complete_answer_not_penalized():
    """
    TEST 4:
    Question: "What does HTTP stand for?"
    Answer: "Hypertext Transfer Protocol."
    Expected: High score (score >= 85) because it completely answers the question despite brevity.
    """
    session_id, q_id = _setup_test_session(
        role="Software Engineer",
        question_text="What does HTTP stand for?",
        expected_key_points=["Hypertext Transfer Protocol"]
    )

    mock_llm_eval = {
        "is_off_topic": False,
        "is_fundamentally_incorrect": False,
        "technical_correctness": 40,
        "relevance": 25,
        "completeness": 18,
        "communication": 15,
        "assessment": "Completely accurate acronym definition",
        "covered_key_points": ["Hypertext Transfer Protocol"],
        "missing_key_points": [],
        "strengths": ["Direct and accurate expansion of the acronym"],
        "improvements": [],
        "suggested_answer_points": ["Mention its role in web client-server communication"]
    }

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = (mock_llm_eval, 150, False)

        answer_payload = {
            "question_id": q_id,
            "answer_text": "Hypertext Transfer Protocol."
        }
        res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
        assert res.status_code == 200
        data = res.json()

        assert data["score"] >= 85, f"Short accurate answer penalized: {data['score']}"
        assert data["technical_correctness"] >= 32
        assert data["relevance"] >= 20


def test_5_partially_correct_answer_reflects_dimensions():
    """
    TEST 5:
    Partially correct technical answer.
    Expected: Dimension scores reflect actual coverage, missing key points returned, not artificially clamped.
    """
    session_id, q_id = _setup_test_session(
        role="Backend Developer",
        question_text="What is Redis and why is it used for caching?",
        expected_key_points=[
            "Redis is an in-memory key-value data store",
            "Provides sub-millisecond read/write access",
            "Reduces load on persistent relational databases",
            "Supports TTL and cache eviction policies like LRU"
        ]
    )

    mock_llm_eval = {
        "is_off_topic": False,
        "is_fundamentally_incorrect": False,
        "technical_correctness": 26,
        "relevance": 20,
        "completeness": 10,
        "communication": 12,
        "assessment": "Partially correct explanation; identified in-memory nature but missed TTL and DB load reduction",
        "covered_key_points": ["Redis is an in-memory key-value data store"],
        "missing_key_points": [
            "Reduces load on persistent relational databases",
            "Supports TTL and cache eviction policies like LRU"
        ],
        "strengths": ["Correctly identified that Redis stores key-value pairs in RAM"],
        "improvements": ["Explain how caching reduces database load and mention TTL expiration"],
        "suggested_answer_points": ["Explain cache invalidation and TTL"]
    }

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = (mock_llm_eval, 180, False)

        answer_payload = {
            "question_id": q_id,
            "answer_text": "Redis is an in-memory database that stores key-value pairs in RAM so that fetching data is very fast."
        }
        res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
        assert res.status_code == 200
        data = res.json()

        # The score should be calculated deterministically from dimensions: 26 + 20 + 10 + 12 = 68
        expected_sum = data["technical_correctness"] + data["relevance"] + data["completeness"] + data["communication"]
        assert data["score"] == expected_sum
        assert data["score"] == 68
        assert len(data.get("missing_key_points", [])) > 0


def test_6_hr_behavioral_answer_evaluated_without_technical_keywords():
    """
    TEST 6:
    HR question with a good behavioral STAR answer.
    Expected: Good score without requiring code or programming syntax.
    """
    session_id, q_id = _setup_test_session(
        role="Associate Software Engineer",
        question_text="Tell me about a time you had a disagreement with a project teammate and how you handled it.",
        expected_key_points=[
            "Description of situation and conflicting viewpoints",
            "Constructive communication and objective evaluation",
            "Professional resolution focused on team success",
            "Positive outcome and key learning"
        ],
        interview_type="hr"
    )

    mock_llm_eval = {
        "is_off_topic": False,
        "is_fundamentally_incorrect": False,
        "technical_correctness": 0,
        "relevance": 35,
        "communication": 23,
        "completeness": 17,
        "professionalism": 14,
        "assessment": "Excellent behavioral response demonstrating leadership and consensus building",
        "covered_key_points": [
            "Description of situation and conflicting viewpoints",
            "Constructive communication and objective evaluation",
            "Professional resolution focused on team success",
            "Positive outcome and key learning"
        ],
        "missing_key_points": [],
        "strengths": ["Strong collaborative mindset", "Effective conflict resolution technique"],
        "improvements": ["Could reflect on personal lessons learned after the project"],
        "suggested_answer_points": ["Emphasize long-term team relationship building"]
    }

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = (mock_llm_eval, 180, False)

        answer_payload = {
            "question_id": q_id,
            "answer_text": "During our college capstone project, our frontend and backend members disagreed on API response payloads. As team coordinator, I scheduled a collaborative whiteboard session where we documented the exact user flows, agreed on a unified REST contract, and wrote mock responses. This resolved the conflict respectfully and helped us complete the sprint two days early."
        }
        res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
        assert res.status_code == 200, f"Status: {res.status_code}, Body: {res.text}"
        data = res.json()

        assert data["score"] >= 70, f"HR behavioral response scored unexpectedly low: {data['score']}"
        assert data["relevance"] >= 20
        assert data["communication"] >= 15
        assert data["score"] == 35 + 23 + 17 + 14  # 89


@pytest.mark.asyncio
async def test_7_gemini_failure_triggers_groq_fallback():
    """
    TEST 7:
    Gemini failure -> genuine Groq fallback is called.
    """
    session_id, q_id = _setup_test_session(
        role="Backend Developer",
        question_text="What is database normalization?",
        expected_key_points=["Organizing database tables to reduce data redundancy and improve data integrity"]
    )

    mock_groq_response = {
        "is_off_topic": False,
        "is_fundamentally_incorrect": False,
        "technical_correctness": 36,
        "relevance": 23,
        "completeness": 18,
        "communication": 14,
        "assessment": "Accurate technical explanation of database normalization",
        "covered_key_points": ["Reducing data redundancy", "Improving data integrity through normal forms"],
        "missing_key_points": ["Specific normal forms (1NF, 2NF, 3NF, BCNF)"],
        "strengths": ["Clear explanation of data redundancy reduction"],
        "improvements": ["Mention 1NF, 2NF, and 3NF decomposition rules"],
        "suggested_answer_points": ["Explain anomalous updates, inserts, and deletes"]
    }

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.side_effect = RuntimeError("Gemini API rate limit exceeded")

        with patch("app.services.ai.groq_service.groq_service.generate_structured_json", new_callable=AsyncMock) as mock_groq:
            mock_groq.return_value = (mock_groq_response, 180, False)

            answer_payload = {
                "question_id": q_id,
                "answer_text": "Database normalization is the process of structuring relational tables to minimize data redundancy and prevent insertion, update, and deletion anomalies."
            }
            res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
            assert res.status_code == 200
            data = res.json()

            # Verify Groq fallback was called
            assert mock_gemini.called
            assert mock_groq.called
            assert data["score"] == 36 + 23 + 18 + 14  # 91
            assert "Reducing data redundancy" in data["covered_key_points"]


@pytest.mark.asyncio
async def test_8_both_providers_fail_returns_503():
    """
    TEST 8:
    Gemini failure + Groq failure -> HTTP 503 is returned.
    No fake or simulated score returned.
    """
    session_id, q_id = _setup_test_session(
        role="Backend Developer",
        question_text="What is database normalization?",
        expected_key_points=["Organizing database tables to reduce data redundancy"]
    )

    with patch("app.services.ai.gemini_service.gemini_service.generate_structured_json", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.side_effect = RuntimeError("Gemini unreachable")

        with patch("app.services.ai.groq_service.groq_service.generate_structured_json", new_callable=AsyncMock) as mock_groq:
            mock_groq.side_effect = RuntimeError("Groq unreachable")

            answer_payload = {
                "question_id": q_id,
                "answer_text": "Database normalization organizes tables to reduce redundancy."
            }
            res = client.post(f"/api/v1/interviews/{session_id}/answer", json=answer_payload, headers=HEADERS_STUDENT)
            assert res.status_code == 503, f"Expected HTTP 503, got {res.status_code}: {res.text}"
            detail = res.json().get("detail", "")
            assert "unavailable" in detail.lower() or "failed" in detail.lower()

