import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from llama_index.core import PromptTemplate
from llama_index.core.chat_engine.types import AgentChatResponse
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.llms.ollama import Ollama
from llama_index.core.llms import MessageRole, ChatMessage as LLMChatMessage
from llama_index.vector_stores.chroma import ChromaVectorStore
from redis import Redis

from chromadb import Collection
from typing import Optional
from starlette.requests import Request
from dependencies import get_db_session, get_redis_client, get_chroma_vector, get_chroma_collection, logger
from sqlmodel import Session

from models import ChatMessage
from models.chat import Chat, ChatQuery
from models.chat_file import ChatFile
from pathlib import Path
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate as sqlalchemy_pagination
from utils import decode_jwt, check_property_belongs_to_user
from services import (
    index_uploaded_file,
    deletes_file_index_from_collection,
    create_agent,
    process_dump_to_persist,
    create_pandas_engines_tools_from_files,
    create_sql_engines_tools_from_files,
    create_search_engine_tool,
    create_url_loader_tool,
    create_query_engine_tools,
)
from fastapi import BackgroundTasks
from utils import detect_sql_dump_type, delete_database_from_postgres

from llama_index.llms.google_genai import GoogleGenAI
from llama_index.llms.groq import Groq

load_dotenv()
groq = os.getenv("GROQ_API_KEY")

BASE_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(
    prefix="/chats",
    tags=["chats"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=Page[Chat])
async def get_all_chats(db_client: Session = Depends(get_db_session),
                        request: Request = Request,
                        redis_client: Redis = Depends(get_redis_client)):
    """
    Retrieve all chats for the authenticated user.

    This endpoint fetches all chats associated with the authenticated user, 
    ordered by the last interaction timestamp in descending order.

    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **redis_client**: Redis client dependency for session validation.

    **Returns**:
    - A paginated list of chats.

    **Raises**:
    - 404: If the session ID is not found in cookies or the user is not authenticated.
    """
    query = db_client.query(Chat)
    session_id = request.cookies.get("session_id")
    if not session_id:
        logger.error(f"Session id not found in cookies")
        raise HTTPException(status_code=404, detail="Not found")
    token = redis_client.get(f"session:{session_id}")
    claims = decode_jwt(token)
    user_id = claims["oid"]
    query = query.filter(Chat.user_id == user_id).order_by(Chat.last_interacted_at.desc())
    page = sqlalchemy_pagination(query)
    return page

@router.get("/search")
async def get_chats_by_title(title: str, db_client: Session = Depends(get_db_session),
                             request: Request = Request,
                             redis_client: Redis = Depends(get_redis_client)):
    """
    Search chats by title for the authenticated user.

    This endpoint allows the user to search for chats by their title.

    - **title**: The title or partial title of the chat to search for.
    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **redis_client**: Redis client dependency for session validation.

    **Returns**:
    - A list of chats matching the title.

    **Raises**:
    - 404: If the session ID is not found in cookies or the user is not authenticated.
    """
    session_id = request.cookies.get("session_id")
    if not session_id:
        logger.error(f"Session id not found in cookies")
        raise HTTPException(status_code=404, detail="Not found")
    token = redis_client.get(f"session:{session_id}")
    claims = decode_jwt(token)
    user_id = claims["oid"]
    chats = (db_client
             .query(Chat).filter(Chat.title.like(f"%{title}%")).filter(Chat.user_id == user_id).all())

    return chats


@router.get("/{chat_id}")
async def get_chat(chat_id: str, db_client: Session = Depends(get_db_session),
                   request: Request = Request,
                   redis_client: Redis = Depends(get_redis_client)):
    """
    Retrieve a specific chat by its ID.

    This endpoint fetches a chat and its associated messages for the authenticated user.

    - **chat_id**: The unique identifier of the chat.
    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **redis_client**: Redis client dependency for session validation.

    **Returns**:
    - The chat details, including files, messages, and favorite status.

    **Raises**:
    - 404: If the chat is not found or does not belong to the user.
    """
    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        logger.error(f"Chat {chat_id} not found")
        raise HTTPException(status_code=404, detail="Chat not found")

    belongs_to_user = check_property_belongs_to_user(request, redis_client, db_chat)
    messages = (db_client.query(ChatMessage)
             .filter(ChatMessage.chat_id == chat_id)
             .order_by(ChatMessage.created_at.desc()).all())[:10]

    if not belongs_to_user:
        logger.error(f"Chat {chat_id} does not belong to user")
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get favorite status
    favorite = db_chat.favourite if db_chat.favourite else None
    
    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
        'messages': messages,
        'favourite': favorite.model_dump() if favorite else None
    }


