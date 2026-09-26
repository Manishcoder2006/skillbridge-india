import logging
from typing import Dict, Any, List, Optional
from qdrant_client import QdrantClient, models
from app.core.config import settings
from app.services.ai.embedding_service import BaseEmbeddingProvider, get_embedding_provider

logger = logging.getLogger("skillbridge.ai.qdrant")


class QdrantManager:
    """
    Enterprise Qdrant Client & Vector Collection Manager.
    Supports in-memory zero-latency mode as well as remote Qdrant Cloud clusters.
    All credentials and URLs are configurable via environment variables.
    """

    def __init__(
        self,
        url: Optional[str] = None,
        api_key: Optional[str] = None,
        collection_name: Optional[str] = None,
    ):
        self.url = url if url is not None else settings.QDRANT_URL
        self.api_key = api_key if api_key is not None else settings.QDRANT_API_KEY
        self.collection_name = collection_name or settings.QDRANT_COLLECTION_NAME
        self.client: QdrantClient = self._init_client()

    def _init_client(self) -> QdrantClient:
        """Initializes the Qdrant client based on provided configuration."""
        self._connected_remote = False
        if self.url and self.url.strip() and not self.url.startswith("your-"):
            logger.info(f"[Qdrant] Connecting to remote Qdrant cluster: {self.url}")
            try:
                client = QdrantClient(
                    url=self.url.strip(),
                    api_key=self.api_key if self.api_key and not self.api_key.startswith("your-") else None,
                    timeout=15.0
                )
                # Verify network reachability
                client.get_collections()
                self._connected_remote = True
                logger.info("[Qdrant] Successfully verified remote Qdrant cluster connection.")
                return client
            except Exception as e:
                logger.warning(
                    f"[Qdrant] Remote cluster '{self.url}' unreachable ({e}). "
                    f"Falling back to local in-memory vector storage (:memory:)."
                )
                self._connected_remote = False
                return QdrantClient(":memory:")
        else:
            logger.info("[Qdrant] No remote QDRANT_URL configured. Initializing in-memory Qdrant instance (:memory:).")
            self._connected_remote = False
            return QdrantClient(":memory:")

    def is_remote(self) -> bool:
        """Returns True if connected to a verified remote Qdrant cluster."""
        return getattr(self, "_connected_remote", False)

    def ensure_collection(
        self,
        collection_name: Optional[str] = None,
        vector_dim: Optional[int] = None
    ) -> bool:
        """
        Ensures vector collection exists with matching vector dimension and cosine metric.
        Sets up payload index fields for fast filtering.
        """
        coll = collection_name or self.collection_name
        dim = vector_dim or settings.EMBEDDING_DIMENSION

        try:
            exists = self.client.collection_exists(coll)
            if not exists:
                logger.info(f"[Qdrant] Creating collection '{coll}' (dim={dim}, distance=COSINE)...")
                self.client.create_collection(
                    collection_name=coll,
                    vectors_config=models.VectorParams(
                        size=dim,
                        distance=models.Distance.COSINE
                    )
                )

                # Create payload keyword indices for fast filtering on remote server
                if self.is_remote():
                    index_fields = ["section", "content_type", "role", "topic", "difficulty", "document_id"]
                    for field in index_fields:
                        try:
                            self.client.create_payload_index(
                                collection_name=coll,
                                field_name=field,
                                field_schema=models.PayloadSchemaType.KEYWORD
                            )
                        except Exception as idx_err:
                            logger.debug(f"[Qdrant] Field index '{field}' note: {idx_err}")

                logger.info(f"[Qdrant] Collection '{coll}' created and indexed successfully.")
            return True
        except Exception as e:
            logger.error(f"[Qdrant] Error ensuring collection '{coll}': {e}")
            raise

    def get_collection_info(self, collection_name: Optional[str] = None) -> Dict[str, Any]:
        """Returns metadata, points count, and status of the vector collection."""
        coll = collection_name or self.collection_name
        try:
            if not self.client.collection_exists(coll):
                return {
                    "collection_name": coll,
                    "exists": False,
                    "points_count": 0,
                    "is_remote": self.is_remote(),
                    "cluster_url": self.url if self.is_remote() else ":memory:"
                }

            info = self.client.get_collection(coll)
            vectors_count = getattr(info, "points_count", None)
            if vectors_count is None:
                vectors_count = getattr(info, "vectors_count", 0)

            return {
                "collection_name": coll,
                "exists": True,
                "points_count": vectors_count or 0,
                "status": str(getattr(info, "status", "ready")),
                "is_remote": self.is_remote(),
                "cluster_url": self.url if self.is_remote() else ":memory:",
                "embedding_dimension": settings.EMBEDDING_DIMENSION,
                "embedding_provider": settings.EMBEDDING_PROVIDER
            }
        except Exception as e:
            logger.warning(f"[Qdrant] Could not fetch collection info for '{coll}': {e}")
            return {
                "collection_name": coll,
                "exists": False,
                "points_count": 0,
                "error": str(e),
                "is_remote": self.is_remote()
            }

    def upsert_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embedding_provider: Optional[BaseEmbeddingProvider] = None,
        collection_name: Optional[str] = None,
        batch_size: int = 64
    ) -> int:
        """
        Batch-embeds and upserts parsed knowledge base chunks into Qdrant.
        Uses chunk_id as stable point ID to guarantee idempotency (no duplicates).
        """
        coll = collection_name or self.collection_name
        provider = embedding_provider or get_embedding_provider()

        self.ensure_collection(collection_name=coll, vector_dim=provider.dimension)

        total_upserted = 0
        points_to_upsert: List[models.PointStruct] = []

        for i, chunk in enumerate(chunks):
            # Compute dense embedding
            text_to_embed = chunk["chunk_text"]
            vec = provider.embed_text(text_to_embed)

            # Construct PointStruct with chunk_id as point ID
            pt = models.PointStruct(
                id=chunk["chunk_id"],
                vector=vec,
                payload=chunk
            )
            points_to_upsert.append(pt)

            if len(points_to_upsert) >= batch_size or i == len(chunks) - 1:
                self.client.upsert(
                    collection_name=coll,
                    points=points_to_upsert
                )
                total_upserted += len(points_to_upsert)
                points_to_upsert = []

        logger.info(f"[Qdrant] Successfully upserted {total_upserted} points into '{coll}'.")
        return total_upserted

    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        score_threshold: float = 0.15,
        filters: Optional[Dict[str, Any]] = None,
        collection_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs vector similarity search with optional metadata filtering.
        """
        coll = collection_name or self.collection_name
        if not self.client.collection_exists(coll):
            logger.warning(f"[Qdrant] Collection '{coll}' does not exist.")
            return []

        qdrant_filter: Optional[models.Filter] = None
        if filters:
            conditions = []
            for k, v in filters.items():
                if v is not None and str(v).strip():
                    val = str(v).strip()
                    conditions.append(
                        models.FieldCondition(
                            key=k,
                            match=models.MatchValue(value=val)
                        )
                    )
            if conditions:
                qdrant_filter = models.Filter(must=conditions)

        try:
            hits = self.client.query_points(
                collection_name=coll,
                query=query_vector,
                query_filter=qdrant_filter,
                limit=top_k,
                score_threshold=score_threshold
            ).points
        except Exception as e:
            logger.error(f"[Qdrant] Query failed on '{coll}': {e}")
            return []

        results = []
        for hit in hits:
            payload = hit.payload or {}
            results.append({
                "chunk_id": str(hit.id),
                "score": round(float(hit.score), 4),
                "document_id": payload.get("document_id"),
                "section": payload.get("section"),
                "subsection": payload.get("subsection"),
                "content_type": payload.get("content_type"),
                "role": payload.get("role"),
                "topic": payload.get("topic"),
                "difficulty": payload.get("difficulty"),
                "question": payload.get("question"),
                "answer": payload.get("answer"),
                "chunk_text": payload.get("chunk_text"),
                "is_qa": payload.get("is_qa", False),
                "source_filename": payload.get("source_filename")
            })

        return results


qdrant_manager = QdrantManager()
