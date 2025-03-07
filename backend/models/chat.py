# from datetime import datetime
#
# from fastapi import Depends, FastAPI, HTTPException, Query, UploadFile, File
# from sqlalchemy import DateTime
# from sqlmodel import Field, Session, SQLModel, create_engine, select, Column
# from sqlalchemy.dialects.postgresql import UUID
# import uuid
#
# class ChatBase(SQLModel):
#     title: str = Field(index=True, max_length=500)
#     description: str | None
#     avatar_path: str | None
#     context: str | None
#     # later, the files
#
# class Chat(ChatBase, table=True):
#     chat_id: Column = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
#     created_at: Column = Column(DateTime, default=datetime.now())
#     updated_at: Column = Column(DateTime, default=datetime.now())
#
# class ChatPublic(ChatBase):
#     id: UUID
#     title: str
#     description: str | None
#     avatar_path: str | None
#     context: str | None
#     created_at: datetime
#     updated_at: datetime
#
# class ChatCreate(ChatBase):
#     title: str
#     description: str | None
#     context: str | None
#
# class ChatUpdate(ChatBase):
#     title: str
#     description: str | None
#     context: str | None
#
