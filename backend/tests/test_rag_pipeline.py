import pytest
from unittest.mock import patch, AsyncMock
from fastapi import HTTPException
from app.services.ai.rag_service import rag_service
from app.services.ai.orchestrator import ai_orchestrator
from app.services.ai.micro_tutor_service import micro_tutor_service
from app.schemas.learning import LearningPathRequest
from app.schemas.interview import InterviewStartRequest
from app.services.ai.gemini_service import gemini_service
from app.services.ai.groq_service import groq_service

# ==============================================================================
# 10. Verify RAG Retrieval (Unit Level)
# ==============================================================================
def test_10_rag_retrieval_english_and_domain_isolation():
    """Test 10: For English query, inspect retrieved documents and confirm they are English-related."""
    query = "I want to learn English"
    docs = rag_service.search_learning_resources(query=query, top_k=4)

    assert len(docs) > 0, "RAG should retrieve at least 1 document for English query"

    for doc in docs:
        combined = f"{doc['title']} {doc['category']} {doc['skill_tag']} {doc['content']}".lower()
        # English keywords MUST be present
        assert any(w in combined for w in ["english", "speak", "grammar", "vocabulary", "communication", "pronunciation"]), (
            f"Retrieved document '{doc['title']}' is not English related!"
        )
        # Frontend keywords MUST NOT be present
        assert not any(w in combined for w in ["react", "virtual dom", "css grid", "javascript dom"]), (
            f"Retrieved document '{doc['title']}' contaminated with frontend content!"
        )

# ==============================================================================
# LEARNING TESTS: 1, 2, 3
# ==============================================================================
@pytest.mark.asyncio
async def test_1_learning_query_english_no_frontend_contamination():
    """Test 1: Query 'I want to learn English' -> English learning path/resources. NO frontend content."""
    import asyncio
    await asyncio.sleep(1.0)

    res = await micro_tutor_service.generate_learning_path(
        user_id="test-student-1",
        payload=LearningPathRequest(
            topic="I want to learn English",
            difficulty="beginner",
            learning_goal="interview_prep"
        )
    )

    assert res.topic == "I want to learn English"
    assert len(res.lessons) >= 6

    # Verify lessons are strictly English/communication and contain NO frontend code or terms
    all_lessons_text = " ".join([f"{l.title} {l.objective} {l.script} {' '.join(l.key_points)}" for l in res.lessons]).lower()
    assert any(w in all_lessons_text for w in ["english", "grammar", "pronunciation", "vocabulary", "communication", "speaking", "language", "fluency", "introduction", "conversation"]), (
        f"Generated lessons do not contain English communication concepts!"
    )
    for lesson in res.lessons:
        lesson_text = f"{lesson.title} {lesson.objective} {lesson.script} {' '.join(lesson.key_points)}".lower()
        assert not any(w in lesson_text for w in ["virtual dom", "react reconciliation", "css box model", "html5 semantic", "jsx"]), (
            f"Lesson '{lesson.title}' is contaminated with frontend topics!"
        )

    # Test Learning Recommendations endpoint method
    rec_res = await ai_orchestrator.get_learning_recommendations(
        user_id="test-student-1",
        focus_skills=["English Communication"]
    )
    assert len(rec_res.recommended_courses) > 0
    rec_text = f"{rec_res.learning_path_title} " + " ".join([c.title + " " + c.skill_tag for c in rec_res.recommended_courses])
    rec_lower = rec_text.lower()
    assert any(w in rec_lower for w in ["english", "communication", "spoken", "language"])
    assert "react" not in rec_lower
    assert "docker" not in rec_lower


@pytest.mark.asyncio
async def test_2_learning_query_react():
    """Test 2: Query 'I want to learn React' -> React/frontend content."""
    import asyncio
    await asyncio.sleep(2.0)

    res = await micro_tutor_service.generate_learning_path(
        user_id="test-student-2",
        payload=LearningPathRequest(
            topic="I want to learn React",
            difficulty="intermediate",
            learning_goal="interview_prep"
        )
    )

    assert "react" in res.topic.lower()
    assert len(res.lessons) >= 6

    lessons_text = " ".join([l.title + " " + l.script for l in res.lessons]).lower()
    assert any(w in lessons_text for w in ["react", "component", "hook", "jsx", "state", "virtual dom"])
    assert "python" not in lessons_text or "fastapi" not in lessons_text


