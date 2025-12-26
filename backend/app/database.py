"""
Database connection management.

This module manages the Neo4j driver instance to avoid circular imports.
"""

from typing import Optional
from neo4j import AsyncDriver

# Global Neo4j driver instance
_neo4j_driver: Optional[AsyncDriver] = None


def set_neo4j_driver(driver: AsyncDriver) -> None:
    """Set the Neo4j driver instance."""
    global _neo4j_driver
    _neo4j_driver = driver


def get_neo4j_driver() -> Optional[AsyncDriver]:
    """Get the Neo4j driver instance."""
    return _neo4j_driver


async def close_neo4j_driver() -> None:
    """Close the Neo4j driver if it exists."""
    global _neo4j_driver
    if _neo4j_driver:
        await _neo4j_driver.close()
        _neo4j_driver = None
