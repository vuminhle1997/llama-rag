from typing import TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
import uuid

if TYPE_CHECKING:
    from models import Chat

class BaseChatFile(SQLModel):
    file_name: str = Field(index=True, nullable=False)
    path_name: str = Field(index=True, nullable=False)
    mime_type: str = Field(index=True, nullable=False)

class ChatFile(BaseChatFile, table=True):
    id: str = Field(primary_key=True, nullable=False, default=str(uuid.uuid4()))
    created_at: datetime = Field(default = datetime.now())
    updated_at: datetime = Field(default = datetime.now())
    chat_id: str | None = Field(default=None, foreign_key="chat.id")
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

