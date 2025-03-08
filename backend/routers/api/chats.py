import uuid
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from dependencies import get_db_session
from fastapi.params import Query
from sqlalchemy import select
from sqlmodel import Session
from models.chat import ChatCreate, Chat, ChatUpdate
from models.chat_file import ChatFile
from pathlib import Path

BASE_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(
    prefix="/chats",
    tags=["chats"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_all_chats(db_client: Session = Depends(get_db_session),
    offset: int = 0,
    limit: Annotated[int, Query(le=3)] = 3):
    # TODO: fix retrieving chats with query parameters
    print(offset, limit)
    chats = []
    return chats

@router.get("/{chat_id}")
async def get_chat(chat_id: str, db_client: Session = Depends(get_db_session)):
    db_chat: Chat = db_client.get(Chat, chat_id)
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
    }

@router.post("/{chat_id}/upload")
async def upload_file_to_chat(chat_id: str, file: UploadFile = File(...), db_client: Session = Depends(get_db_session)):
    chat_folder = BASE_UPLOAD_DIR / f"{chat_id}"
    chat_folder.mkdir(parents=True, exist_ok=True)

    if not file.filename:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = chat_folder / f"{file.filename}"
    with open(file_path, "wb+") as buffer:
        buffer.write(file.file.read())

    db_chat = db_client.get(Chat, chat_id)
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    for chat_file in db_chat.files:
        if chat_file.file_name == file.filename:
            raise HTTPException(status_code=404, detail="File already exists")

    db_file = ChatFile(
        id=str(uuid.uuid4()),
        chat_id=db_chat.id,
        path_name=str(file_path),
        mime_type=file.content_type,
        file_name=file.filename,
    )
    db_chat.files.append(db_file)

    try:
        db_client.commit()
        db_client.refresh(db_chat)
        return {
            **db_chat.model_dump(),
            'files': db_chat.files,
        }
    except Exception as e:
        db_client.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_chat(chat: ChatCreate, db_client: Session = Depends(get_db_session)):
    try:
        user_id = str(uuid.uuid4())  # TODO: replace this with session redis
        db_chat = Chat(**chat.model_dump(), user_id=user_id, id=str(uuid.uuid4()))
        db_client.add(db_chat)
        db_client.commit()
        db_client.refresh(db_chat)
        return {
            **db_chat.model_dump(),
            'files': db_chat.files,
        }
    except Exception as e:
        raise e

@router.put("/{chat_id}")
async def update_chat(chat_id: str, chat: ChatUpdate, db_client: Session = Depends(get_db_session)):
    db_chat = db_client.get(Chat, chat_id)
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat_data = chat.model_dump(exclude_unset=True)
    db_chat.sqlmodel_update(chat_data)
    db_client.add(db_chat)
    db_client.commit()
    db_client.refresh(db_chat)
    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
    }

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, db_client: Session = Depends(get_db_session)):
    db_chat = db_client.get(Chat, chat_id)
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db_client.delete(db_chat)
    db_client.commit()
    return {
        **db_chat.model_dump(),
    }

