"""
Neo4j service layer for user operations.

This service provides methods for interacting with the Neo4j database
for user-related operations including creation, retrieval, and validation.
"""

from typing import Optional

from neo4j import AsyncSession
from pydantic import BaseModel


class UserProfile(BaseModel):
    """User profile data model for Neo4j operations.
    Schema: bio, email, id, name, username, avatar, followers_count, following_count
    """
    id: str
    name: str
    username: str
    email: str
    bio: str = ""
    avatar: str = "avatar_1"
    followers_count: int = 0
    following_count: int = 0


class FeedPostAuthor(BaseModel):
    """Author information for a feed post."""
    id: str
    name: str
    username: str


class FeedPost(BaseModel):
    """Feed post data model for displaying posts from followed users.
    
    Contains post content and author information needed for feed display.
    """
    id: str
    content: str
    createdAt: str
    author: FeedPostAuthor


class Neo4jService:
    """
    Service class for Neo4j database operations.
    
    Provides methods for:
    - Creating users
    - Retrieving users by Clerk user ID
    - Checking username availability
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize the Neo4j service with a database session.
        
        Args:
            session: An async Neo4j session for database operations.
        """
        self._session = session

    async def create_user(self, profile: UserProfile) -> None:
        """
        Create a new user node in Neo4j.
        
        Creates a User node with all profile fields. The username should
        be verified as available before calling this method.
        
        Args:
            profile: UserProfile containing all user data to store.
        """
        query = """
        CREATE (u:User {
            id: $id,
            name: $name,
            username: $username,
            email: $email,
            bio: $bio,
            avatar: $avatar
        })
        """
        await self._session.run(
            query,
            id=profile.id,
            name=profile.name,
            username=profile.username,
            email=profile.email,
            bio=profile.bio,
            avatar=profile.avatar
        )

    async def get_user_by_id(
        self, 
        user_id: str
    ) -> Optional[UserProfile]:
        """
        Retrieve a user profile from Neo4j by their ID.
        
        Args:
            user_id: The user identifier.
            
        Returns:
            UserProfile if found, None otherwise.
        """
        query = """
        MATCH (u:User {id: $user_id})
        RETURN u
        """
        result = await self._session.run(query, user_id=user_id)
        record = await result.single()

        if record is None:
            return None

        node = record["u"]
        return UserProfile(
            id=str(node["id"]),
            name=node["name"],
            username=node["username"],
            email=node["email"],
            bio=node.get("bio", ""),
            avatar=node.get("avatar", "avatar_1")
        )

    async def get_user_by_username(self, username: str) -> Optional[UserProfile]:
        """
        Retrieve a user profile from Neo4j by their username.
        
        Args:
            username: The username to look up.
            
        Returns:
            UserProfile if found, None otherwise.
        """
        query = """
        MATCH (u:User {username: $username})
        RETURN u
        """
        result = await self._session.run(query, username=username)
        record = await result.single()

        if record is None:
            return None

        node = record["u"]
        return UserProfile(
            id=str(node["id"]),
            name=node["name"],
            username=node["username"],
            email=node["email"],
            bio=node.get("bio", ""),
            avatar=node.get("avatar", "avatar_1")
        )

    async def get_follow_counts(self, user_id: str) -> tuple[int, int]:
        """
        Get the follower and following counts for a user.
        
        Args:
            user_id: The user identifier.
            
        Returns:
            Tuple of (followers_count, following_count).
        """
        # Use separate counts to avoid cartesian product issues
        followers_query = """
        MATCH (follower:User)-[:FOLLOWS]->(u:User {id: $user_id})
        RETURN count(follower) as count
        """
        following_query = """
        MATCH (u:User {id: $user_id})-[:FOLLOWS]->(following:User)
        RETURN count(following) as count
        """

        followers_result = await self._session.run(followers_query, user_id=user_id)
        followers_record = await followers_result.single()
        followers_count = followers_record["count"] if followers_record else 0

        following_result = await self._session.run(following_query, user_id=user_id)
        following_record = await following_result.single()
        following_count = following_record["count"] if following_record else 0

        return (followers_count, following_count)

    async def is_username_available(self, username: str) -> bool:
        """
        Check if a username is available (not already taken).
        
        Performs a case-insensitive check to ensure username uniqueness.
        
        Args:
            username: The username to check for availability.
            
        Returns:
            True if the username is available, False if already taken.
        """
        query = """
        MATCH (u:User)
        WHERE toLower(u.username) = toLower($username)
        RETURN count(u) as count
        """
        result = await self._session.run(query, username=username)
        record = await result.single()

        return record["count"] == 0

    async def is_username_available_for_user(
        self,
        username: str,
        current_user_id: str
    ) -> bool:
        """
        Check if a username is available, excluding the current user.
        
        Allows a user to keep their own username during profile updates.
        Performs a case-insensitive check to ensure username uniqueness.
        
        Args:
            username: The username to check for availability.
            current_user_id: The ID of the user making the update.
            
        Returns:
            True if the username is available (or belongs to current user),
            False if already taken by another user.
            
        Requirements: 3.3, 3.4
        """
        query = """
        MATCH (u:User)
        WHERE toLower(u.username) = toLower($username)
          AND u.id <> $current_user_id
        RETURN count(u) as count
        """
        result = await self._session.run(
            query,
            username=username,
            current_user_id=current_user_id
        )
        record = await result.single()

        return record["count"] == 0

    async def update_user(
        self,
        user_id: str,
        name: str,
        username: str,
        bio: str,
        avatar: str
    ) -> UserProfile:
        """
        Update user profile in Neo4j.
        
        Updates the user's name, username, bio, and avatar fields.
        The username uniqueness should be verified before calling this method.
        
        Args:
            user_id: The user identifier.
            name: The new display name.
            username: The new username.
            bio: The new bio.
            avatar: The new avatar identifier.
            
        Returns:
            Updated UserProfile.
            
        Raises:
            ValueError: If user not found.
            
        Requirements: 2.3, 3.5, 4.3, 5.3
        """
        query = """
        MATCH (u:User {id: $user_id})
        SET u.name = $name,
            u.username = $username,
            u.bio = $bio,
            u.avatar = $avatar
        RETURN u
        """
        result = await self._session.run(
            query,
            user_id=user_id,
            name=name,
            username=username,
            bio=bio,
            avatar=avatar
        )
        record = await result.single()

        if record is None:
            raise ValueError("User not found")

        node = record["u"]
        return UserProfile(
            id=str(node["id"]),
            name=node["name"],
            username=node["username"],
            email=node["email"],
            bio=node["bio"],
            avatar=node["avatar"]
        )

    async def get_feed_posts(self, user_id: str) -> list[FeedPost]:
        """
        Retrieve posts from users that the given user follows.
        
        Queries the Neo4j database for all posts created by users that
        the specified user follows, ordered by creation date descending.
        
        Args:
            user_id: The ID of the user whose feed to retrieve.
            
        Returns:
            List of FeedPost objects ordered by creation date (newest first).
        """
        query = """
        MATCH (me:User {id: $userId})-[:FOLLOWS]->(followed:User)-[:POSTED]->(post:Post)
        RETURN post, followed
        ORDER BY post.createdAt DESC
        """
        result = await self._session.run(query, userId=user_id)
        records = await result.data()

        feed_posts = []
        for record in records:
            post = record["post"]
            followed = record["followed"]
            # Skip posts with missing required fields
            if not post.get("id") or not post.get("content"):
                continue
            # Convert createdAt to ISO string if it's a DateTime object
            created_at = post.get("createdAt", "")
            if hasattr(created_at, "isoformat"):
                created_at = created_at.isoformat()
            feed_posts.append(FeedPost(
                id=str(post["id"]),
                content=post["content"],
                createdAt=str(created_at),
                author=FeedPostAuthor(
                    id=str(followed["id"]),
                    name=followed["name"],
                    username=followed["username"]
                )
            ))

        return feed_posts

    async def follow_user(self, user_id: str, target_id: str) -> None:
        """
        Create a FOLLOWS relationship from user_id -> target_id.
        Requirements: UC-5 Follow Another User
        """
        query = """
        MATCH (u:User {id: $user_id}), (t:User {id: $target_id})
        MERGE (u)-[:FOLLOWS]->(t)
        RETURN u.id as source, t.id as target
        """
        result = await self._session.run(query, user_id=user_id, target_id=target_id)
        record = await result.single()
        if record is None:
            # Log for debugging - one or both users don't exist
            print(f"WARNING: follow_user failed - user_id={user_id}, target_id={target_id} - one or both users not found")

    async def unfollow_user(self, user_id: str, target_id: str) -> None:
        """
        Remove a FOLLOWS relationship.
        Requirements: UC-6 Unfollow a User
        """
        query = """
        MATCH (u:User {id: $user_id})-[f:FOLLOWS]->(t:User {id: $target_id})
        DELETE f
        """
        result = await self._session.run(query, user_id=user_id, target_id=target_id)
        await result.consume()

    async def get_following(self, user_id: str) -> list[UserProfile]:
        """
        Get list of users that current user is following.
        Requirements: UC-7 View Connections
        """
        query = """
        MATCH (u:User {id: $user_id})-[:FOLLOWS]->(f:User)
        RETURN f
        """
        result = await self._session.run(query, user_id=user_id)
        records = await result.data()

        following = []
        for record in records:
            node = record["f"]
            following.append(UserProfile(
                id=str(node["id"]),
                name=node["name"],
                username=node["username"],
                email=node["email"],
                bio=node.get("bio", ""),
                avatar=node.get("avatar", "avatar_1")
            ))
        return following

    async def get_followers(self, user_id: str) -> list[UserProfile]:
        """
        Get list of users who follow the current user.
        Requirements: UC-7 View Connections
        """
        query = """
        MATCH (f:User)-[:FOLLOWS]->(u:User {id: $user_id})
        RETURN f
        """
        result = await self._session.run(query, user_id=user_id)
        records = await result.data()

        followers = []
        for record in records:
            node = record["f"]
            followers.append(UserProfile(
                id=str(node["id"]),
                name=node["name"],
                username=node["username"],
                email=node["email"],
                bio=node.get("bio", ""),
                avatar=node.get("avatar", "avatar_1")
            ))
        return followers

    async def get_mutual_connections(self, user1: str, user2: str) -> list[UserProfile]:
        """
        Get mutual connections between two users.
        Requirements: UC-8 Mutual Connections
         """
        query = """
        MATCH (u1:User {id: $user1})-[:FOLLOWS]->(m:User),
            (u2:User {id: $user2})-[:FOLLOWS]->(m)
        RETURN m
        """
        result = await self._session.run(query, user1=user1, user2=user2)
        records = await result.data()

        mutual = []
        for record in records:
            node = record["m"]
            mutual.append(UserProfile(
                id=str(node["id"]),
                name=node["name"],
                username=node["username"],
                email=node["email"],
                bio=node.get("bio", ""),
                avatar=node.get("avatar", "avatar_1")
            ))
        return mutual

    async def get_following_suggestions(self, user_id:str, limit:int=10) -> list[UserProfile]:
        """
        Get following suggestions for a user.
        """
        query = """
        MATCH (u1:User {id:$user_id})-[:FOLLOWS]->(u2:User)-[:FOLLOWS]->(c:User)
        WHERE NOT (u1)-[:FOLLOWS]->(c) AND c <> u1
        WITH c, count(DISTINCT u2) AS mutualCount
        OPTIONAL MATCH (c)<-[:FOLLOWS]-(follower:User)
        RETURN c, mutualCount, count(DISTINCT follower) AS followers
        ORDER BY mutualCount DESC
        LIMIT 10;
        """
        result = await self._session.run(query, user_id=user_id)
        records = await result.data()

        suggestions = []
        for record in records:
            node = record["c"]
            suggestions.append(UserProfile(
                id=str(node["id"])),
                name=node["name"],
                username=node["username"],
                email=node["email"],
                bio=node.get("bio", ""),
                avatar=node.get("avatar", "avatar_1"),
                followers_count=record.get("followers", 0)
            )
        return suggestions

    async def search_users(self, search_term: str, user_id:str) -> list[UserProfile]:
        """
        Search for users by username or name.
        Used for Search functionality.
        """
        query = """
        MATCH (u:User)
        WHERE (toLower(u.name) CONTAINS toLower($search_term) 
               OR toLower(u.username) CONTAINS toLower($search_term))
              AND u.id <> $user_id
        OPTIONAL MATCH (u)<-[:FOLLOWS]-(follower:User)
        RETURN u, count(DISTINCT follower) AS followers
        """
        result = await self._session.run(query, search_term=search_term, user_id=user_id)
        records = await result.data()

        users = []
        for record in records:
            node = record["u"]
            users.append(UserProfile(
                id=str(node["id"])),
                name=node["name"],
                username=node["username"],
                email=node["email"],
                bio=node.get("bio", ""),
                avatar=node.get("avatar", "avatar_1"),
                followers_count=record.get("followers", 0)
            )
        return users

    async def explore_popular_users(self, limit:int=10) -> list[UserProfile]:
        """
        Get popular users based on follower count.
        Used for Explore Popular Users functionality.
        """
        query = """
        MATCH (u:User)<-[:FOLLOWS]-(u2:User)
        RETURN u, count(DISTINCT u2) as followers 
        ORDER BY followers DESC
        LIMIT $limit
        """
        result = await self._session.run(query, limit=limit)
        records = await result.data()

        users = []
        for record in records:
            node = record["u"]
            users.append(UserProfile(
                id=str(node["id"])),
                name=node["name"],
                username=node["username"],
                email=node["email"],
                bio=node.get("bio", ""),
                avatar=node.get("avatar", "avatar_1"),
                followers_count=record.get("followers", 0),
                following_count=record.get("following_count", 0)
            )
        return users

    async def get_all_users_except(self, user_id: str) -> list[UserProfile]:
        """
        Get all users except the current user.
        Used for Explore page.
        """
        query = """
        MATCH (u:User)
        WHERE u.id <> $user_id
        RETURN u
        ORDER BY u.username
        """
        result = await self._session.run(query, user_id=user_id)
        records = await result.data()

        users = []
        for record in records:
            node = record["u"]
            users.append(UserProfile(
                id=str(node["id"])),
                name=node["name"],
                username=node["username"],
                email=node["email"],
                bio=node.get("bio", ""),
                avatar=node.get("avatar", "avatar_1")
            )
        return users
