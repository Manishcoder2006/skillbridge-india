import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("skillbridge.middleware.tenant")

class TenantContextMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds security headers and traces request tenant context.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        # Security hardening headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
