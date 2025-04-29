from typing import TYPE_CHECKING, List, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
import uuid

Base = declarative_base()

class UserBase(SQLModel):
    email: str = Field(nullable=False, unique=True, index=True)
    name: str = Field(nullable=False, index=True)
    last_name: str = Field(nullable=False, index=True)
    hashed_password: str = Field(nullable=False)

class User(UserBase, Base, table=True):
    __tablename__ = "users"
    id: str = Field(nullable=False, primary_key=True, default=str(uuid.uuid4))
    created_at: datetime = Field(nullable=False, index=True, default=datetime.now())
    updated_at: datetime = Field(nullable=False, index=True, default=datetime.now())

class UserCreate(BaseModel):
    email: str
    name: str
    last_name: str
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: str
    password: str