import uuid
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from dependencies import get_db_session
from fastapi.params import Query
from sqlalchemy import select
from sqlmodel import Session
from models.chat import ChatCreate, Chat, ChatPublic, ChatUpdate
from models.chat_file import ChatFile
from pathlib import Path

BASE_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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
@router.get("/{chat_id}", response_model=Chat)
async def get_chat(chat_id: str, db_client: Session = Depends(get_db_session)):
    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        raise HTTPException(status_code=404, detail="Hero not found")
    return db_chat

@router.post("/{chat_id}/upload")
async def upload_file_to_chat(chat_id: str, file: UploadFile = File(...), db_client: Session = Depends(get_db_session)):
    file_id = str(uuid.uuid4())
    chat_folder = BASE_UPLOAD_DIR / f"{chat_id}"
    chat_folder.mkdir(parents=True, exist_ok=True)

    file_path = chat_folder / f"{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    db_chat = db_client.get(Chat, chat_id)
    db_file = ChatFile(
        file_id=file_id,
        chat_id=db_chat.id,
        file_path=file_path,
        mime_type=file.content_type,
        filename=file.filename,
    )
    db_client.add(db_file)
    db_client.commit()
    db_client.refresh(db_file)
    return db_file

@router.post("/", response_model=Chat)
async def create_chat(chat: ChatCreate, db_client: Session = Depends(get_db_session)):
    try:
        user_id = str(uuid.uuid4())  # replace this with session redis
        db_chat = Chat(**chat.model_dump(), user_id=user_id)
        db_client.add(db_chat)
        db_client.commit()
        db_client.refresh(db_chat)
        return {'db_chat': db_chat}
    except Exception as e:
        print(e)
        raise e
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
