import os
from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine
from redis import Redis

# chroma
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore

# postgres Chat Stora
from llama_index.storage.chat_store.postgres import PostgresChatStore

load_dotenv()

# redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)

# main DB
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

# chroma DB
chroma_client = chromadb.HttpClient()


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_db_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

def get_redis_client():
    redis = Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    try:
        yield redis
    finally:
        redis.close()

def get_chroma_vector():
    chroma_collection = chroma_client.get_or_create_collection(os.environ.get("CHROMA_COLLECTION_NAME", 'llama-test-chroma-2'))
    chroma_vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    yield chroma_vector_store



def get_chroma_collection():
    chroma_collection = chroma_client.get_or_create_collection(os.environ.get("CHROMA_COLLECTION_NAME", 'llama-test-chroma-2'))
    yield chroma_collection

def get_chat_store():
    chat_store = PostgresChatStore.from_uri(
        uri="postgresql+asyncpg://postgres:password@127.0.0.1:5432/llama-rag",
    )
    yield chat_store