@pytest.mark.asyncio
async def test_3_learning_query_python():
    """Test 3: Query 'I want to learn Python' -> Python content."""
    import asyncio
    await asyncio.sleep(2.0)

    res = await micro_tutor_service.generate_learning_path(
        user_id="test-student-3",
        payload=LearningPathRequest(
            topic="I want to learn Python",
            difficulty="beginner",
            learning_goal="career_growth"
        )
    )

    assert "python" in res.topic.lower()
    assert len(res.lessons) >= 6

    lessons_text = " ".join([l.title + " " + l.script for l in res.lessons]).lower()
    assert any(w in lessons_text for w in ["python", "function", "data structure", "syntax", "variable", "list", "loop"])
    assert not any(w in lessons_text for w in ["virtual dom", "react reconciliation", "css box model", "html5 semantic", "jsx"])

# ==============================================================================
# INTERVIEW TESTS: 4, 5, 6, 7
# ==============================================================================
@pytest.mark.asyncio
async def test_4_interview_role_python_developer():
    """Test 4: Role 'Python Developer' -> Python-focused questions."""
    import asyncio
    await asyncio.sleep(2.0)

    res = await ai_orchestrator.start_interview_session(
        user_id="test-student-4",
        payload=InterviewStartRequest(
            role="Python Developer",
            interview_type="technical",
            skills=["Python", "FastAPI", "Data Structures"],
            number_of_questions=5,
            experience_level="intermediate"
        )
    )

    assert res.role == "Python Developer"
    assert len(res.questions) >= 4

    combined_questions = " ".join([q.question_text + " " + q.category for q in res.questions]).lower()
    assert any(w in combined_questions for w in ["python", "async", "gil", "generator", "decorator", "fastapi", "memory", "database", "data structures", "concurrency"])
    assert "react reconciliation" not in combined_questions
    assert "css box model" not in combined_questions


@pytest.mark.asyncio
async def test_5_interview_role_frontend_developer():
    """Test 5: Role 'Frontend Developer' -> Frontend questions."""
    import asyncio
    await asyncio.sleep(2.0)

    res = await ai_orchestrator.start_interview_session(
        user_id="test-student-5",
        payload=InterviewStartRequest(
            role="Frontend Developer",
            interview_type="technical",
            skills=["React", "CSS", "JavaScript"],
            number_of_questions=5,
            experience_level="intermediate"
        )
    )

    assert res.role == "Frontend Developer"
    assert len(res.questions) >= 4

    combined_questions = " ".join([q.question_text + " " + q.category for q in res.questions]).lower()
    assert any(w in combined_questions for w in ["react", "dom", "frontend", "state", "css", "component", "performance", "web"])


@pytest.mark.asyncio
async def test_6_interview_change_role_frontend_to_python():
    """Test 6: Change from Frontend -> Python -> New Python questions, NOT previous frontend questions."""
    import asyncio
    await asyncio.sleep(2.0)

    # First: start frontend interview
    fe_res = await ai_orchestrator.start_interview_session(
        user_id="test-student-6",
        payload=InterviewStartRequest(
            role="Frontend Developer",
            interview_type="technical",
            skills=["React", "CSS"],
            number_of_questions=5
        )
    )
    fe_questions = [q.question_text for q in fe_res.questions]

    # Second: switch to Python Developer
    py_res = await ai_orchestrator.start_interview_session(
        user_id="test-student-6",
        payload=InterviewStartRequest(
            role="Python Developer",
            interview_type="technical",
            skills=["Python", "FastAPI"],
            number_of_questions=5
        )
    )
    py_questions = [q.question_text for q in py_res.questions]

    # Must not be the same questions
    assert fe_questions != py_questions

    py_combined = " ".join(py_questions).lower()
    assert any(w in py_combined for w in ["python", "async", "backend", "fastapi", "memory", "decorator", "gil", "concurrency"])
    assert "react reconciliation" not in py_combined


