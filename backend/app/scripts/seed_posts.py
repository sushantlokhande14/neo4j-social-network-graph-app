"""
Seed script to create posts and link them to users in Neo4j.

This script picks random users and creates sample posts for them in bulk.
"""

import asyncio

from neo4j import AsyncGraphDatabase

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.config import get_settings


async def seed_posts(limit: int = 550):
    """Create posts for random users in a single bulk query."""
    settings = get_settings()
    
    driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_username, settings.neo4j_password)
    )
    
    try:
        async with driver.session() as session:
            result = await session.run(
                """
                MATCH (u:User)
                WITH u, rand() AS r
                ORDER BY r
                LIMIT $limit
                CREATE (u)-[:POSTED]->(:Post {
                    id: randomUUID(),
                    content: "This is a sample post by " + u.name + ".",
                    createdAt: datetime()
                })
                RETURN count(*) as created
                """,
                limit=limit
            )
            record = await result.single()
            print(f"Created {record['created']} posts for random users")
            
    finally:
        await driver.close()


if __name__ == "__main__":
    asyncio.run(seed_posts())
