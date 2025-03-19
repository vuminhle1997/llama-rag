from typing import TYPE_CHECKING, List, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
import uuid

Base = declarative_base()

if TYPE_CHECKING:
    from models.chat_file import ChatFile
    from models.favourite import Favourite
    from models.chat_message import ChatMessage

class ChatBase(SQLModel):
    title: str = Field(nullable=False, index=True)
    description: str = Field(nullable=True, index=True)
    context: str = Field(nullable=False)

class Chat(ChatBase, Base, table=True):
    __tablename__ = "chats"
    id: str = Field(primary_key=True, default=str(uuid.uuid4()))
    created_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    updated_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    last_interacted_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    user_id: str = Field(nullable=False, index=True)
    avatar_path: str = Field(nullable=False)
    temperature: float = Field(nullable=False, index=True, default=0.75)
    model: str = Field(nullable=False, index=True, default="llama3.1")
    files: List["ChatFile"] = Relationship(back_populates="chat", sa_relationship_kwargs={"cascade": "all, delete"})
    favourite: "Favourite" = Relationship(back_populates="chat", sa_relationship_kwargs={"cascade": "all, delete"})
    messages: List["ChatMessage"] = Relationship(back_populates="chat", sa_relationship_kwargs={"cascade": "all, delete"})

class ChatPublic(ChatBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    files: list["ChatFile"]

class ChatCreate(BaseModel):
    title: str
    temperature: float
    description: Optional[str]
    context: str

class ChatUpdate(BaseModel):
    title: str
    temperature: float
    description: Optional[str]
    context: str

class ChatQuery(BaseModel):
    text: str