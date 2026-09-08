import json
import logging
import time
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("skillbridge.ai.groq")

class GroqService:
    """Service client for Groq Cloud ultra-fast LPU inference (Llama 3.3)."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model_name = settings.GROQ_DEFAULT_MODEL or "llama-3.3-70b-versatile"
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_structured_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        fallback_data: Optional[Dict[str, Any]] = None
    ) -> tuple[Dict[str, Any], int, bool]:
        """
        Calls Groq REST API with JSON response formatting.
        Returns: (parsed_data, latency_ms, is_simulated_fallback)
        """
        start_time = time.time()

        if not self.api_key or self.api_key.startswith("your-"):
            if not settings.AI_SIMULATION_FALLBACK or fallback_data is None:
                raise RuntimeError("Groq API key not configured or invalid")
            logger.info("Groq API key not configured. Using deterministic high-fidelity simulation engine.")
            latency = int((time.time() - start_time) * 1000) + 90
            return (fallback_data or {}, latency, True)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        import asyncio

        sys_msg = (system_instruction or "You are an expert AI service.") + "\nYou MUST format your response strictly as a valid JSON object."
        messages = [
            {"role": "system", "content": sys_msg},
            {"role": "user", "content": prompt}
        ]

        # Try active primary model, with fast fallback to secondary Groq model if 404/rate-limited
        models_to_try = [self.model_name]
        for alt in ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound", "groq/compound-mini"]:
            if alt not in models_to_try:
                models_to_try.append(alt)

        last_error = "Groq request failed"
        for candidate_model in models_to_try:
            payload = {
                "model": candidate_model,
                "messages": messages,
                "temperature": 0.2,
                "response_format": {"type": "json_object"}
            }

            try:
                async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
                    res = await client.post(self.base_url, json=payload, headers=headers)
                    latency = int((time.time() - start_time) * 1000)

                    if res.status_code == 429:
                        logger.warning(f"Groq rate limit (429) hit on '{candidate_model}'. Backing off 2s...")
                        await asyncio.sleep(2.0)

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
                            logger.info(f"[Groq] Successfully generated response using model '{candidate_model}' in {latency}ms")
                            return (parsed, latency, False)

                    last_error = f"Groq API returned status {res.status_code}: {res.text[:200]}"
                    logger.warning(f"Groq attempt with '{candidate_model}' failed: {last_error}")
            except Exception as e:
                last_error = f"Groq exception with '{candidate_model}': {e}"
                logger.warning(last_error)

        if not settings.AI_SIMULATION_FALLBACK or fallback_data is None:
            raise RuntimeError(f"All Groq models failed: {last_error}")

        latency = int((time.time() - start_time) * 1000) + 110
        return (fallback_data or {}, latency, True)


groq_service = GroqService()
