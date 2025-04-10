import jwt
from fastapi import HTTPException
from dependencies import logger

def decode_jwt(token: str):
    """Decodes and verifies the JWT token.

    This function attempts to decode a JWT token without signature verification.
    If the token is expired or invalid, appropriate HTTP exceptions are raised.

    Args:
        token (str): The JWT token string to decode

    Returns:
        dict: The decoded token payload as a dictionary

    Raises:
        HTTPException: If token is expired (401) or invalid (401)
    """
    try:
        decoded_token = jwt.decode(token, options={"verify_signature": False})  # No signature verification for now
        return decoded_token
    except jwt.ExpiredSignatureError:
        logger.error(f"Token expired {token}")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        logger.error(f"Invalid token {token}")
        raise HTTPException(status_code=401, detail="Invalid token")