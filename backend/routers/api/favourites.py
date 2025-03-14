import uuid
from typing import Type, Optional, List
from fastapi import APIRouter, Depends
from redis import Redis
from sqlmodel import Session
from starlette.exceptions import HTTPException
from starlette.requests import Request
from dependencies import get_db_session, get_redis_client
from utils import decode_jwt, check_property_belongs_to_user
from models import Chat, Favourite
from fastapi_pagination import Page, paginate
from fastapi_pagination.ext.sqlalchemy import paginate as sqlalchemy_pagination
from sqlalchemy.orm import selectinload

router = APIRouter(
    prefix="/favourites",
    tags=["favourites"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=Page[Favourite])
async def get_favourites_of_user(request: Request = Request,
                                 redis_client: Redis = Depends(get_redis_client),
                                 db_client: Session = Depends(get_db_session)):
    query = db_client.query(Favourite).join(Chat).options(selectinload(Favourite.chat))
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=404, detail="Session Not found")
    token = redis_client.get(f"session:{session_id}")
    claims = decode_jwt(token)
    user_id = claims["oid"]
    query = query.filter(Favourite.user_id == user_id)
    page = sqlalchemy_pagination(query)
    items: List[Favourite] = page.items

    items = [
        {
            **item.model_dump(),
            "chat": item.chat,
        } for item in items
    ]
    page.items = items
    return page

@router.get("/{chat_id}")
async def get_favourite_of_chat(chat_id: str, request: Request = Request,
                                redis_client: Redis = Depends(get_redis_client),
                                db_client: Session = Depends(get_db_session)):
    db_chat: Optional[Chat] = db_client.query(Chat).options(selectinload(Chat.favourite)).get(chat_id)
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    belongs_to_user, _ = check_property_belongs_to_user(request, redis_client, db_chat)
    if not belongs_to_user:
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    if not db_chat.favourite:
        raise HTTPException(status_code=404, detail="Favourite not found")
    return {
        **db_chat.model_dump(),
        "favourite": db_chat.favourite
    }


@router.post("/{chat_id}")
async def favour_chat_by_id(chat_id: str,
                            request: Request,
                            redis_client: Redis = Depends(get_redis_client),
                            db_client: Session = Depends(get_db_session)):
    db_chat: Type[Chat] = db_client.query(Chat).options(selectinload(Chat.favourite)).get(chat_id)
    belongs_to_user, user_id = check_property_belongs_to_user(request, redis_client, db_chat)

    if not belongs_to_user:
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    db_favourites = Favourite(
        id=str(uuid.uuid4()),
        user_id=user_id,
        chat_id=db_chat.id,
    )

    try:
        db_chat.favourite = db_favourites
        db_client.add(db_favourites)
        db_client.commit()
        db_client.refresh(db_favourites)
        # Reload the favourite with chat relationship
        db_favourites = db_client.query(Favourite).options(selectinload(Favourite.chat)).get(db_favourites.id)
        return {
            **db_favourites.model_dump(),
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{chat_id}")
async def delete_favourite_of_chat_by(chat_id: str,
                              request: Request = Request,
                              redis_client: Redis = Depends(get_redis_client),
                              db_client: Session = Depends(get_db_session)):
    db_chat: Type[Chat] = db_client.query(Chat).options(selectinload(Chat.favourite)).get(chat_id)
    belongs_to_user, user_id = check_property_belongs_to_user(request, redis_client, db_chat)
    if not belongs_to_user:
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    if not db_chat.favourite:
        raise HTTPException(status_code=404, detail="Favourite not found")

    db_favourites: Favourite = db_chat.favourite

    try:
        db_client.delete(db_favourites)
        db_client.commit()
        return {
            **db_favourites.model_dump(),
            **db_chat.model_dump(),
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
