from typing import TYPE_CHECKING, Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid

if TYPE_CHECKING:
    from models import Chat

Base = declarative_base()

class BaseFavourites(SQLModel):
    pass

class Favourite(BaseFavourites, Base, table=True):
    __tablename__ = "favourites"
    id: str = Field(nullable=False, primary_key=True, default=str(uuid.uuid4()))
    created_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    chat_id: Optional[str] = Field(index=True, default=None, foreign_key="chats.id")
    user_id: str = Field(nullable=False, index=True)
    chat: "Chat" = Relationship(back_populates="favourite")


