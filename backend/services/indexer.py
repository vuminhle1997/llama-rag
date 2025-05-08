from duckduckgo_search.cli import chat
from llama_index.core.objects import SQLTableNodeMapping, SQLTableSchema, ObjectIndex
from llama_index.core.readers import SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext, SQLDatabase
from llama_index.core.indices import VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.settings import Settings

from chromadb import Collection
from sqlalchemy import create_engine
from sqlmodel import Session
from markitdown import MarkItDown

from models import ChatFile, Chat
from utils import initialize_pg_url
from dependencies import logger, SessionDep

import os

def index_spreadsheet(chroma_collection: Collection, file: ChatFile, db_client: SessionDep):
    """
    Indexes a spreadsheet file by converting it to Markdown, splitting it into chunks, 
    and storing the resulting vectorized data in a Chroma vector store.

    Args:
        chroma_collection (Collection): The Chroma collection to store the vectorized data.
        file (ChatFile): The file object containing metadata and path information for the spreadsheet.
        db_client (SessionDep): The database session dependency for updating the file's indexing status.

    Workflow:
        1. Converts the spreadsheet file to Markdown format using the MarkItDown library.
        2. Saves the converted Markdown content to a file.
        3. Loads the Markdown file as documents using SimpleDirectoryReader.
        4. Updates document metadata with the file ID.
        5. Creates a Chroma vector store and a storage context.
        6. Splits the document content into chunks using SentenceSplitter.
        7. Indexes the documents into the vector store using VectorStoreIndex.
        8. Updates the database to mark the file as indexed.

    Logs:
        - Logs the start and completion of the indexing process.
        - Logs any errors encountered during the database update.

    Raises:
        Exception: If an error occurs during the database update process.
    """
    id = file.id
    logger.info(f"Start indexing markdown for: {id}, {file.path_name}")

    md = MarkItDown(enable_plugins=True)
    md_path = f"{os.getcwd()}/uploads/{file.chat_id}/{file.file_name.split('.')[0]}.md"
    result = md.convert(file.path_name)

    with open(md_path, "w", encoding='utf-8') as f:
        f.write(result.text_content)

    documents = SimpleDirectoryReader(input_files=[md_path]).load_data()
    for document in documents:
        document.metadata = {
            'file_id': id,
        }

    chroma_vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)
    transformations = SentenceSplitter(
        chunk_size=256,
        chunk_overlap=20,
    )
    VectorStoreIndex.from_documents(documents=documents,
                                    storage_context=storage_context,
                                    vector_store=chroma_vector_store,
                                    transformations=[transformations],
                                    show_progress=True, embedding=Settings.embed_model)
    logger.info('Indexed spreadsheet.')

    try:
        db_file = db_client.get(ChatFile, id)
        db_file.indexed = True
        db_client.commit()
        db_client.refresh(db_file)
        logger.info(f"Indexed Markdown file of spreadsheet: {db_file.file_name}")
    except Exception as e:
        logger.error(e)
        db_client.rollback()


def index_uploaded_file(path: str, chat_file: ChatFile, chroma_collection: Collection, db_client: SessionDep):
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
    try:
        chat_file = db_client.get(ChatFile, chat_file.id)
        chat_file.indexed = True
        db_client.commit()
        db_client.refresh(chat_file)
        logger.info(f"Indexed file: {chat_file.file_name}")
    except Exception as e:
        logger.error(e)


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
    """
    Deletes all documents associated with a given file ID from the specified Chroma collection.

    Args:
        file_id (str): The unique identifier of the file whose documents are to be deleted.
        chroma_collection (Collection): The Chroma collection from which the documents will be deleted.

    Behavior:
        - Deletes documents from the collection where the 'file_id' matches the provided value.
        - Attempts to retrieve documents with the same 'file_id' after deletion to verify the operation.
        - Logs an error if no documents are found for the given 'file_id' after the deletion process.

    Note:
        Ensure that the `chroma_collection` object supports the `delete` and `get` methods with the 
        specified query format.
    """
    chroma_collection.delete(where={'file_id': {'$eq': file_id}})
    docs = chroma_collection.get(where={'file_id': {'$eq': file_id}})
    if len(docs['metadatas']) <= 0:
        logger.error('No documents found for file_id', file_id, 'Deleted file: ', file_id)
