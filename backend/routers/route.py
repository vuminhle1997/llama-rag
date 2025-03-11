from fastapi import APIRouter
from .api import chats, avatar

router = APIRouter(
    prefix="/api",
    tags=["api"],
    responses={404: {"description": "Not found"}},
)

router.include_router(chats.router, tags=["chats"])
router.include_router(avatar.router, tags=["avatar"])