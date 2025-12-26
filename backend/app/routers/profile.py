"""
Profile API endpoint.

Handles user profile retrieval and updates.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_neo4j_service, get_current_user, ClerkUser
from app.models.user import ProfileResponse, ProfileUpdateRequest
from app.models.responses import ErrorResponse
from app.services.neo4j_service import Neo4jService

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api", tags=["profile"])


@router.get(
    "/profile/by-username/{username}",
    response_model=ProfileResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Profile not found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def get_profile_by_username(
    username: str,
    neo4j_service: Annotated[Neo4jService, Depends(get_neo4j_service)],
) -> ProfileResponse:
    """
    Get a user profile by username.
    
    Queries Neo4j for the user profile and returns it if found.
    Includes real follower and following counts from the graph.
    """
    try:
        profile = await neo4j_service.get_user_by_username(username)
    except Exception as e:
        logger.exception(f"Failed to retrieve profile for username={username}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )
    
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Get follower and following counts from the graph
    try:
        followers_count, following_count = await neo4j_service.get_follow_counts(profile.id)
    except Exception as e:
        logger.exception(f"Failed to retrieve follow counts for user_id={profile.id}: {e}")
        followers_count, following_count = 0, 0
    
    return ProfileResponse(
        id=profile.id,
        name=profile.name,
        username=profile.username,
        email=profile.email,
        bio=profile.bio,
        avatar=profile.avatar,
        followers_count=followers_count,
        following_count=following_count
    )


@router.get(
    "/profile/{user_id}",
    response_model=ProfileResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Profile not found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def get_profile(
    user_id: str,
    neo4j_service: Annotated[Neo4jService, Depends(get_neo4j_service)],
) -> ProfileResponse:
    """
    Get a user profile by user ID.
    
    Queries Neo4j for the user profile and returns it if found.
    Includes real follower and following counts from the graph.
    """
    try:
        profile = await neo4j_service.get_user_by_id(user_id)
    except Exception as e:
        logger.exception(f"Failed to retrieve profile for user_id={user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )
    
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Get follower and following counts from the graph
    try:
        followers_count, following_count = await neo4j_service.get_follow_counts(user_id)
    except Exception as e:
        logger.exception(f"Failed to retrieve follow counts for user_id={user_id}: {e}")
        followers_count, following_count = 0, 0
    
    return ProfileResponse(
        id=profile.id,
        name=profile.name,
        username=profile.username,
        email=profile.email,
        bio=profile.bio,
        avatar=profile.avatar,
        followers_count=followers_count,
        following_count=following_count
    )


@router.patch(
    "/profile/{user_id}",
    response_model=ProfileResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Cannot edit another user's profile"},
        404: {"model": ErrorResponse, "description": "Profile not found"},
        409: {"model": ErrorResponse, "description": "Username already taken"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def update_profile(
    user_id: str,
    request: ProfileUpdateRequest,
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j_service: Annotated[Neo4jService, Depends(get_neo4j_service)],
) -> ProfileResponse:
    """
    Update a user's profile.
    
    Allows authenticated users to update their own profile information.
    Validates all fields and checks username uniqueness.
    
    Requirements: 6.1, 6.2, 6.3
    """
    # Authorization check: user can only edit their own profile
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit another user's profile"
        )
    
    # Get current profile to check if username changed
    try:
        current_profile = await neo4j_service.get_user_by_id(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )
    
    if current_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Check username uniqueness only if username changed (case-insensitive)
    if request.username.lower() != current_profile.username.lower():
        try:
            is_available = await neo4j_service.is_username_available_for_user(
                request.username,
                user_id
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to check username availability"
            )
        
        if not is_available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken"
            )
    
    # Update the profile
    try:
        updated_profile = await neo4j_service.update_user(
            user_id=user_id,
            name=request.name,
            username=request.username,
            bio=request.bio,
            avatar=request.avatar
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return ProfileResponse(
        id=updated_profile.id,
        name=updated_profile.name,
        username=updated_profile.username,
        email=updated_profile.email,
        bio=updated_profile.bio,
        avatar=updated_profile.avatar
    )
