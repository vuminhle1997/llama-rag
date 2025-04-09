from starlette.requests import Request
from redis import Redis
from models.chat import Chat
from fastapi import HTTPException
from .decode_jwt import decode_jwt
from dependencies import logger

def check_property_belongs_to_user(request_from_route: Request, redis_client: Redis, chat: "Chat"):
    session_id = request_from_route.cookies.get("session_id")
    if not session_id:
        logger.error("Session id cookie not found")
        raise HTTPException(status_code=404, detail="Session ID not found")
    token = redis_client.get(f"session:{session_id}")
    claims = decode_jwt(token)
    user_id = claims["oid"]
    if chat.user_id != user_id:
        return False, None
    else:
        return True, user_id