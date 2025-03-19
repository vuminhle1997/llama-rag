from fastapi import APIRouter
from .api import chats, avatar, favourites, messages

router = APIRouter(
    prefix="/api",
    tags=["api"],
    responses={404: {"description": "Not found"}},
)

router.include_router(chats.router, tags=["chats"])
router.include_router(avatar.router, tags=["avatar"])
router.include_router(favourites.router, tags=["favourites"])
router.include_router(messages.router, tags=["messages"])