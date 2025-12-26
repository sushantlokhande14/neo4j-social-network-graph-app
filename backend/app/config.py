"""
Application configuration using pydantic-settings.
Loads configuration from environment variables.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Neo4j Configuration
    neo4j_uri: str
    neo4j_username: str
    neo4j_password: str
    
    # Clerk Authentication Configuration
    clerk_secret_key: str
    clerk_frontend_api: str = "clerk.your-domain.com"  # e.g., "clerk.example.com" or from Clerk dashboard
    
    # Server Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # CORS Configuration
    cors_origins: str = "http://localhost:5173"  # Vite default port
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
