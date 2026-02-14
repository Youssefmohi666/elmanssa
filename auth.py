from fastapi import Security, HTTPException
from fastapi.security.api_key import APIKeyHeader, APIKeyQuery
from starlette.status import HTTP_403_FORBIDDEN
import os

# For production, this should be a real secret stored in .env or a DB
# We'll use a default for demonstration
API_KEY = "ai-service-secret-token"
API_KEY_NAME = "X-API-Key"

api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
api_key_query = APIKeyQuery(name=API_KEY_NAME, auto_error=False)

async def get_api_key(
    api_key_header: str = Security(api_key_header),
    api_key_query: str = Security(api_key_query),
):
    if api_key_header == API_KEY or api_key_query == API_KEY:
        return api_key_header or api_key_query
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials"
        )

def autherize():
    """Placeholder for backward compatibility if needed"""
    return True

def authn():
    """Placeholder for backward compatibility if needed"""
    return True