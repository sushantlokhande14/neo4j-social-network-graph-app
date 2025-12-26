"""
Dependency injection for FastAPI routes.
"""

from typing import AsyncGenerator
from neo4j import AsyncSession

from app.database import get_neo4j_driver
from app.services.neo4j_service import Neo4jService
from app.middleware.auth import (
    ClerkUser,
    get_current_user,
    get_optional_user,
)

# Re-export auth dependencies for convenience
__all__ = [
    "get_db_session",
    "get_neo4j_service",
    "ClerkUser",
    "get_current_user",
    "get_optional_user",
]


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a Neo4j session.
    Automatically closes the session after the request.
    """
    driver = get_neo4j_driver()
    if driver is None:
        raise RuntimeError("Neo4j driver not initialized")
    
    session = driver.session()
    try:
        yield session
    finally:
        await session.close()


async def get_neo4j_service() -> AsyncGenerator[Neo4jService, None]:
    """
    Dependency that provides a Neo4jService instance.
    Automatically manages the underlying session lifecycle.
    """
    driver = get_neo4j_driver()
    if driver is None:
        raise RuntimeError("Neo4j driver not initialized")
    
    session = driver.session()
    try:
        yield Neo4jService(session)
    finally:
        await session.close()
