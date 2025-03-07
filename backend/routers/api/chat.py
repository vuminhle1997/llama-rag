from fastapi import APIRouter

from structs.requests import ChatRequest

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{chat_id}")
async def chat_with_chat_id(chat_id: str, body: ChatRequest):
    return {"chat_id": chat_id, "query": body.query}