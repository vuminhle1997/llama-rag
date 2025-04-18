import uuid
from typing import List

import pandas as pd
from llama_index.core.indices.struct_store import SQLTableRetrieverQueryEngine
from llama_index.core.objects import SQLTableNodeMapping, SQLTableSchema, ObjectIndex
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.settings import Settings
from llama_index.experimental.query_engine import PandasQueryEngine
from llama_index.core.query_engine import BaseQueryEngine
from llama_index.core.vector_stores import (
    MetadataFilter,
    MetadataFilters,
    FilterOperator,
)
from models import ChatFile, Chat
from llama_index.core import (
    StorageContext, 
    VectorStoreIndex, 
    SQLDatabase
)
from llama_index.core.tools import FunctionTool, QueryEngineTool, ToolMetadata
from llama_index.tools.duckduckgo import DuckDuckGoSearchToolSpec
from llama_index.readers.web import BeautifulSoupWebReader
from sqlalchemy import create_engine
from utils import initialize_pg_url

class PandasTool:
    def __init__(self, query_engine: PandasQueryEngine):
        self.query_engine = query_engine

    async def apandas_tool(self, query: str):
        """Executes a query with Pandas and return the string result"""
        try:
            result = await self.query_engine.aquery(query)
            return str(result.response)  # Ensures only the output is returned
        except Exception as e:
            return f"Error: {str(e)}"

def create_filters_for_files(files: List[ChatFile]):
    """
    Creates metadata filters for a list of files, excluding SQL files.

    Args:
        files (List[ChatFile]): List of ChatFile objects to create filters for.

    Returns:
        List[MetadataFilters]: List of metadata filter objects, one for each non-SQL file.
        Returns empty list if input files list is empty.

    Example:
        >>> files = [ChatFile(id="1", mime_type="text/plain")]
        >>> filters = create_filters_for_files(files)
        >>> print(filters)
        [MetadataFilters(filters=[MetadataFilter(operator=EQ, key="file_id", value="1")])]
    """
    if len(files) == 0:
        return []
    filters = [
        MetadataFilters(
            filters=[
                MetadataFilter(
                    operator=FilterOperator.EQ,
                    key="file_id",
                    value=file.id,
                )
            ]
        ) for file in files if "sql" not in file.mime_type.lower()
    ]
    return filters

def create_query_engines_from_filters(filters: List[MetadataFilters], chroma_vector_store: ChromaVectorStore) -> List[BaseQueryEngine]:
    """
    Creates a list of query engines from metadata filters using a Chroma vector store.

    Args:
        filters (List[MetadataFilter]): A list of metadata filters to create query engines from.
        chroma_vector_store (ChromaVectorStore): The Chroma vector store to use for creating the index.

    Returns:
        List[BaseQueryEngine]: A list of query engines, each initialized with a corresponding metadata filter.

    Example:
        >>> filters = [MetadataFilter(key="category", value="tech"), MetadataFilter(key="date", value="2023")]
        >>> query_engines = create_query_engines_from_filters(filters, chroma_store)
    """
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)
    vector_index = VectorStoreIndex.from_vector_store(vector_store=chroma_vector_store, storage_context=storage_context,
                                                      embed_model=Settings.embed_model)
    query_engines = [
        vector_index.as_query_engine(filter=meta_filters) for meta_filters in filters
    ]
    return query_engines

def create_query_engine_tools(files: List[ChatFile], chroma_vector_store: ChromaVectorStore):
    """
    Creates a list of QueryEngineTool objects from provided files and a Chroma vector store.

    The function filters out SQL files, creates appropriate filters for remaining files,
    and generates query engines with associated metadata for each file.

    Args:
        files (List[ChatFile]): List of ChatFile objects containing file information.
        chroma_vector_store (ChromaVectorStore): A ChromaVectorStore instance for vector storage.

    Returns:
        List[QueryEngineTool]: A list of QueryEngineTool objects, each containing a query engine
        and metadata specific to a file.

    Note:
        - SQL files are explicitly filtered out from processing
        - Each QueryEngineTool is named based on the corresponding file name
    """
    files = [file for file in files if "sql" not in file.mime_type.lower()]
    filters = create_filters_for_files(files=files)
    query_engines = create_query_engines_from_filters(filters=filters, chroma_vector_store=chroma_vector_store)
    query_engine_tools = [
        QueryEngineTool(
            query_engine=query_engine,
            metadata=ToolMetadata(
                name=f"QueryEngineTool-{files[i].file_name}",
                description=f"Query engine for analyzing and retrieving information from the document '{files[i].file_name}'. "
                            f"Use this tool to perform searches and extract insights from the content of the file.",
            )
        ) for i, query_engine in enumerate(query_engines)
    ]
    return query_engine_tools

