from typing import TYPE_CHECKING, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
import uuid

if TYPE_CHECKING:
    from models import ChatFile

class ChatBase(SQLModel):
    title: str = Field(nullable=False, index=True)
    description: str = Field(nullable=True, index=True)
    context: str = Field(nullable=False)

class Chat(ChatBase, table=True):
    id: str = Field(primary_key=True, default=str(uuid.uuid4()))
    user_id: str = Field(nullable=False, index=True)
    created_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    updated_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    files: list["ChatFile"] = Relationship(back_populates="chat")

class ChatPublic(ChatBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    files: list["ChatFile"]

class ChatCreate(ChatBase):
    pass

class ChatUpdate(ChatBase):
    pass
