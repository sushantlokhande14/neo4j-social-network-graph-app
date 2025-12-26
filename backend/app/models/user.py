"""
User models for request/response validation.

Requirements: 4.2, 4.3, 4.4
"""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


VALID_AVATAR_IDS = [f"avatar_{i}" for i in range(1, 11)]


class OnboardingRequest(BaseModel):
    """
    Request model for user onboarding.
    
    Validates:
    - name: 1-50 characters (trimmed)
    - username: 3-20 characters, alphanumeric + underscore only
    - bio: max 160 characters (optional)
    - avatar: must be one of avatar_1 through avatar_10
    
    Requirements: 4.2, 4.3, 4.4, 2.1, 2.2
    """
    name: str = Field(
        ...,
        description="User's name (1-50 characters)"
    )
    username: str = Field(
        ...,
        description="Unique username (3-20 characters, alphanumeric + underscore)"
    )
    bio: str = Field(
        default="",
        description="User bio (max 160 characters)"
    )
    avatar: str = Field(
        ...,
        description="Avatar identifier (avatar_1 through avatar_10)"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate name is 1-50 characters after trimming."""
        trimmed = v.strip()
        if len(trimmed) < 1:
            raise ValueError("Name must be at least 1 character")
        if len(trimmed) > 50:
            raise ValueError("Name must be at most 50 characters")
        return trimmed

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username is 3-20 chars, alphanumeric + underscore only."""
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 20:
            raise ValueError("Username must be at most 20 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, and underscores"
            )
        return v

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v: str) -> str:
        """Validate bio is at most 160 characters."""
        if len(v) > 160:
            raise ValueError("Bio must be at most 160 characters")
        return v

    @field_validator("avatar")
    @classmethod
    def validate_avatar(cls, v: str) -> str:
        """Validate avatar is one of the 10 valid avatar IDs."""
        if v not in VALID_AVATAR_IDS:
            raise ValueError(
                f"Avatar must be one of: {', '.join(VALID_AVATAR_IDS)}"
            )
        return v


class ProfileResponse(BaseModel):
    """
    Response model for user profile data.
    Schema: bio, email, id, name, username, avatar, followers_count, following_count
    """
    id: str = Field(
        ...,
        description="Primary identifier"
    )
    name: str = Field(
        ...,
        description="User's name"
    )
    username: str = Field(
        ...,
        description="Unique username"
    )
    email: str = Field(
        ...,
        description="User's email"
    )
    bio: str = Field(
        default="",
        description="User bio"
    )
    avatar: str = Field(
        ...,
        description="Avatar identifier (avatar_1 through avatar_10)"
    )
    followers_count: int = Field(
        default=0,
        description="Number of followers"
    )
    following_count: int = Field(
        default=0,
        description="Number of users being followed"
    )


class OnboardingResponse(BaseModel):
    """
    Response model for successful onboarding.
    """
    success: bool = Field(
        ...,
        description="Whether onboarding was successful"
    )
    message: str = Field(
        ...,
        description="Success or error message"
    )


class ProfileUpdateRequest(BaseModel):
    """
    Request model for updating user profile.
    
    Validates:
    - name: 1-50 characters (trimmed)
    - username: 3-20 characters, alphanumeric + underscore only
    - bio: max 160 characters (optional)
    - avatar: must be one of avatar_1 through avatar_10
    
    Requirements: 2.1, 3.1, 4.1, 5.3
    """
    name: str = Field(
        ...,
        description="User's name (1-50 characters)"
    )
    username: str = Field(
        ...,
        description="Unique username (3-20 characters, alphanumeric + underscore)"
    )
    bio: str = Field(
        default="",
        description="User bio (max 160 characters)"
    )
    avatar: str = Field(
        ...,
        description="Avatar identifier (avatar_1 through avatar_10)"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate name is 1-50 characters after trimming."""
        trimmed = v.strip()
        if len(trimmed) < 1:
            raise ValueError("Name must be at least 1 character")
        if len(trimmed) > 50:
            raise ValueError("Name must be at most 50 characters")
        return trimmed

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username is 3-20 chars, alphanumeric + underscore only."""
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 20:
            raise ValueError("Username must be at most 20 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, and underscores"
            )
        return v

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v: str) -> str:
        """Validate bio is at most 160 characters."""
        if len(v) > 160:
            raise ValueError("Bio must be at most 160 characters")
        return v

    @field_validator("avatar")
    @classmethod
    def validate_avatar(cls, v: str) -> str:
        """Validate avatar is one of the 10 valid avatar IDs."""
        if v not in VALID_AVATAR_IDS:
            raise ValueError(
                f"Avatar must be one of: {', '.join(VALID_AVATAR_IDS)}"
            )
        return v
