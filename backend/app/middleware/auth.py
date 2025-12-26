"""
Clerk token verification middleware.
Provides authentication dependency for protected routes.
"""

from typing import Optional
from fastapi import Header, HTTPException, status
from pydantic import BaseModel
import httpx
import jwt
from jwt import PyJWKClient

from app.config import get_settings


class ClerkUser(BaseModel):
    """Authenticated user information from Clerk."""
    id: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image_url: Optional[str] = None
    public_metadata: Optional[dict] = None


# Cache the JWKS client
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    """Get or create the JWKS client for Clerk token verification."""
    global _jwks_client
    if _jwks_client is None:
        settings = get_settings()
        jwks_url = f"https://{settings.clerk_frontend_api}/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


def extract_token_from_header(authorization: Optional[str]) -> Optional[str]:
    """
    Extract the Bearer token from the Authorization header.
    
    Args:
        authorization: The Authorization header value
        
    Returns:
        The token string if valid Bearer format, None otherwise
    """
    if not authorization:
        return None
    
    parts = authorization.split()
    if len(parts) != 2:
        return None
    
    scheme, token = parts
    if scheme.lower() != "bearer":
        return None
    
    return token


def verify_clerk_token(token: str) -> Optional[dict]:
    """
    Verify a Clerk JWT token.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        Decoded token payload if valid, None if invalid
    """
    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk doesn't use audience
        )
        return decoded
    except jwt.exceptions.PyJWTError as e:
        print(f"JWT verification failed: {e}")
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


async def fetch_clerk_user(user_id: str) -> Optional[ClerkUser]:
    """
    Fetch user details from Clerk Backend API.
    
    Args:
        user_id: The Clerk user ID
        
    Returns:
        ClerkUser if found, None otherwise
    """
    settings = get_settings()
    
    url = f"https://api.clerk.com/v1/users/{user_id}"
    headers = {
        "Authorization": f"Bearer {settings.clerk_secret_key}",
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Get primary email
                email = None
                email_addresses = data.get("email_addresses", [])
                primary_email_id = data.get("primary_email_address_id")
                for email_obj in email_addresses:
                    if email_obj.get("id") == primary_email_id:
                        email = email_obj.get("email_address")
                        break
                
                return ClerkUser(
                    id=data.get("id", ""),
                    email=email,
                    first_name=data.get("first_name"),
                    last_name=data.get("last_name"),
                    image_url=data.get("image_url"),
                    public_metadata=data.get("public_metadata"),
                )
            return None
        except httpx.RequestError as e:
            print(f"Failed to fetch Clerk user: {e}")
            return None


async def get_current_user(
    authorization: Optional[str] = Header(default=None)
) -> ClerkUser:
    """
    FastAPI dependency that validates the Clerk token and returns the current user.
    
    Args:
        authorization: The Authorization header value
        
    Returns:
        ClerkUser with authenticated user information
        
    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    token = extract_token_from_header(authorization)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify the JWT token
    payload = verify_clerk_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user ID from the 'sub' claim
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch full user details from Clerk
    user = await fetch_clerk_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_optional_user(
    authorization: Optional[str] = Header(default=None)
) -> Optional[ClerkUser]:
    """
    FastAPI dependency that optionally validates the Clerk token.
    Returns None if no token is provided, but validates if one is present.
    
    Args:
        authorization: The Authorization header value
        
    Returns:
        ClerkUser if valid token provided, None if no token
        
    Raises:
        HTTPException: 401 if token is provided but invalid
    """
    token = extract_token_from_header(authorization)
    
    if not token:
        return None
    
    payload = verify_clerk_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await fetch_clerk_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user
