import uuid
from typing import Type, Optional, List
from fastapi import APIRouter, Depends
from redis import Redis
from sqlmodel import Session
from starlette.exceptions import HTTPException
from starlette.requests import Request
from dependencies import get_db_session, get_redis_client
from utils import decode_jwt, check_property_belongs_to_user
from models import Chat, Favourite, ChatMessage
from fastapi_pagination import Page, paginate
from fastapi_pagination.ext.sqlalchemy import paginate as sqlalchemy_pagination
from sqlalchemy.orm import selectinload
from sqlalchemy import desc
from dependencies import logger

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{chat_id}", response_model=Page[ChatMessage])
async def get_messages_by_chat_id(chat_id: str, request: Request = Request,
                                  redis_client: Redis = Depends(get_redis_client),
                                  db_client: Session = Depends(get_db_session)):
    query = db_client.query(ChatMessage)
    session_id = request.cookies.get("session_id")
    if not session_id:
        logger.error(f"No session_id cookie found for {chat_id}")
        raise HTTPException(status_code=404, detail="Not found")
    token = redis_client.get(f"session:{session_id}")
    claims = decode_jwt(token)
    user_id = claims["oid"]
    query = query.filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at.desc())
    page = sqlalchemy_pagination(query)
    chat: Chat | None = page.items[0].chat if len(page.items) > 0 else None

    if chat and not chat.user_id == user_id:
        logger.error(f"Chat {chat.chat_id} does not belong to {user_id}")
        raise HTTPException(status_code=404, detail="Chat does not belong to you")

    return page