def create_pandas_engines_tools_from_files(files: List[ChatFile]):
    """
    Creates a list of Pandas-based function tools from a list of chat files.

    This function processes CSV and Excel files to create PandasQueryEngine and PandasTool instances,
    which are then wrapped into FunctionTools for data analysis capabilities.

    Args:
        files (List[ChatFile]): A list of ChatFile objects containing file information including
            mime_type and path_name. Only CSV and Excel files will be processed.

    Returns:
        List[FunctionTool]: A list of FunctionTool objects, each containing:
            - An async pandas query function
            - A name based on the original filename
            - A description of the tool's functionality

    Example:
        >>> chat_files = [ChatFile(mime_type='text/csv', path_name='data.csv')]
        >>> pd_tools = create_pandas_engines_tools_from_files(chat_files)
    """
    pd_tools = []
    files = [file for file in files if "csv" in file.mime_type.lower() or "excel" in file.mime_type.lower()]

    for file in files:
        if "csv" in file.mime_type.lower():
            pd_query = PandasQueryEngine(
                df=pd.read_csv(file.path_name),
                verbose=True,
            )
            pd_tool = PandasTool(query_engine=pd_query)
            pd_tools.append(pd_tool)
        if "excel" in file.mime_type.lower():
            pd_query = PandasQueryEngine(
                df=pd.read_excel(file.path_name),
                verbose=True,
            )
            pd_tool = PandasTool(query_engine=pd_query)
            pd_tools.append(pd_tool)

    pd_tools = [
        FunctionTool.from_defaults(
            async_fn=pd_tool.apandas_tool,
            name=f"PandasTool-{files[i].file_name}",
            description=f"Analyze and query the spreadsheet file '{files[i].file_name}' using Pandas. "
                        f"This tool allows you to perform data analysis and extract insights from the file.",
        ) for i, pd_tool in enumerate(pd_tools)
    ]
    return pd_tools

def create_sql_engines_tools_from_files(files: List[ChatFile], chroma_vector_store: ChromaVectorStore) -> List[QueryEngineTool]:
    """
    Creates a list of SQL Query Engine tools from the provided files and a Chroma vector store.

    This function processes a list of `ChatFile` objects, filters them based on metadata, and initializes
    SQL Query Engine tools for files with SQL content. It uses the provided Chroma vector store to create
    vector indices and integrates them with SQL databases to enable query execution.

    Args:
        files (List[ChatFile]): A list of `ChatFile` objects, each representing a file with metadata
            such as `id`, `mime_type`, `database_name`, and `tables`.
        chroma_vector_store (ChromaVectorStore): An instance of `ChromaVectorStore` used for creating
            vector indices and filtering based on metadata.

    Returns:
        List[QueryEngineTool]: A list of `QueryEngineTool` objects, each representing a SQL Query Engine
        tool configured for a specific database and its tables.

    Raises:
        Any exceptions raised during the initialization of vector indices, SQL databases, or query engines
        will propagate to the caller.

    Notes:
        - The function filters files based on their MIME type to identify SQL-related files.
        - It initializes a SQL database connection for each SQL file and maps its tables to a vector index.
        - The resulting tools are configured with a description and a retriever for querying the database.
    """
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)
    index = VectorStoreIndex.from_vector_store(vector_store=chroma_vector_store,
                                                      storage_context=storage_context,
                                                      embed_model=Settings.embed_model)

    sql_tools = []
    for file in files:
        filter = MetadataFilters(
            filters=[
                MetadataFilter(
                    operator=FilterOperator.EQ,
                    key="file_id",
                    value=file.id,
                )
            ]
        )

        if "sql" in file.mime_type.lower():
            pg_url = initialize_pg_url(file.database_name)
            db_engine = create_engine(pg_url)

            sql_database = SQLDatabase(db_engine, include_tables=file.tables)
            tables_node_mapping = SQLTableNodeMapping(sql_database)
            table_schema_objs = [
                SQLTableSchema(table_name=table_name)
                for table_name in file.tables
            ]
            nodes = tables_node_mapping.to_nodes(table_schema_objs)
            for node in nodes:
                node.metadata = {
                    'file_id': file.id,
                }

            obj_index = ObjectIndex.from_objects_and_index(
                objects=table_schema_objs,
                object_mapping=tables_node_mapping,
                index=index,
            )
            query_engine = SQLTableRetrieverQueryEngine(
                sql_database=sql_database, table_retriever=obj_index.as_retriever(similarity_top_k=1, filter=filter),
            )
            tables_desc = ', '.join([str(x) for x in file.tables])
            desc = (f"SQL Query Engine for database '{file.database_name}' that can execute SQL queries on the following tables: "
                    f"{tables_desc}. Use this tool when you need to query or analyze data from this database.")
            sql_tools.append(
                QueryEngineTool.from_defaults(
                    query_engine=query_engine,
                    name=f"SQLTool-{file.database_name}",
                    description=desc,
                )
            )
    return sql_tools

