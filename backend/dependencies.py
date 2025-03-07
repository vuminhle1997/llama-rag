import os
from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy import Engine
from sqlmodel import Session, SQLModel, create_engine
from typing import Annotated
from pydantic_settings import BaseSettings

# LLM
from llama_index.core.settings import Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding

load_dotenv()

# LLM
llm = Ollama(model="llama3.1")
embed_model = OllamaEmbedding(model_name="nomic-embed-text")
Settings.llm = llm
Settings.embed_model = embed_model
Settings.chunk_size = 512
Settings.chunk_overlap = 50

# redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)

# main DB
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

# TODO: add LLM, embed-model and Settings for Dependencies
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_db_session():
    with Session(engine) as session:
        yield session


def get_llama_index():
    yield {
        'llm': llm,
        'embed_model': embed_model,
    }