@router.post("/{chat_id}/chat")
async def chat_with_given_chat_id(chat_id: str, chat: ChatQuery,
                                  db_client: Session = Depends(get_db_session),
                                  request: Request = Request,
                                  redis_client: Redis = Depends(get_redis_client),
                                  chroma_vector_store: ChromaVectorStore = Depends(get_chroma_vector)):
    """
    Interact with a specific chat by sending a message.

    This endpoint allows the user to send a message to a chat and receive a response 
    from the chat agent.

    - **chat_id**: The unique identifier of the chat.
    - **chat**: The message query object containing the user's input.
    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **redis_client**: Redis client dependency for session validation.
    - **chroma_vector_store**: Dependency for vector store operations.

    **Returns**:
    - The updated chat details and the assistant's response.

    **Raises**:
    - 404: If the chat is not found or does not belong to the user.
    """
    if not chat:
        logger.error("Missing chat parameter")
        raise HTTPException(status_code=404, detail="Body: text is required")

    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        logger.error(f"Chat {chat_id} not found")
        raise HTTPException(status_code=404, detail="Chat not found")

    belongs_to_user = check_property_belongs_to_user(request, redis_client, db_chat)
    if not belongs_to_user:
        logger.error(f"Chat {chat_id} does not belong to user")
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    user_message = ChatMessage(
        id=str(uuid.uuid4()),
        role=MessageRole.USER,
        text=chat.text,
        block_type='text',
        additional_kwargs={},
        chat_id=chat_id,
        created_at=datetime.now(),
    )

    old_messages = (db_client.query(ChatMessage)
                    .filter(ChatMessage.chat_id == chat_id)
                    .order_by(ChatMessage.created_at.desc()).all())[:25]

    chat_history = [
        LLMChatMessage(
            role=message.role,
            content=message.text,
            additional_kwargs=message.additional_kwargs,
        )
        for message in old_messages
    ]

    # Now the fun is getting started
    chat_memory = ChatMemoryBuffer.from_defaults(
        chat_history=chat_history,
        token_limit=3000,
    )

    files = db_chat.files
    tools = create_query_engine_tools(files=files, chroma_vector_store=chroma_vector_store)
    pd_tools = create_pandas_engines_tools_from_files(files=files)
    sql_tools = create_sql_engines_tools_from_files(files=files, chroma_vector_store=chroma_vector_store)

    scrape_tool = create_url_loader_tool(chroma_vector_store=chroma_vector_store, chat=db_chat)
    search_engine_tool = create_search_engine_tool(chroma_vector_store=chroma_vector_store, chat=db_chat)

    tools = tools + pd_tools
    tools = tools + sql_tools
    tools = tools + [scrape_tool]
    tools = tools + [search_engine_tool]

    if db_chat.model:
        model_from_chat = db_chat.model
    else:
        model_from_chat = "llama3.1"

    # TODO, uncomment this for later. Just use an interference provider for faster response
    llm = Ollama(model="hf.co/MaziyarPanahi/Meta-Llama-3.1-8B-Instruct-GGUF:Q8_0", temperature=db_chat.temperature, request_timeout=500)
    agent = create_agent(memory=chat_memory, system_prompt=PromptTemplate(db_chat.context), tools=tools, llm=llm)
    agent_response: AgentChatResponse = await agent.achat(chat.text)

    db_chat.last_interacted_at = datetime.now()
    chat_messages = [
        user_message,
        ChatMessage(
            id=str(uuid.uuid4()),
            role=MessageRole.ASSISTANT,
            text=agent_response.response,
            block_type='text',
            additional_kwargs={},
            chat_id=chat_id,
            created_at=datetime.now(),
        )
    ]
    for chat_message in chat_messages:
        db_chat.messages.append(chat_message)
    db_client.add(db_chat)
    db_client.commit()
    db_client.refresh(db_chat)

    return {
        **db_chat.model_dump(),
        "message": {
            "response": agent_response,
            "role": "assistant"
        },
    }