def create_url_loader_tool(chroma_vector_store: ChromaVectorStore, chat: Chat):
    """
    Creates a function tool for asynchronously scraping content from URLs.

    This function creates and returns a FunctionTool that can be used to scrape web content
    from URLs and store it in a vector index. The tool uses BeautifulSoup for web scraping
    and integrates with a ChromaVectorStore for content storage.

        chroma_vector_store (ChromaVectorStore): The vector store instance for storing scraped content.
        chat (Chat): The chat instance associated with the scraping operation.

        FunctionTool: A tool that provides URL scraping functionality with the following:
            - name: "ScrapeContentFromURL-Tool"
            - description: "Scrape from URL"
            - async function that handles the scraping operation

    Example:
        ```python
        vector_store = ChromaVectorStore()
        chat_instance = Chat()
        url_scraper_tool = create_url_loader_tool(vector_store, chat_instance)
        ```

    Notes:
        - The tool creates unique file records for each scraped URL
        - Content is stored in the provided ChromaVectorStore
        - File records are associated with the provided chat instance
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)
    """
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)
    async def async_scrape_from_url(url: str):
        """
        Asynchronously scrapes content from a given URL and stores it in a vector index.

        This function performs web scraping using BeautifulSoup, creates a file record,
        and indexes the content for future retrieval.

        Args:
            url (str): The URL to scrape content from.

        Returns:
            tuple: A tuple containing:
                - str: The original URL
                - Document: The scraped document object containing the webpage content

        Raises:
            BeautifulSoupWebReaderError: If there are issues scraping the webpage
            VectorStoreIndexError: If there are issues creating the vector index
        """
        reader = BeautifulSoupWebReader()
        documents = reader.load_data([url])

        db_file = ChatFile(
            id=str(uuid.uuid4()),
            file_name=url,
            path_name=url,
            mime_type='text/html',
            chat_id=chat.id,
            database_name=None,
            database_type=None,
            tables=None,
        )

        for document in documents:
            document.metadata = {
                'file_id': db_file.id,
            }

        VectorStoreIndex.from_documents(documents=[documents[0]],storage_context=storage_context,
                                                show_progress=True)
        chat.files.append(db_file)
        return url, documents[0]

    return FunctionTool.from_defaults(
        async_fn=async_scrape_from_url,
        name="ScrapeContentFromLinkTool",
        description="Asynchronously scrape and process website content from a given URL. "
                    "The tool extracts the content, stores it in a vector index, and associates it "
                    "with the current chat session for future queries.",
    )

def create_search_engine_tool(chroma_vector_store: ChromaVectorStore, chat: Chat):
    """
    Creates a search engine tool that uses DuckDuckGo to search for documents based on a user-provided query.
    The tool retrieves hyperlinks, scrapes the content of the URLs, and stores the documents in a vector store.

    Args:
        chroma_vector_store (ChromaVectorStore): The vector store used for storing document embeddings.
        chat (Chat): The chat instance to associate the retrieved documents with.

    Returns:
        FunctionTool: A tool that can be used to perform searches and store the results in the vector store.

    The tool performs the following steps:
        1. Uses DuckDuckGo to perform a search and retrieve hyperlinks.
        2. Scrapes the content of the retrieved URLs using BeautifulSoupWebReader.
        3. Creates ChatFile instances for each document and associates them with the provided chat.
        4. Stores the documents in the vector store with metadata and embeddings.
    """
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)
    reader = DuckDuckGoSearchToolSpec()

    def search_engine_tool(query: str):
        """
        Perform a search query using DuckDuckGo, scrape the resulting web pages, and process the content into documents.

        Args:
            query (str): The search query string.

        Returns:
            List[str]: A list of text content extracted from the scraped web pages.

        Workflow:
            1. Perform a DuckDuckGo search using the provided query and retrieve up to 3 results.
            2. Extract URLs from the search results.
            3. Scrape the content of the web pages corresponding to the URLs using BeautifulSoupWebReader.
            4. For each scraped document:
                - Create a ChatFile object to represent the document metadata.
                - Append the ChatFile object to the chat's file list.
                - Store the document in a vector store index for further processing.
            5. Return the text content of the scraped documents.
        """
        hyperlinks = reader.duckduckgo_full_search(query, max_results=3)
        urls = [hyperlink['href'] for hyperlink in hyperlinks]
        scraper = BeautifulSoupWebReader()
        documents = scraper.load_data(urls=urls)

        for i, document in enumerate(documents):
            db_file = ChatFile(
                id=str(uuid.uuid4()),
                file_name=urls[i],
                path_name=urls[i],
                database_name=None,
                database_type=None,
                chat_id=chat.id,
                tables=None,
                mime_type="text/html"
            )
            document.metadata = {
                'file_id': db_file.id,
            }
            chat.files.append(db_file)
            VectorStoreIndex.from_documents(documents=[document], vector_store=chroma_vector_store,
                                            storage_context=storage_context, embed_model=Settings.embed_model,
                                            show_progress=True)
        return [document.text for document in documents]

    return FunctionTool.from_defaults(
        fn=search_engine_tool,
        name="DuckDuckGoSearchTool",
        description="Perform a web search using DuckDuckGo based on a user-provided query. "
                    "The tool retrieves top results, scrapes the content of the linked web pages, "
                    "and stores the processed content in a vector index for future queries.",
    )