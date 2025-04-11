import os
from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine
from redis import Redis
from logging_config import setup_logging

# chroma
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore

load_dotenv()

# Logger
logger = setup_logging()

# redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)

# main DB
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}

DATABASE_URL = os.getenv("DATABASE_URL", sqlite_url)
engine = create_engine(DATABASE_URL)

# chroma DB
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost") 
CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8000)) 
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION_NAME", 'llama-test-chroma-4') 
logger.info(f"Attempting to connect to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}")
try:
    chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    chroma_client.heartbeat() # Check connection
    logger.info("Successfully connected to ChromaDB.")
except Exception as e:
    logger.error(f"Failed to connect to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}: {e}")
    chroma_client = None 

def create_db_and_tables():
    """
    Create all database tables defined in the SQLModel metadata.
    This function should be called during application initialization.
    """
    SQLModel.metadata.create_all(engine)

def get_db_session():
    """
    Provide a SQLModel database session.
    This function is a generator that yields a session and ensures it is closed after use.
    """
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

def get_redis_client():
    """
    Provide a Redis client connection.
    This function is a generator that yields a Redis client and ensures it is closed after use.
    """
    redis = Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    try:
        yield redis
    finally:
        redis.close()

def get_chroma_vector():
    """
    Provide a ChromaVectorStore instance for vector storage operations.
    This function is a generator that yields the vector store.
    """
    chroma_collection = chroma_client.get_or_create_collection(os.environ.get("CHROMA_COLLECTION_NAME", 'llama-test-chroma-4'))
    chroma_vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    yield chroma_vector_store

def get_chroma_collection():
    """
    Provide a Chroma collection instance.
    This function is a generator that yields the Chroma collection.
    """
    chroma_collection = chroma_client.get_or_create_collection(os.environ.get("CHROMA_COLLECTION_NAME", 'llama-test-chroma-4'))
    yield chroma_collection