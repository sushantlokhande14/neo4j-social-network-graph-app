"""
FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import AsyncGraphDatabase

from app.config import get_settings
from app.database import set_neo4j_driver, close_neo4j_driver
from app.routers import social_graph



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    settings = get_settings()
    
    # Initialize Neo4j driver on startup
    driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_username, settings.neo4j_password)
    )
    set_neo4j_driver(driver)
    
    yield
    
    # Close Neo4j driver on shutdown
    await close_neo4j_driver()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    
    app = FastAPI(
        title="Social Media App API",
        description="Backend API for the social media application",
        version="1.0.0",
        lifespan=lifespan
    )

    # Configure CORS middleware
    cors_origins = [origin.strip() for origin in settings.cors_origins.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Import routers here to avoid circular imports
    from app.routers import onboarding, profile, feed
    
    # Include routers
    app.include_router(onboarding.router)
    app.include_router(profile.router)
    app.include_router(feed.router)
    
    # Health check endpoint (Requirements 2.3)
    @app.get("/api/health", tags=["health"])
    async def health_check():
        """
        Health check endpoint.
        
        Returns service status for monitoring and load balancer health checks.
        
        Requirements: 2.3
        """
        return {"status": "healthy", "service": "social-media-api"}
    
    return app


# Create the app instance
app = create_app()


app.include_router(social_graph.router)