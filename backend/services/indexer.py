from llama_index.core.objects import SQLTableNodeMapping, SQLTableSchema, ObjectIndex
from llama_index.core.readers import SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext, SQLDatabase
from llama_index.core.indices import VectorStoreIndex
from chromadb import Collection
from llama_index.core.settings import Settings
from sqlalchemy import create_engine

from models import ChatFile
from utils import initialize_pg_url
from dependencies import logger

def index_uploaded_file(path: str, chat_file: ChatFile, chroma_collection: Collection):
    """
    Indexes an uploaded file into a ChromaDB collection for vector search capabilities.

    This function processes a document, adds metadata, and stores it in a vector database
    for efficient similarity searching.

    Args:
        path (str): File system path to the document to be indexed
        chat_file (ChatFile): ChatFile object containing metadata about the file
        chroma_collection (Collection): ChromaDB collection instance for storage

    Returns:
        None

    Example:
        >>> index_uploaded_file("/path/to/file.pdf", chat_file, chroma_collection)
    """
    documents = SimpleDirectoryReader(input_files=[path]).load_data()
    for document in documents:
        document.metadata = {
            'file_id': chat_file.id,
        }

    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    VectorStoreIndex.from_documents(documents=documents,
                                            storage_context=storage_context,
                                            vector_store=vector_store, show_progress=True, embedding=Settings.embed_model)

def index_sql_dump(file: ChatFile, chroma_collection: Collection):
    """
    Indexes a SQL database dump into a vector store for efficient querying.

    This function takes a SQL dump file and a Chroma collection, initializes
    the necessary database and vector store components, and creates an index
    for the specified tables in the SQL database.

    Args:
        file (ChatFile): An object containing metadata about the SQL dump, 
            including the database name and the list of tables to index.
        chroma_collection (Collection): A Chroma collection used as the 
            backend for the vector store.

    Raises:
        Any exceptions raised during database connection, vector store 
        initialization, or indexing will propagate to the caller.

    Returns:
        None
    """
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    pg_url = initialize_pg_url(file.database_name)
    db_engine = create_engine(pg_url)
    sql_database = SQLDatabase(db_engine, include_tables=file.tables)
    tables_node_mapping = SQLTableNodeMapping(sql_database)

    table_schema_objs = [
        SQLTableSchema(table_name=table_name)
        for table_name in file.tables
    ]
    nodes = tables_node_mapping.to_nodes(objs=table_schema_objs)
    for node in nodes:
        node.metadata = {
            'file_id': file.id,
        }

    ObjectIndex.from_objects(
        objects=nodes,
        object_mapping=tables_node_mapping,
        index_cls=VectorStoreIndex,
        storage_context=storage_context,
        show_progress=True,
    )

def deletes_file_index_from_collection(file_id: str, chroma_collection: Collection):
    chroma_collection.delete(where={'file_id': {'$eq': file_id}})
    docs = chroma_collection.get(where={'file_id': {'$eq': file_id}})
    if len(docs['metadatas']) <= 0:
        logger.error('No documents found for file_id', file_id, 'Deleted file: ', file_id)