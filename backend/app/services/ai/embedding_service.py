import math
import re
import logging
from abc import ABC, abstractmethod
from typing import List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("skillbridge.ai.embeddings")


class BaseEmbeddingProvider(ABC):
    """Abstract Base Class for Embedding Providers."""

    @property
    @abstractmethod
    def dimension(self) -> int:
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]


class LocalDeterministicEmbeddingProvider(BaseEmbeddingProvider):
    """
    Zero-network, deterministic dense semantic embedding provider.
    Projects word-level tokens and character n-grams with frequency dampening
    and L2 normalization onto the configured dimension (default 384).
    Enables offline testability, zero-latency development, and idempotent vector testing.
    """

    def __init__(self, dimension: int = 384, model_name: str = "deterministic-384"):
        self._dim = dimension
        self._model_name = model_name

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return self._model_name

    def embed_text(self, text: str) -> List[float]:
        clean_text = text.lower().strip()
        vec = [0.0] * self._dim

        if not clean_text:
            vec[0] = 1.0
            return vec

        words = re.findall(r"\b\w+\b", clean_text)
        for w in words:
            # Word-level hash projection
            h = abs(hash(w)) % self._dim
            vec[h] += 1.5

            # 3-gram sub-tokens
            for i in range(len(w) - 2):
                tri = w[i:i+3]
                th = abs(hash(tri)) % self._dim
                vec[th] += 0.8

        # L2 Normalize
        magnitude = math.sqrt(sum(x * x for x in vec))
        if magnitude > 0:
            vec = [x / magnitude for x in vec]
        else:
            vec[0] = 1.0
        return vec


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """
    Google Gemini Embedding Provider (e.g. models/text-embedding-004).
    Requires valid GEMINI_API_KEY.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "text-embedding-004",
        dimension: int = 768
    ):
        self._api_key = api_key or settings.GEMINI_API_KEY
        self._model_name = model_name
        self._dim = dimension

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return self._model_name

    def embed_text(self, text: str) -> List[float]:
        if not self._api_key or self._api_key.startswith("your-"):
            raise ValueError("GEMINI_API_KEY is not configured for Gemini embeddings.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model_name}:embedContent?key={self._api_key}"
        payload = {
            "model": f"models/{self._model_name}",
            "content": {"parts": [{"text": text[:2048]}]}
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                res.raise_for_status()
                data = res.json()
                embedding = data.get("embedding", {}).get("values", [])
                if len(embedding) == self._dim:
                    return embedding
                elif len(embedding) > 0:
                    # Adjust dimension or warn
                    logger.warning(f"Returned embedding dimension {len(embedding)} != expected {self._dim}")
                    return embedding[:self._dim]
                raise ValueError("Empty embedding returned by Gemini API")
        except Exception as e:
            logger.error(f"Gemini embedding API call failed: {e}")
            raise


def get_embedding_provider() -> BaseEmbeddingProvider:
    """Factory to instantiate the configured embedding provider."""
    provider_type = (settings.EMBEDDING_PROVIDER or "local").lower().strip()
    dim = settings.EMBEDDING_DIMENSION or 384
    model_name = settings.EMBEDDING_MODEL_NAME or "deterministic-384"

    if provider_type == "gemini":
        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your-"):
            return GeminiEmbeddingProvider(
                api_key=settings.GEMINI_API_KEY,
                model_name=model_name if "embedding" in model_name else "text-embedding-004",
                dimension=dim
            )
        else:
            logger.warning("[RAG] GEMINI_API_KEY missing or placeholder. Falling back to local deterministic embedding.")
            return LocalDeterministicEmbeddingProvider(dimension=dim, model_name="deterministic-384")

    # Default: local deterministic
    return LocalDeterministicEmbeddingProvider(dimension=dim, model_name=model_name)
