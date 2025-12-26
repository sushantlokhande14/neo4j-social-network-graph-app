from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated

from app.dependencies import get_current_user, ClerkUser, get_neo4j_service
from app.services.neo4j_service import Neo4jService, UserProfile

router = APIRouter(prefix="/api/social", tags=["social"])

# -------------------- UC-5 Follow User --------------------
@router.post("/follow/{target_id}")
async def follow_user(
    target_id: str,
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
):
    if target_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    await neo4j.follow_user(current_user.id, target_id)
    return {"success": True, "message": "User followed successfully"}

# -------------------- UC-6 Unfollow User --------------------
@router.delete("/unfollow/{target_id}")
async def unfollow_user(
    target_id: str,
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
):
    await neo4j.unfollow_user(current_user.id, target_id)
    return {"success": True, "message": "User unfollowed successfully"}

# -------------------- UC-7 Following List --------------------
@router.get("/following")
async def get_following(
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
) -> list[UserProfile]:
    return await neo4j.get_following(current_user.id)


@router.get("/following/{user_id}")
async def get_following_for_user(
    user_id: str,
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
) -> list[UserProfile]:
    """Get the list of users that a specific user is following."""
    return await neo4j.get_following(user_id)

# -------------------- UC-7 Followers List --------------------
@router.get("/followers")
async def get_followers(
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
) -> list[UserProfile]:
    return await neo4j.get_followers(current_user.id)


@router.get("/followers/{user_id}")
async def get_followers_for_user(
    user_id: str,
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
) -> list[UserProfile]:
    """Get the list of users who follow a specific user."""
    return await neo4j.get_followers(user_id)

# -------------------- UC-8 Mutual Connections --------------------
@router.get("/mutual/{other_id}")
async def mutual_connections(
    other_id: str,
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
):
    return await neo4j.get_mutual_connections(current_user.id, other_id)

@router.get("/mutual/{other_id}")
async def mutual_connections(
    other_id: str,
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
):
    """
    UC-8: Get mutual connections between the current user and another user.
    """
    return await neo4j.get_mutual_connections(current_user.id, other_id)


@router.get("/users")
async def list_users(
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
):
    return await neo4j.get_all_users_except(current_user.id)

# -------------------- UC-9 Suggested Users --------------------
@router.get("/suggestions")
async def get_suggested_users(
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
) -> list[UserProfile]:
    """Get new people for user follow based on common connections."""
    return await neo4j.get_following_suggestions(current_user.id)

# -------------------- UC-10 Search Users --------------------
@router.get("/users/search")
async def search_users(
    q: str,
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
) -> list[UserProfile]:
    """Search for users by username or name."""
    if not q or not q.strip():
        return []
    return await neo4j.search_users(q.strip(), current_user.id)

# -------------------- UC-11 Explore Popular Users --------------------
@router.get("/popular")
async def explore_popular_users(
    current_user: Annotated[ClerkUser, Depends(get_current_user)],
    neo4j: Annotated[Neo4jService, Depends(get_neo4j_service)]
) -> list[UserProfile]:
    """Get popular users based on follower count."""
    return await neo4j.explore_popular_users()