from sqlmodel import Session
from models import Chat, ChatFile

from utils import (
    load_dump_to_database, 
    list_all_tables_from_db, 
    pg_user, pg_port, pg_host, 
    pg_password
)
from services import index_sql_dump
from chromadb import Collection
from dependencies import logger

def process_dump_to_persist(db_client: Session, chat_id: str, chat_file_id: str, 
                            sql_dump_path: str, database_type: str, db_name: str, 
                            chroma_collection: Collection):
    """
    Processes a SQL dump file, loads it into a database, indexes its contents, and updates the database records.

    Args:
        db_client (Session): The database session client used to interact with the database.
        chat_id (str): The ID of the chat associated with the operation.
        chat_file_id (str): The ID of the chat file to be processed.
        sql_dump_path (str): The file path to the SQL dump file.
        database_type (str): The type of the database (e.g., PostgreSQL, MySQL).
        db_name (str): The name of the database where the dump will be loaded.
        chroma_collection (Collection): The Chroma collection used for indexing the SQL dump.

    Returns:
        None

    Raises:
        None

    Notes:
        - Ensures the chat and chat file exist in the database before proceeding.
        - Loads the SQL dump into the specified database.
        - Extracts and updates the list of tables from the database.
        - Indexes the SQL dump contents using the provided Chroma collection.
        - Commits the changes to the database session.
    """
    with db_client as db_session:
        db_chat = db_session.get(Chat, chat_id)
        if not db_chat:
            logger.error(f"Chat: '{chat_id}' not found in background task.")
            return

        db_file = db_session.get(ChatFile, chat_file_id)
        load_dump_to_database(sql_dump_path, db_name)

        tables = list_all_tables_from_db(
            host=pg_host, port=pg_port, user=pg_user, password=pg_password, db_type=database_type, db=db_name
        )
        db_file.tables = tables

        index_sql_dump(file=db_file, chroma_collection=chroma_collection)

        db_session.commit()
        db_session.refresh(db_chat)