@router.post("/{chat_id}/upload")
async def upload_file_to_chat(chat_id: str, file: UploadFile = File(...),
                              db_client: Session = Depends(get_db_session),
                              request: Request = Request,
                              chroma_collection: Collection = Depends(get_chroma_collection),
                              redis_session: Redis = Depends(get_redis_client),
                              background_tasks: BackgroundTasks = BackgroundTasks):
    """
    Upload a file to a specific chat.

    This endpoint allows the user to upload a file to a chat. If the file is an SQL dump, 
    it will be processed and indexed in the background.

    - **chat_id**: The unique identifier of the chat.
    - **file**: The file to be uploaded.
    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **chroma_collection**: Dependency for vector store operations.
    - **redis_session**: Redis client dependency for session validation.
    - **background_tasks**: Background task manager for processing SQL dumps.

    **Returns**:
    - The updated chat details, including the uploaded file.

    **Raises**:
    - 404: If the chat is not found, does not belong to the user, or the file already exists.
    - 500: If an error occurs during file processing or indexing.
    """
    db_chat = db_client.get(Chat, chat_id)
    # Check if chat exists, if exists, continue
    if not db_chat:
        logger.error("Chat not found")
        raise HTTPException(status_code=404, detail="Chat not found")

    belongs_to_user, user_id = check_property_belongs_to_user(request, redis_session, db_chat)
    if not belongs_to_user:
        logger.error(f"Chat {chat_id} does not belong to user")
        raise HTTPException(status_code=404, detail="Chat does not belong to user")
    # If file is not attached to Upload, raise Error
    if not file.filename:
        logger.error(f"Does not have a File")
        raise HTTPException(status_code=404, detail="File not found")
    # If file is already uploaded, raise Error
    for chat_file in db_chat.files:
        if chat_file.file_name == file.filename:
            logger.error(f"File already uploaded {file.filename}")
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

    if file.content_type.lower().find("sql") != -1 and db_chat is not None:
        logger.info(f"Processing SQL File for Chat: {db_chat.id}")
        database_name = (f"{db_chat.title}-{file.filename}".lower().replace(" ", "")
                         .replace("-", "_").replace(".", "_").strip(""))
        db_file.database_name = database_name
        database_type = detect_sql_dump_type(str(file_path))
        db_file.database_type = database_type
        background_tasks.add_task(process_dump_to_persist, db_client=db_client, chat_id=chat_id,
                                  sql_dump_path=str(file_path), database_type=database_type, chat_file_id=db_file.id,
                                  db_name=database_name, chroma_collection=chroma_collection)

    try:
        # indexes file
        db_chat.last_interacted_at = datetime.now()
        db_chat.files.append(db_file)
        db_client.commit()
        db_client.refresh(db_chat)
        if "sql" not in file.content_type.lower():
            index_uploaded_file(path=str(file_path), chat_file=db_file, chroma_collection=chroma_collection)

        return {
            **db_chat.model_dump(),
            'files': db_chat.files,
        }
    except Exception as e:
        db_client.rollback()
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_chat(
    chat: str = Form(...),
    file: Optional[UploadFile] = None,
    db_client: Session = Depends(get_db_session),
    request: Request = Request,
    redis_client: Redis = Depends(get_redis_client)
):
    """
    Create a new chat.

    This endpoint allows the user to create a new chat. Optionally, an avatar image 
    can be uploaded for the chat.

    - **chat**: The chat data in JSON format.
    - **file**: Optional avatar image file.
    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **redis_client**: Redis client dependency for session validation.

    **Returns**:
    - The created chat details.

    **Raises**:
    - 404: If the session ID is not found in cookies.
    - 400: If the avatar image format is invalid.
    """
    session_id = request.cookies.get("session_id")
    if not session_id:
        logger.error("Session id cookie not found")
        raise HTTPException(status_code=404, detail="Session not found")

    token = redis_client.get(f"session:{session_id}")
    claims = decode_jwt(token)
    user_id = claims["oid"]

    chat_id = str(uuid.uuid4())
    avatar_path = None

    if file and file.filename:
        # Get file extension
        ext = file.filename.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'gif']:
            logger.error("Invalid image format for chat avatar")
            raise HTTPException(status_code=400, detail="Invalid image format")

        # Create avatars directory if it doesn't exist
        avatar_dir = BASE_UPLOAD_DIR / 'avatars'
        avatar_dir.mkdir(parents=True, exist_ok=True)

        # Save file
        avatar_path = avatar_dir / f"{chat_id}.{ext}"
        with open(avatar_path, "wb+") as buffer:
            buffer.write(file.file.read())

    chat_data = json.loads(chat)
    db_chat = Chat(
        **chat_data,
        user_id=user_id,
        id=chat_id,
        avatar_path=str(avatar_path)
    )
    db_client.add(db_chat)
    db_client.commit()
    db_client.refresh(db_chat)

    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
    }

