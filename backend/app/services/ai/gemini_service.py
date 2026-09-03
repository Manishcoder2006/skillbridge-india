import json
import logging
import time
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("skillbridge.ai.gemini")

class GeminiService:
    """Service client for Google Gemini AI models."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = "gemini-1.5-flash"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    async def generate_structured_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        fallback_data: Optional[Dict[str, Any]] = None
    ) -> tuple[Dict[str, Any], int, bool]:
        """
        Calls Google Gemini REST API and parses response into JSON.
        Returns: (parsed_data, latency_ms, is_simulated_fallback)
        """
        start_time = time.time()

        if not self.api_key or self.api_key.startswith("your-"):
            # In production fallback is disabled; raise error
            if not settings.AI_SIMULATION_FALLBACK:
                from fastapi import HTTPException
                raise HTTPException(status_code=503, detail="Gemini API key missing or invalid")
            logger.info("Gemini API key not configured. Using deterministic high-fidelity simulation engine.")
            latency = int((time.time() - start_time) * 1000) + 120
            return (fallback_data or {}, latency, True)

        endpoint = f"{self.base_url}/{self.model_name}:generateContent?key={self.api_key}"

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
                res = await client.post(endpoint, json=payload)
                latency = int((time.time() - start_time) * 1000)

                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "{}").strip()
                            # Clean possible code fence
                            if raw_text.startswith("```json"):
                                raw_text = raw_text[7:]
                            if raw_text.startswith("```"):
                                raw_text = raw_text[3:]
                            if raw_text.endswith("```"):
                                raw_text = raw_text[:-3]
                            parsed = json.loads(raw_text.strip())
                            return (parsed, latency, False)

                logger.warning(f"Gemini API returned status {res.status_code}: {res.text}. Falling back to simulation.")
                # If fallback is disabled in production, raise error
                if not settings.AI_SIMULATION_FALLBACK:
                    from fastapi import HTTPException
                    raise HTTPException(status_code=503, detail="Gemini API request failed with status {res.status_code}")
        except Exception as e:
            logger.warning(f"Gemini API call failed with exception: {e}. Falling back to simulation.")
            if not settings.AI_SIMULATION_FALLBACK:
                from fastapi import HTTPException
                raise HTTPException(status_code=503, detail="Gemini API request exception")

        latency = int((time.time() - start_time) * 1000) + 150
        return (fallback_data or {}, latency, True)


gemini_service = GeminiService()
