"""
Onboarding API endpoint.

Handles user profile creation during the onboarding process.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
import httpx

from app.config import get_settings
from app.dependencies import get_neo4j_service, get_current_user, ClerkUser
from app.models.user import OnboardingRequest, OnboardingResponse
from app.models.responses import ErrorResponse
from app.services.neo4j_service import Neo4jService, UserProfile


router = APIRouter(prefix="/api", tags=["onboarding"])


async def update_clerk_metadata(user_id: str, onboarded: bool) -> bool:
    """
    Update Clerk user public metadata to mark onboarding status.
    
    Args:
        user_id: The Clerk user ID
        onboarded: Whether the user has completed onboarding
        
    Returns:
        True if update was successful, False otherwise
    """
    settings = get_settings()
    
    url = f"https://api.clerk.com/v1/users/{user_id}/metadata"
    
    headers = {
        "Authorization": f"Bearer {settings.clerk_secret_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "public_metadata": {
            "onboarded": onboarded
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(url, headers=headers, json=payload)
            return response.status_code == 200
        except httpx.RequestError:
            return False


@router.post(
    "/onboarding",
    response_model=OnboardingResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        409: {"model": ErrorResponse, "description": "Username already taken"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def create_onboarding(
    request: OnboardingRequest,
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j_service: Annotated[Neo4jService, Depends(get_neo4j_service)],
) -> OnboardingResponse:
    """
    Complete user onboarding by creating their profile.
    
    Validates the request body, checks username availability,
    creates the user in Neo4j, and updates Clerk metadata.
    """
    # Check username availability
    username_available = await neo4j_service.is_username_available(request.username)
    if not username_available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken"
        )
    
    # Create user profile
    profile = UserProfile(
        id=current_user.id,
        name=request.name,
        username=request.username,
        email=current_user.email or "",
        bio=request.bio,
        avatar=request.avatar
    )
    
    try:
        await neo4j_service.create_user(profile)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user profile"
        )
    
    # Update Clerk metadata
    metadata_updated = await update_clerk_metadata(current_user.id, True)
    if not metadata_updated:
        # Log warning but don't fail - user is created in Neo4j
        pass
    
    return OnboardingResponse(
        success=True,
        message="Onboarding completed successfully"
    )
