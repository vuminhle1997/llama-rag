import mysql.connector
import psycopg2
import os
import re
from models import Chat, ChatFile
from sqlmodel import Session

pg_host = os.getenv("PG_HOST", "localhost")
pg_port = os.getenv("PG_PORT", 5432)
pg_user = os.getenv("PG_USER", "root")
pg_password = os.getenv("PG_PASSWORD", "<PASSWORD>")

mysql_host = os.getenv("MYSQL_HOST", "localhost")
mysql_port = os.getenv("MYSQL_PORT", 3306)
mysql_user = os.getenv("MYSQL_USER", "root")
mysql_password = os.getenv("MYSQL_PASSWORD", "<PASSWORD>")

def initialize_pg_url(pg_db: str):
    return f"postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_db}"

def load_mysql_dump(host: str, port: int, user: str, password: str, db: str, dump_path: str, **kwargs):
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            port=port,
            **kwargs
        )
        cursor = conn.cursor()

        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db};")
        print(f"Database '{db}' checked/created successfully.")

        conn.database = db
        conn.autocommit = True

        with open(dump_path, "r", encoding="utf-8") as file:
            sql_script = file.read()

        sql_script = re.sub(r"(?i)CREATE DATABASE.*?;", "", sql_script)
        sql_script = re.sub(r"(?i)USE\s+\S+;", "", sql_script)

        for statement in sql_script.split(";"):
            statement = statement.strip()
            if statement:
                cursor.execute(statement)
        print("SQL dump loaded successfully.")
    except mysql.connector.Error as e:
        print(f"MySQL Error: {e}")
    except Exception as e:
        print(f"General Error: {e}")
    finally:
        cursor.close()
        conn.close()

def load_pgsql_dump(host: str, port: int, user: str, password: str, db: str, dump_path: str, **kwargs):
    try:
        conn = psycopg2.connect(
            host=pg_host,
            port=pg_port,
            user=pg_user,
            password=pg_password,
            dbname="postgres",
            **kwargs
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Create the database if it doesn't exist
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db}';")
        if not cursor.fetchone():
            cursor.execute(f"CREATE DATABASE {db};")
            print(f"Database '{db}' created successfully.")
        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"PostgreSQL Error: {e}")
    finally:
        os.system(f"PGPASSWORD={password} psql -U {user}  -h {host} -p {port} -d {db} < {dump_path}")

def detect_sql_dump_type(file_path: str) -> str:
    """Detect if an SQL dump is from MySQL or PostgreSQL."""
    mysql_keywords = {"ENGINE=", "AUTO_INCREMENT", "UNLOCK TABLES", "LOCK TABLES", "CHARSET="}
    postgres_keywords = {"SET search_path", "SERIAL PRIMARY KEY", "RETURNING", "BIGSERIAL", "NOW()"}

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            for line in file:
                line = line.strip().upper()
                if any(keyword in line for keyword in mysql_keywords):
                    return "MySQL"
                if any(keyword in line for keyword in postgres_keywords):
                    return "Postgres"
        return "Unknown"
    except Exception as e:
        return f"Error reading file: {e}"

class PostgresMigration():
    def __init__(self, host: str, port: int, user: str, password: str, db: str):
        self.mysql_host = host
        self.mysql_user = user
        self.mysql_password = password
        self.mysql_database = db
        self.mysql_port = port
        self.mysql_db = db

    def migrate_mysql_to_pg(self, pg_host: str, pg_port: int, pg_user: str, pg_password: str, pg_db: str, **kwargs):
        try:
            conn = psycopg2.connect(
                host=pg_host,
                port=pg_port,
                user=pg_user,
                password=pg_password,
                dbname="postgres",
                **kwargs
            )
            conn.autocommit = True
            cursor = conn.cursor()

            cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{pg_db}';")
            if not cursor.fetchone():
                cursor.execute(f"CREATE DATABASE {pg_db};")
                print(f"Database '{pg_db}' created successfully.")
        except psycopg2.Error as e:
            print(f"PostgreSQL Error: {e}")
        except Exception as e:
            print(f"General Error: {e}")

        try:
            mysql_url = f"mysql://{self.mysql_user}:{self.mysql_password}@{self.mysql_host}:{self.mysql_port}/{self.mysql_db}"
            pg_url = f"pgsql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_db}"
            os.system(f"pgloader {mysql_url} {pg_url}")
        except Exception as e:
            print(f"General Error: {e}")
    def delete_old_db_from_mysql(self, **kwargs):
        try:
            conn = mysql.connector.connect(
                host=self.mysql_host,
                user=self.mysql_user,
                password=self.mysql_password,
                port=self.mysql_port,
                **kwargs
            )
            cursor = conn.cursor()
            cursor.execute(f"DROP DATABASE {self.mysql_db}")
            print(f"Database '{self.mysql_db}' dropped successfully.")
            conn.commit()
            conn.close()
        except mysql.connector.Error as e:
            print(f"MySQL Error: {e}")

def load_dump_to_database(sql_dump_path: str, db_name="TWICE"):
    db = detect_sql_dump_type(sql_dump_path)
    if db == "MySQL":
        print("MySQL dump detected")
        load_mysql_dump(mysql_host, mysql_port, mysql_user, mysql_password, db_name, sql_dump_path)
        migration = PostgresMigration(mysql_host, mysql_port, mysql_user, mysql_password, db_name,)
        migration.migrate_mysql_to_pg(pg_host, pg_port, pg_user, pg_password, db_name)
        migration.delete_old_db_from_mysql()
    elif db == "Postgres":
        print("PostgreSQL dump detected")
        load_pgsql_dump(pg_host, pg_port, pg_user, pg_password, db_name, sql_dump_path)

def list_all_tables_from_db(host: str, port: int, user: str, password: str, db: str, db_type: str, **kwargs):
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=db,
            **kwargs,
        )
        cursor = conn.cursor()
        statement = f"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        if db_type == "MySQL":
            statement = f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{db}';"
        cursor.execute(statement)

        tables = []
        for table in cursor.fetchall():
            tables.append(table[0])

        print(tables)
        cursor.close()
        conn.close()
        return tables
    except psycopg2.Error as e:
        print(f"PostgreSQL Error: {e}")
        return []

def delete_database_from_postgres(database_name: str):
    try:
        conn = psycopg2.connect(
            host=pg_host,
            port=pg_port,
            user=pg_user,
            password=pg_password,
            dbname='postgres',
        )
        conn.autocommit = True
        cursor = conn.cursor()
        statement = f"DROP DATABASE {database_name};"
        cursor.execute(statement)

        print(f"Database '{database_name}' dropped successfully.")
        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"PostgreSQL Error: {e}")
        raise e


def process_dump_to_persist(db_client: Session, chat_id: str, chat_file_id: str,
                            sql_dump_path: str, database_type: str, db_name: str):
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

        db_session.commit()
        db_session.refresh(db_chat)