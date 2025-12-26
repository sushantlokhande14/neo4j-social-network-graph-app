"""
Middleware module for the FastAPI application.
"""

from app.middleware.auth import (
    ClerkUser,
    extract_token_from_header,
    verify_clerk_token,
    get_current_user,
    get_optional_user,
)

__all__ = [
    "ClerkUser",
    "extract_token_from_header",
    "verify_clerk_token",
    "get_current_user",
    "get_optional_user",
]
