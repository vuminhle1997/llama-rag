import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from redis import Redis

from starlette.requests import Request
from dependencies import get_db_session, get_redis_client
from sqlmodel import Session
from models.chat import ChatCreate, Chat, ChatUpdate
from models.chat_file import ChatFile
from pathlib import Path
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate as sqlalchemy_pagination
from utils import decode_jwt

BASE_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(
    prefix="/chats",
    tags=["chats"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=Page[Chat])
async def get_all_chats(db_client: Session = Depends(get_db_session)):
    query = db_client.query(Chat)

    # TODO: get chats by User ID in jwt Redis session
    # query = query.filter(Chat.user_id == "julia-nguyen")
    return sqlalchemy_pagination(query)

@router.get("/{chat_id}")
async def get_chat(chat_id: str, db_client: Session = Depends(get_db_session)):
    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error
    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
    }

@router.get("/{chat_id}/chat")
async def chat_with_given_chat_id(chat_id: str, text: str, db_client: Session = Depends(get_db_session)):
    if not text:
        raise HTTPException(status_code=404, detail="Query: text is required")

    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error

    # TODO: Start chatting with LLM
    return {
        "chat": db_chat.model_dump(),
        'text': text,
    }



@router.post("/{chat_id}/upload")
async def upload_file_to_chat(chat_id: str, file: UploadFile = File(...),
                              db_client: Session = Depends(get_db_session),
                              redis_session: Redis = Depends(get_redis_client)):
    db_chat = db_client.get(Chat, chat_id)
    # Check if chat exists, if exists, continue
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error
    # If file is not attached to Upload, raise Error
    if not file.filename:
        raise HTTPException(status_code=404, detail="File not found")
    # If file is already uploaded, raise Error
    for chat_file in db_chat.files:
        if chat_file.file_name == file.filename:
            raise HTTPException(status_code=404, detail="File already exists")
    # Upload file to Folder and persist it
    chat_folder = BASE_UPLOAD_DIR / f"{chat_id}"
    chat_folder.mkdir(parents=True, exist_ok=True)
    file_path = chat_folder / f"{file.filename}"
    with open(file_path, "wb+") as buffer:
        buffer.write(file.file.read())
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
async def create_chat(chat: ChatCreate, db_client: Session = Depends(get_db_session),
                      request: Request = Request,
                      redis_client: Redis = Depends(get_redis_client)):
    try:
        session_id = request.cookies.get("session_id")
        if not session_id:
            raise HTTPException(status_code=404, detail="Session not found")

        token = redis_client.get(f"session:{session_id}")
        claims = decode_jwt(token)

        user_id = claims["oid"]  # TODO: replace this with session redis
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
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error

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
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error

    # Get chat folder path and delete all files inside
    chat_folder = BASE_UPLOAD_DIR / str(chat_id)
    if chat_folder.exists():
        for file in chat_folder.iterdir():
            file.unlink()  # Delete each file
        chat_folder.rmdir()  # Remove the folder itself

    db_client.delete(db_chat)
    db_client.commit()
    return {
        **db_chat.model_dump(),
    }

@router.delete("/{chat_id}/delete/{file_id}")
async def delete_file_of_chat(chat_id: str, file_id: str, db_client: Session = Depends(get_db_session)):
    # If chat is not existing, raise Error
    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    # TODO: check user_id == session.jwt.oid, if equals, continue. Otherwise, error

    # If file is not existing or does not belong to Chat, raise Error
    db_file = db_client.get(ChatFile, file_id)
    if not db_file or db_file.chat_id != chat_id:
        raise HTTPException(status_code=404, detail="File not found or does not belong to this chat")

    # Construct file path and delete from disk
    file_path = BASE_UPLOAD_DIR / str(chat_id) / db_file.file_name
    if file_path.exists():
        file_path.unlink()  # Delete file from storage

    # Remove file record from the database
    db_client.delete(db_file)
    db_client.commit()
    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
    }
