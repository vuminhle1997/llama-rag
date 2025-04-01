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
from models import ChatFile
from llama_index.core import StorageContext, VectorStoreIndex, SQLDatabase
from llama_index.core.tools import FunctionTool, QueryEngineTool
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

def create_query_engines_from_filters(filters: List[MetadataFilter], chroma_vector_store: ChromaVectorStore) -> List[BaseQueryEngine]:
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)
    vector_index = VectorStoreIndex.from_vector_store(vector_store=chroma_vector_store, storage_context=storage_context,
                                                      embed_model=Settings.embed_model)
    query_engines = [
        vector_index.as_query_engine(filter=meta_filters) for meta_filters in filters
    ]
    return query_engines

def create_pandas_engines_tools_from_files(files: List[ChatFile]):
    pd_tools = []
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
            name=f"pandas_tool_{i}",
            description=f"Tool for evaluating spreadsheet of file: {files[i].file_name}",
        ) for i, pd_tool in enumerate(pd_tools)
    ]
    return pd_tools

def create_sql_engines_tools_from_files(files: List[ChatFile], chroma_vector_store: ChromaVectorStore)\
        -> List[QueryEngineTool]:
    storage_context = StorageContext.from_defaults(vector_store=chroma_vector_store)

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
        vector_index = VectorStoreIndex.from_vector_store(vector_store=chroma_vector_store,
                                                          storage_context=storage_context,
                                                          embed_model=Settings.embed_model,
                                                          filter=filter)
        if "sql" in file.mime_type.lower():
            pg_url = initialize_pg_url(file.database_name)
            db_engine = create_engine(pg_url)

            sql_database = SQLDatabase(db_engine, include_tables=file.tables)
            tables_node_mapping = SQLTableNodeMapping(sql_database)
            table_schema_objs = [
                SQLTableSchema(table_name=table_name)
                for table_name in file.tables
            ]
            obj_index = ObjectIndex.from_objects_and_index(
                objects=table_schema_objs,
                object_mapping=tables_node_mapping,
                index=vector_index,
            )
            query_engine = SQLTableRetrieverQueryEngine(
                sql_database=sql_database, table_retriever=obj_index.as_retriever(similarity_top_k=1, filter=filter),
            )
            tables_desc = ', '.join([str(x) for x in file.tables])
            desc = (f"A SQL Query Engine tool going through the Database '{file.database_name}'."
                           f" The table names are {tables_desc}")
            sql_tools.append(
                QueryEngineTool.from_defaults(
                    query_engine=query_engine,
                    name=f"sql_tool_{file.database_name}",
                    description=desc,
                )
            )
    return sql_tools