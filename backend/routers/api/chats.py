from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.params import Query
from sqlalchemy import select
# from models.chat import ChatCreate

# from models.chat import ChatCreate, Chat, ChatPublic, ChatUpdate

router = APIRouter(
    prefix="/chats",
    tags=["chats"],
    responses={404: {"description": "Not found"}},
)

# @router.get("/", response_model=list[ChatPublic])
# async def get_all_chats(session: SessionDep,
#     offset: int = 0,
#     limit: Annotated[int, Query(le=5)] = 5):
#     chats = session.exec(select(Chat).offset(offset).limit(limit)).all()
#     return chats
#
# @router.get("/{chat_id}", response_model=ChatPublic)
# async def get_chat(chat_id: str, session: SessionDep = Depends(SessionDep)):
#     db_chat = session.get(Chat, chat_id)
#     if not db_chat:
#         raise HTTPException(status_code=404, detail="Hero not found")
#     return db_chat
#
# @router.post("/{chat_id}/upload")
# async def upload_file_to_chat(chat_id: str, file: UploadFile = File(...), session: SessionDep = Depends(SessionDep)):
#     db_chat = session.get(Chat, chat_id)
#     db_chat.file = file
@router.post("/")
async def create_chat():
    # print(chat)
    return { 'hi': 'bye' }
#
# @router.put("/{chat_id}", response_model=ChatPublic)
# async def update_chat(chat_id: str, session: SessionDep = Depends(SessionDep), chat: ChatUpdate = Depends(ChatUpdate)):
#     db_chat = session.get(Chat, chat_id)
#     if not db_chat:
#         raise HTTPException(status_code=404, detail="Chat not found")
#     chat_data = chat.model_dump(exclude_unset=True)
#     db_chat.sqlmodel_update(chat_data)
#     session.add(db_chat)
#     session.commit()
#     session.refresh(db_chat)
#     return db_chat
#
# @router.delete("/{chat_id}", response_model=ChatPublic)
# async def delete_chat(chat_id: str, session: SessionDep = Depends(SessionDep)):
#     db_chat = session.get(Chat, chat_id)
#     if not db_chat:
#         raise HTTPException(status_code=404, detail="Chat not found")
#     session.delete(db_chat)
#     session.commit()
#     return db_chat
#
