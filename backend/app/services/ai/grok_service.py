import json
import logging
import time
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("skillbridge.ai.grok")

class GrokService:
    """Service client for xAI Grok models."""

    def __init__(self):
        self.api_key = settings.effective_grok_key
        self.model_name = "grok-beta"
        self.base_url = "https://api.x.ai/v1/chat/completions"

    async def generate_structured_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        fallback_data: Optional[Dict[str, Any]] = None
    ) -> tuple[Dict[str, Any], int, bool]:
        """
        Calls xAI Grok REST API with JSON response formatting.
        Returns: (parsed_data, latency_ms, is_simulated_fallback)
        """
        start_time = time.time()

        if not self.api_key or self.api_key.startswith("your-"):
            logger.info("xAI Grok API key not configured. Using deterministic high-fidelity simulation engine.")
            latency = int((time.time() - start_time) * 1000) + 140
            return (fallback_data or {}, latency, True)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }

        try:
            async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
                res = await client.post(self.base_url, headers=headers, json=payload)
                latency = int((time.time() - start_time) * 1000)

                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        raw_content = choices[0].get("message", {}).get("content", "{}").strip()
                        if raw_content.startswith("```json"):
                            raw_content = raw_content[7:]
                        if raw_content.startswith("```"):
                            raw_content = raw_content[3:]
                        if raw_content.endswith("```"):
                            raw_content = raw_content[:-3]
                        parsed = json.loads(raw_content.strip())
                        return (parsed, latency, False)

                logger.warning(f"Grok API returned status {res.status_code}: {res.text}. Falling back to simulation.")
        except Exception as e:
            logger.warning(f"Grok API call failed with exception: {e}. Falling back to simulation.")

        latency = int((time.time() - start_time) * 1000) + 160
        return (fallback_data or {}, latency, True)


grok_service = GrokService()
