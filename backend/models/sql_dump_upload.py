from typing import TYPE_CHECKING, List, Optional
from datetime import datetime

from sqlalchemy import Column
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSON
import uuid

Base = declarative_base()

if TYPE_CHECKING:
    from models.chat import Chat
    from models.chat_file import ChatFile

class SQLDumpUploadBase(SQLModel):
    database_name: str = Field(nullable=False, index=True)
    db_type: str = Field(nullable=False, index=True) # MySQL / Postgres

class SQLDumpUpload(SQLDumpUploadBase, Base, table=True):
    id: str = Field(nullable=False, index=True, primary_key=True, default=str(uuid.uuid4()))
    user_id: str = Field(nullable=False, index=True)
    chat_id: str = Field(nullable=False, index=True, foreign_key="chats.id")
    chat: "Chat" = Relationship(back_populates="sql_dumps")
    chat_file_id: str = Field(nullable=False, index=True, foreign_key="chat_files.id")
    chat_file: "ChatFile" = Relationship(back_populates="sql_dump")
    created_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    tables: List[str] | None = Field(default=None, sa_column=Column(JSON))
