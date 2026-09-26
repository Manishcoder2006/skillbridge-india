import math
import pytest
from typing import Dict, Any
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.services.ai.rag_document_parser import rag_document_parser
from app.services.ai.embedding_service import get_embedding_provider, LocalDeterministicEmbeddingProvider
from app.services.ai.qdrant_manager import qdrant_manager
from app.services.ai.rag_service import rag_service
from app.models.enums import UserRole


# ==============================================================================
# 1. Document Parsing & Section Verification
# ==============================================================================
def test_1_docx_parsing_and_sections():
    """Verifies that all sections, headings, and items are extracted from the DOCX."""
    chunks = rag_document_parser.parse_docx(settings.KNOWLEDGE_BASE_DOC_PATH)
    assert len(chunks) >= 140, f"Expected at least 140 chunks, got {len(chunks)}"

    sections = {c["section"] for c in chunks}
    required_sections = [
        "HR & Behavioral Interview Q&A",
        "Java Interview Q&A",
        "DSA Interview Q&A",
        "Python Interview Q&A",
        "JavaScript, React & Web Q&A",
        "SQL & Database Q&A",
        "AI/ML & RAG Interview Q&A",
        "Data Analytics & Statistics Q&A",
        "Career Role Profiles",
        "Academic-to-Industry Skill Mapping",
        "Learning Roadmaps",
        "Resume & Project Guidance",
        "Internship & Placement FAQs",
        "Aptitude & Group Discussion Practice",
        "Mock Interview Question Sets",
    ]
    for req in required_sections:
        assert req in sections, f"Missing required section '{req}' from parsed DOCX!"


# ==============================================================================
# 2. Chunk Integrity: Questions & Answers Kept Unified
# ==============================================================================
def test_2_chunk_integrity_question_answer_unified():
    """Ensures each interview question is kept together with its answer in one chunk."""
    chunks = rag_document_parser.parse_docx(settings.KNOWLEDGE_BASE_DOC_PATH)
    qa_chunks = [c for c in chunks if c.get("content_type") == "interview_qa"]

    assert len(qa_chunks) >= 60, f"Expected at least 60 interview Q&A chunks, got {len(qa_chunks)}"

    for c in qa_chunks:
        assert c.get("question"), f"Chunk {c['chunk_id']} has empty question!"
        assert c.get("answer"), f"Chunk {c['chunk_id']} has empty answer!"
        # Question and answer must both be inside chunk_text
        assert c["question"] in c["chunk_text"], "Question missing from chunk_text!"
        assert c["answer"][:30] in c["chunk_text"], "Answer missing from chunk_text!"


# ==============================================================================
# 3. Metadata Extraction Accuracy
# ==============================================================================
def test_3_metadata_extraction_accuracy():
    """Verifies that metadata fields are accurately extracted without fabrication."""
    chunks = rag_document_parser.parse_docx(settings.KNOWLEDGE_BASE_DOC_PATH)

    # Inspect a Java Q&A chunk
    java_chunks = [c for c in chunks if c["section"] == "Java Interview Q&A"]
    assert len(java_chunks) == 8
    for jc in java_chunks:
        assert jc["role"] == "java_developer"
        assert jc["difficulty"] in ["beginner", "intermediate", "advanced"]
        assert jc["content_type"] == "interview_qa"

    # Inspect Career Role Profiles
    role_chunks = [c for c in chunks if c["content_type"] == "career_role_profile"]
    assert len(role_chunks) == 6
    role_titles = [c["subsection"] for c in role_chunks]
    assert "Frontend Developer" in role_titles
    assert "AI/ML Engineer" in role_titles
    assert "Full-Stack Developer" in role_titles

    # Inspect Skill Mappings
    mapping_chunks = [c for c in chunks if c["content_type"] == "skill_mapping"]
    assert len(mapping_chunks) == 7


# ==============================================================================
# 4. Idempotent Ingestion & No Duplicate Vectors
# ==============================================================================
def test_4_idempotent_ingestion_and_no_duplicates():
    """Verifies that running ingestion multiple times does not produce duplicate vectors."""
    res1 = rag_service.ingest_knowledge_base(force_reload=False)
    assert res1["success"] is True
    points1 = res1["total_upserted_points"]

    res2 = rag_service.ingest_knowledge_base(force_reload=False)
    assert res2["success"] is True
    points2 = res2["total_upserted_points"]

    info = rag_service.qdrant.get_collection_info(rag_service.KB_COLLECTION)
    assert info["points_count"] == points1, (
        f"Points count mismatch: expected {points1}, found {info['points_count']} (duplicate vectors detected!)"
    )


# ==============================================================================
# 5. Embedding Dimensions & Normalization
# ==============================================================================
def test_5_embedding_dimensions_and_normalization():
    """Verifies vector embedding dimension matches configuration and is L2 normalized."""
    provider = get_embedding_provider()
    assert provider.dimension == settings.EMBEDDING_DIMENSION

    test_text = "Data Structures and Algorithms BFS graph traversal queue"
    vec = provider.embed_text(test_text)
    assert len(vec) == settings.EMBEDDING_DIMENSION

    # Check L2 norm equals 1.0
    norm = math.sqrt(sum(x * x for x in vec))
    assert math.isclose(norm, 1.0, rel_tol=1e-3), f"Vector norm {norm} is not normalized!"


# ==============================================================================
# 6. Qdrant Collection Setup & Status Info
# ==============================================================================
def test_6_qdrant_collection_setup_and_status():
    """Verifies collection exists, has correct dimension and is queryable."""
    info = rag_service.qdrant.get_collection_info(rag_service.KB_COLLECTION)
    assert info["exists"] is True
    assert info["points_count"] >= 140
    assert info["embedding_dimension"] == settings.EMBEDDING_DIMENSION


