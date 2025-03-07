from fastapi import APIRouter
from .api import chats, uploads

router = APIRouter(
    prefix="/api",
    tags=["api"],
    responses={404: {"description": "Not found"}},
)

router.include_router(chats.router, tags=["chats"])
router.include_router(uploads.router, tags=["uploads"])