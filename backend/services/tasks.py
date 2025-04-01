from sqlmodel import Session
from models import Chat, ChatFile

from utils import load_dump_to_database, list_all_tables_from_db, pg_user, pg_port, pg_host, pg_password
from services import index_sql_dump
from chromadb import Collection

def process_dump_to_persist(db_client: Session, chat_id: str, chat_file_id: str,
                            sql_dump_path: str, database_type: str, db_name: str, chroma_collection: Collection):
    """ Background task that processes the SQL dump asynchronously. """
    with db_client as db_session:
        db_chat = db_session.get(Chat, chat_id)
        if not db_chat:
            print("Chat not found in background task.")
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