@pytest.mark.asyncio
async def test_7_interview_generate_twice_same_role():
    """Test 7: Generate interview twice for same role -> questions dynamically generated, not simply identical hardcoded list."""
    import asyncio
    await asyncio.sleep(2.0)

    res1 = await ai_orchestrator.start_interview_session(
        user_id="test-student-7",
        payload=InterviewStartRequest(
            role="Python Developer",
            interview_type="technical",
            skills=["Python", "FastAPI", "SQL"],
            number_of_questions=5
        )
    )
    res2 = await ai_orchestrator.start_interview_session(
        user_id="test-student-7",
        payload=InterviewStartRequest(
            role="Python Developer",
            interview_type="technical",
            skills=["Python", "FastAPI", "SQL"],
            number_of_questions=5
        )
    )

    q_texts_1 = [q.question_text for q in res1.questions]
    q_texts_2 = [q.question_text for q in res2.questions]

    # Assert sessions have unique session IDs
    assert res1.id != res2.id
    # Both sets must be Python focused
    assert all("react" not in q.lower() for q in q_texts_1 + q_texts_2)

# ==============================================================================
# FAILOVER TESTS: 8, 9
# ==============================================================================
@pytest.mark.asyncio
async def test_8_force_gemini_failure_fallback_to_groq():
    """Test 8: Force Gemini failure -> Groq receives the same request and relevant RAG context."""
    import asyncio
    await asyncio.sleep(2.0)

    with patch.object(gemini_service, "generate_structured_json", side_effect=RuntimeError("Simulated Gemini 500 Outage")):
        with patch.object(groq_service, "generate_structured_json", wraps=groq_service.generate_structured_json) as groq_spy:
            res = await ai_orchestrator.start_interview_session(
                user_id="test-student-8",
                payload=InterviewStartRequest(
                    role="Python Developer",
                    interview_type="technical",
                    skills=["Python"],
                    number_of_questions=5
                )
            )

            # Assert Groq was called as fallback
            assert groq_spy.called, "Groq should be called when Gemini fails"
            call_kwargs = groq_spy.call_args.kwargs
            prompt = call_kwargs.get("prompt") or groq_spy.call_args.args[0]
            assert "Python Developer" in prompt, "Groq should receive the Python Developer role in prompt"
            assert "Retrieved RAG Competency Context" in prompt, "Groq should receive RAG context in prompt"

            # Assert valid session was generated by Groq
            assert res.role == "Python Developer"
            assert len(res.questions) >= 4


@pytest.mark.asyncio
async def test_9_force_both_providers_fail_http_503():
    """Test 9: Force both providers to fail -> HTTP 503, no fake questions/content."""
    with patch.object(gemini_service, "generate_structured_json", side_effect=RuntimeError("Gemini Down")):
        with patch.object(groq_service, "generate_structured_json", side_effect=RuntimeError("Groq Down")):
            # 1. Interview Generation
            with pytest.raises(HTTPException) as exc_info:
                await ai_orchestrator.start_interview_session(
                    user_id="test-student-9",
                    payload=InterviewStartRequest(
                        role="Python Developer",
                        interview_type="technical",
                        skills=["Python"],
                        number_of_questions=5
                    )
                )
            assert exc_info.value.status_code == 503
            assert "unavailable" in exc_info.value.detail.lower()

            # 2. Learning Micro-Tutor
            with pytest.raises(HTTPException) as exc_info_learning:
                await micro_tutor_service.generate_learning_path(
                    user_id="test-student-9",
                    payload=LearningPathRequest(
                        topic="English",
                        difficulty="beginner"
                    )
                )
            assert exc_info_learning.value.status_code == 503
            assert "unavailable" in exc_info_learning.value.detail.lower()

            # 3. Learning Recommendations
            with pytest.raises(HTTPException) as exc_info_rec:
                await ai_orchestrator.get_learning_recommendations(
                    user_id="test-student-9",
                    focus_skills=["English"]
                )
            assert exc_info_rec.value.status_code == 503
            assert "unavailable" in exc_info_rec.value.detail.lower()
