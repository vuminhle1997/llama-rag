import uuid

from redis import Redis
from sqlmodel import Session
from fastapi import APIRouter, Depends, Response
from starlette.responses import RedirectResponse

from dependencies import get_db_session, get_redis_client, logger
from utils import create_jwt
from models import UserCreate, User
from typing import List

import bcrypt

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.post("/")
async def create_user(user: UserCreate, db_client: Session = Depends(get_db_session),
                      redis_client: Redis = Depends(get_redis_client)):
    if user.password is not user.confirm_password:
        return Response("Password is not matching.", status_code=401)
    hashed_password = bcrypt.hashpw(user.password, bcrypt.gensalt(12))
    db_user = User(
        id=str(uuid.uuid4()),
        name=user.name,
        last_name=user.last_name,
        email=user.email,
        hashed_password=hashed_password,
    )

    try:
        db_client.add(db_user)
        db_client.commit()

        session_id = str(uuid.uuid4())
        jwt_token = create_jwt(oid=db_user.id, name=user.name, last_name=user.last_name, email=user.email)
        redis_client.setex(f"session:{session_id}", 3600, jwt_token)
        response = RedirectResponse(url="http://localhost:3000")
        response.set_cookie("session_id", session_id, httponly=False, secure=False) # set on True when Production
        return response
    except Exception as e:
        logger.error(e)
        return Response(e, status_code=500)

@router.post("/login/")
async def login_user(user: UserCreate, db_client: Session = Depends(get_db_session),
                     redis_client: Redis = Depends(get_redis_client)):
    if user.password is not user.confirm_password:
        return Response("Password is not matching.", status_code=401)
    try:
        db_user: List[User] | None = (db_client
             .query(User).filter(User.email.like(f"%{user.email}%")).all())

        if db_user and len(db_user) > 0:
            db_user = db_user[0]
            is_matching = bcrypt.checkpw(user.password, db_user.hashed_password)
            if is_matching:
                session_id = str(uuid.uuid4())
                jwt_token = create_jwt(oid=db_user.id, name=user.name, last_name=user.last_name, email=user.email)
                redis_client.setex(f"session:{session_id}", 3600, jwt_token)
                response = RedirectResponse(url="http://localhost:3000")
                response.set_cookie("session_id", session_id, httponly=False, secure=False) # set on True when Production
                return response
            else:
                return Response("User doesn't exist.", status_code=404)
        else:
            return Response("User not found.", status_code=404)
    except Exception as e:
        logger.error(e)
        return Response(e, status_code=500)