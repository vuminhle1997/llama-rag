from typing import List

import pandas as pd
from llama_index.vector_stores.chroma import ChromaVectorStore
from pydantic import BaseModel
from llama_index.core.settings import Settings
from llama_index.experimental.query_engine import PandasQueryEngine
from llama_index.core.query_engine import BaseQueryEngine
from llama_index.core.vector_stores import (
    MetadataFilter,
    MetadataFilters,
    FilterOperator,
)
from models import ChatFile
from llama_index.core import StorageContext, VectorStoreIndex
from llama_index.core.tools import QueryEngineTool, FunctionTool, ToolMetadata

#
# class PandasTool(BaseModel):
#     pandas_query_engine: PandasQueryEngine
#     file_name: str
#     async def apandas_tool(self, query: str):
#         """Executes a query with Pandas and return the string result"""
#         try:
#             result = await self.pandas_query_engine.aquery(query)
#             return str(result.response)  # Ensures only the output is returned
#         except Exception as e:
#             return f"Error: {str(e)}"
#
# class ToolsCollection(BaseModel):
#     pd_tools: List[PandasTool]
#     query_engines: List[BaseQueryEngine]
#     files: List[ChatFile]
#
#     def aggregate_tools_from_collection(self):
#         tools = [
#             QueryEngineTool(
#                 query_engine=query_engine,
#                 metadata=ToolMetadata(
#                     name=f"query_engine_{i}",
#                     description=f"Queries through the document {self.files[i].file_name}",
#                 )
#             ) for i, query_engine in enumerate(self.query_engines)
#         ]
#         pd_tools = [
#             FunctionTool.from_defaults(
#                 async_fn=pd_tool.apandas_tool,
#                 name=f"pandas_tool_{[i]}",
#                 description=f"Pandas query tool for the spreadsheet {pd_tool.file_name}",
#             ) for i, pd_tool in enumerate(self.pd_tools)
#         ]
#         tools = tools + pd_tools
#         return tools

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
        ) for file in files
    ]
    return filters

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
        print(file.mime_type)
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