# ==============================================================================
# 7. Metadata Filtering
# ==============================================================================
def test_7_metadata_filtering():
    """Verifies that searches with metadata filters return strictly matching records."""
    # Filter by role
    java_hits = rag_service.search_knowledge_base(
        query="OOP concepts",
        top_k=5,
        filters={"role": "java_developer"}
    )
    assert len(java_hits) > 0
    for h in java_hits:
        assert h["role"] == "java_developer"

    # Filter by content_type
    roadmap_hits = rag_service.search_knowledge_base(
        query="developer roadmap",
        top_k=4,
        filters={"content_type": "learning_roadmap"}
    )
    assert len(roadmap_hits) > 0
    for h in roadmap_hits:
        assert h["content_type"] == "learning_roadmap"


# ==============================================================================
# 8. Retrieval Relevance on Key User Queries
# ==============================================================================
def test_8_retrieval_relevance_key_queries():
    """Tests retrieval quality on the 4 primary representative test queries."""
    # 1. 'Give me Java interview questions'
    java_hits = rag_service.search_knowledge_base("Give me Java interview questions", top_k=3)
    assert len(java_hits) > 0
    assert any("java" in (h["section"] + h["question"]).lower() for h in java_hits)
    top_java = java_hits[0]
    assert top_java["score"] >= 0.70

    # 2. 'Explain BFS vs DFS'
    bfs_hits = rag_service.search_knowledge_base("Explain BFS vs DFS", top_k=2)
    assert len(bfs_hits) > 0
    assert "BFS vs DFS" in bfs_hits[0]["question"]
    assert "queue" in bfs_hits[0]["answer"].lower()
    assert bfs_hits[0]["score"] >= 0.85

    # 3. 'Prepare me for a frontend interview'
    fe_hits = rag_service.search_knowledge_base("Prepare me for a frontend interview", top_k=3)
    assert len(fe_hits) > 0
    assert any("frontend" in (h["section"] + h["role"] + h["question"]).lower() for h in fe_hits)

    # 4. 'What skills are required for an AI/ML engineer?'
    aiml_hits = rag_service.search_knowledge_base("What skills are required for an AI/ML engineer?", top_k=3)
    assert len(aiml_hits) > 0
    assert any("ai/ml" in (h["section"] + h["question"] + h["topic"]).lower() or "ai" in h["role"].lower() for h in aiml_hits)


# ==============================================================================
# 9. Grounded Answer Flow & Citations
# ==============================================================================
@pytest.mark.asyncio
async def test_9_grounded_answer_flow_and_citations():
    """Tests grounded response synthesis including verified source citations."""
    res = await rag_service.answer_grounded_query(
        query="Explain BFS vs DFS",
        user_role="student"
    )
    assert res["has_sufficient_evidence"] is True
    assert len(res["sources"]) > 0
    assert any("bfs" in s["question"].lower() for s in res["sources"])
    assert "bfs" in res["answer"].lower() or "graph" in res["answer"].lower()


# ==============================================================================
# 10. Insufficient Information / No-Hallucination Behavior
# ==============================================================================
@pytest.mark.asyncio
async def test_10_insufficient_information_behavior():
    """Tests that out-of-domain queries with strict filters do not hallucinate facts."""
    # Search with impossible filter
    res = await rag_service.answer_grounded_query(
        query="Explain quantum relativistic string theory cooking recipe",
        filters={"role": "non_existent_specialty_role_xyz"}
    )
    assert res["has_sufficient_evidence"] is False
    assert "does not contain sufficient verified evidence" in res["answer"]


# ==============================================================================
# 11. REST API Endpoints & Role Access Control
# ==============================================================================
def test_11_api_endpoints_and_access():
    """Tests FastAPI HTTP endpoints for status, retrieve, query, and role security."""
    client = TestClient(app)

    # 1. Status endpoint (Public/Unauthenticated health check)
    status_res = client.get("/api/v1/ai/rag/status")
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["collection_name"] == rag_service.KB_COLLECTION
    assert data["points_count"] >= 140

    # 2. Retrieve endpoint (Authenticated user)
    # Using student session token
    headers = {"Authorization": "Bearer session_u1000000-0000-0000-0000-000000000001"}
    retrieve_res = client.post(
        "/api/v1/ai/rag/retrieve",
        json={"query": "Explain BFS vs DFS", "top_k": 2},
        headers=headers
    )
    assert retrieve_res.status_code == 200
    ret_data = retrieve_res.json()
    assert ret_data["total_results"] > 0
    assert "BFS vs DFS" in ret_data["results"][0]["question"]

    # 3. Grounded query endpoint
    query_res = client.post(
        "/api/v1/ai/rag/query",
        json={"query": "What are the four pillars of OOP?", "role": "java_developer"},
        headers=headers
    )
    assert query_res.status_code == 200
    q_data = query_res.json()
    assert q_data["has_sufficient_evidence"] is True
    assert len(q_data["sources"]) > 0

    # 4. Ingest endpoint: Students are forbidden (HTTP 403)
    student_headers = {"Authorization": "Bearer session_u1000000-0000-0000-0000-000000000001"}
    ingest_forbidden = client.post("/api/v1/ai/rag/ingest", json={}, headers=student_headers)
    assert ingest_forbidden.status_code == 403

    # Ingest endpoint: Institution Admin / Academician / Super Admin allowed (HTTP 200)
    admin_headers = {"Authorization": "Bearer session_u1000000-0000-0000-0000-000000000005"}
    ingest_allowed = client.post("/api/v1/ai/rag/ingest", json={}, headers=admin_headers)
    assert ingest_allowed.status_code == 200
    assert ingest_allowed.json()["success"] is True
