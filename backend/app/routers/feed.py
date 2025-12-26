"""
Feed API endpoint.

Handles retrieval of posts from followed users for the home feed.
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies import get_neo4j_service, get_current_user, ClerkUser
from app.models.responses import ErrorResponse
from app.services.neo4j_service import Neo4jService, FeedPost


class FeedResponse(BaseModel):
    """Response model for the feed endpoint."""
    posts: List[FeedPost]


router = APIRouter(prefix="/api", tags=["feed"])


@router.get(
    "/feed",
    response_model=FeedResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def get_feed(
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j_service: Annotated[Neo4jService, Depends(get_neo4j_service)],
) -> FeedResponse:
    """
    Get posts from users the current user follows.
    
    Returns posts ordered by creation date (newest first).
    Returns an empty array if the user doesn't follow anyone
    or if followed users have no posts.
    
    Requirements: 2.1, 2.2
    """
    try:
        posts = await neo4j_service.get_feed_posts(current_user.id)
    except Exception as e:
        import logging
        logging.exception(f"Failed to retrieve feed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feed"
        )
    
    return FeedResponse(posts=posts)