@router.put("/{chat_id}")
async def update_chat(chat_id: str, chat: str = Form(...), file: UploadFile = File(None),
                      request: Request = Request,
                      db_client: Session = Depends(get_db_session),
                      redis_client: Redis = Depends(get_redis_client)):
    """
    Update an existing chat.

    This endpoint allows the user to update the details of an existing chat. Optionally, 
    a new avatar image can be uploaded.

    - **chat_id**: The unique identifier of the chat.
    - **chat**: The updated chat data in JSON format.
    - **file**: Optional new avatar image file.
    - **request**: HTTP request object to extract cookies.
    - **db_client**: Database session dependency.
    - **redis_client**: Redis client dependency for session validation.

    **Returns**:
    - The updated chat details.

    **Raises**:
    - 404: If the chat is not found or does not belong to the user.
    - 400: If the avatar image format is invalid.
    """
    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        logger.error(f"Chat {chat_id} not found")
        raise HTTPException(status_code=404, detail="Chat not found")

    belongs_to_user = check_property_belongs_to_user(request, redis_client, db_chat)
    if not belongs_to_user:
        logger.error(f"Chat {chat_id} does not belong to user")
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    avatar_path = None

    if file and file.filename:
        # Get file extension
        ext = file.filename.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            logger.error("Invalid image format for chat avatar")
            raise HTTPException(status_code=400, detail="Invalid image format")

        # Create avatars directory if it doesn't exist
        avatar_dir = BASE_UPLOAD_DIR / 'avatars'
        avatar_dir.mkdir(parents=True, exist_ok=True)

        # Save new file
        avatar_path = avatar_dir /  f"{chat_id}.{ext}"
        with open(avatar_path, "wb+") as buffer:
            buffer.write(file.file.read())

    # Update the entry
    chat_data = json.loads(chat)
    db_chat.sqlmodel_update(chat_data)
    if avatar_path:
        db_chat.avatar_path = str(avatar_path)

    db_chat.last_interacted_at = datetime.now()
    db_client.add(db_chat)
    db_client.commit()
    db_client.refresh(db_chat)

    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
    }



