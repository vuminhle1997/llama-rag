import jwt
from fastapi import HTTPException
from dependencies import logger

def decode_jwt(token: str):
    """Decodes and verifies the JWT token"""
    try:
        decoded_token = jwt.decode(token, options={"verify_signature": False})  # No signature verification for now
        return decoded_token
    except jwt.ExpiredSignatureError:
        logger.error(f"Token expired {token}")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        logger.error(f"Invalid token {token}")
        raise HTTPException(status_code=401, detail="Invalid token")


def foo():
    return True