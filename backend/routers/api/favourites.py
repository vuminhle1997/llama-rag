import uuid
from typing import Type
from fastapi import APIRouter, Depends
from redis import Redis
from sqlmodel import Session
from starlette.exceptions import HTTPException
from starlette.requests import Request
from dependencies import get_db_session, get_redis_client
from utils import decode_jwt, check_property_belongs_to_user
from models import Chat, Favourite

router = APIRouter(
    prefix="/favourites",
    tags=["favourites"],
    responses={404: {"description": "Not found"}},
)

@router.post("/{chat_id}")
async def favour_chat_by_id(chat_id: str,
                            request: Request,
                            redis_client: Redis = Depends(get_redis_client),
                            db_client: Session = Depends(get_db_session)):
    db_chat: Type[Chat] = db_client.get(Chat, chat_id)
    belongs_to_user, user_id = check_property_belongs_to_user(request, redis_client, db_chat)

    if not belongs_to_user:
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    db_favourites = Favourite(
        id=str(uuid.uuid4()),
        user_id=user_id,
        chat_id=db_chat.id,
    )

    try:
        db_client.add(db_favourites)
        db_client.commit()
        db_client.refresh(db_favourites)
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
    db_chat: Type[Chat] = db_client.get(Chat, chat_id)
    belongs_to_user, user_id = check_property_belongs_to_user(request, redis_client, db_chat)
    if not belongs_to_user:
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

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