@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, db_client: Session = Depends(get_db_session),
                      request: Request = Request,
                      redis_client: Redis = Depends(get_redis_client),
                      chroma_collection: Collection = Depends(get_chroma_collection)):
    """
    Delete a chat.

    This endpoint allows the user to delete a chat and all its associated files, 
    messages, and avatar.

    - **chat_id**: The unique identifier of the chat.
    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **redis_client**: Redis client dependency for session validation.
    - **chroma_collection**: Dependency for vector store operations.

    **Returns**:
    - The deleted chat details.

    **Raises**:
    - 404: If the chat is not found or does not belong to the user.
    """
    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        logger.error(f"Chat {chat_id} not found")
        raise HTTPException(status_code=404, detail="Chat not found")

    belongs_to_user = check_property_belongs_to_user(request, redis_client, db_chat)
    if not belongs_to_user:
        logger.error(f"Chat {chat_id} does not belong to user")
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    files = db_chat.files
    for _file in files:
        deletes_file_index_from_collection(file_id=_file.id, chroma_collection=chroma_collection)

    # Get chat folder path and delete all files inside
    chat_folder = BASE_UPLOAD_DIR / str(chat_id)
    if chat_folder.exists():
        for file in chat_folder.iterdir():
            file.unlink()  # Delete each file
        chat_folder.rmdir()  # Remove the folder itself

    # Delete avatar file if it exists
    if db_chat.avatar_path and Path(db_chat.avatar_path).exists():
        Path(db_chat.avatar_path).unlink()

    db_client.delete(db_chat)
    db_client.commit()
    return {
        **db_chat.model_dump(),
    }


@router.delete("/{chat_id}/delete/{file_id}")
async def delete_file_of_chat(chat_id: str, file_id: str, db_client: Session = Depends(get_db_session),
                              request: Request = Request,
                              redis_client: Redis = Depends(get_redis_client),
                              chroma_collection: Collection = Depends(get_chroma_collection)):
    """
    Delete a file from a chat.

    This endpoint allows the user to delete a specific file from a chat. If the file 
    is an SQL dump, the associated database will also be deleted.

    - **chat_id**: The unique identifier of the chat.
    - **file_id**: The unique identifier of the file.
    - **db_client**: Database session dependency.
    - **request**: HTTP request object to extract cookies.
    - **redis_client**: Redis client dependency for session validation.
    - **chroma_collection**: Dependency for vector store operations.

    **Returns**:
    - The updated chat details after file deletion.

    **Raises**:
    - 404: If the chat or file is not found, or the file does not belong to the chat.
    """
    # If chat is not existing, raise Error
    db_chat = db_client.get(Chat, chat_id)
    if not db_chat:
        logger.error(f"Chat {chat_id} not found")
        raise HTTPException(status_code=404, detail="Chat not found")

    belongs_to_user = check_property_belongs_to_user(request, redis_client, db_chat)
    if not belongs_to_user:
        logger.error(f"Chat {chat_id} does not belong to user")
        raise HTTPException(status_code=404, detail="Chat does not belong to user")

    # If file is not existing or does not belong to Chat, raise Error
    db_file = db_client.get(ChatFile, file_id)
    if not db_file or db_file.chat_id != chat_id:
        logger.error(f"{db_file.file_name} not found or does not belong to Chat")
        raise HTTPException(status_code=404, detail="File not found or does not belong to this chat")

    # Construct file path and delete from disk
    file_path = BASE_UPLOAD_DIR / str(chat_id) / db_file.file_name
    if file_path.exists():
        file_path.unlink()  # Delete file from storage

    if db_file.mime_type.find("sql") != -1:
        # delete sql database
        delete_database_from_postgres(db_file.database_name)
    else:
        # deletes index from DB
        deletes_file_index_from_collection(chroma_collection=chroma_collection, file_id=db_file.id)
    # Remove file record from the database
    db_client.delete(db_file)
    db_chat.last_interacted_at = datetime.now()
    db_client.commit()
    db_client.refresh(db_chat)

    return {
        **db_chat.model_dump(),
        'files': db_chat.files,
    }
