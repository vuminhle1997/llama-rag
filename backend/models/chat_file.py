from typing import TYPE_CHECKING, Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

if TYPE_CHECKING:
    from models.chat import Chat

class BaseChatFile(SQLModel):
    file_name: str = Field(index=True, nullable=False)
    path_name: str = Field(index=True, nullable=False)
    mime_type: str = Field(index=True, nullable=False)
    chat_id: Optional[str] = Field(default=None, foreign_key="chats.id")

class ChatFile(BaseChatFile, Base, table=True):
    __tablename__ = "chat_files"
    id: str = Field(primary_key=True, nullable=False, default=str(uuid.uuid4()))
    created_at: datetime = Field(default = datetime.now())
    updated_at: datetime = Field(default = datetime.now())
    chat: "Chat" = Relationship(back_populates="files")

class ChatFilePublic(BaseChatFile):
    id: str
    created_at: datetime
    updated_at: datetime
    chat: "Chat"

class ChatFileCreate(BaseChatFile):
    pass

class ChatFileUpdate(BaseChatFile):
    pass

