"""
Common response models for API endpoints.
"""

from typing import Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """
    Standard error response format.
    
    Used for validation errors, authentication errors, and other API errors.
    """
    error: str = Field(
        ...,
        description="Error type or message"
    )
    detail: Optional[str] = Field(
        default=None,
        description="Additional error details"
    )
