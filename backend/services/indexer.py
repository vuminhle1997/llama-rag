from models import ChatFile
from llama_index.core.readers import SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext
from llama_index.core.indices import VectorStoreIndex
from chromadb import Collection
from llama_index.core.settings import Settings

def index_uploaded_file(path: str, chroma_collection: Collection):
    documents = SimpleDirectoryReader(input_files=[path]).load_data()
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    VectorStoreIndex.from_documents(documents=documents,
                                            storage_context=storage_context,
                                            vector_store=vector_store, show_progress=True, embedding=Settings.embed_model)

def deletes_file_index_from_collection(file_id: str, chroma_collection: Collection):
    chroma_collection.delete(where={'file_id': {'$eq': file_id}})
    docs = chroma_collection.get(where={'file_id': {'$eq': file_id}})
    if len(docs['metadatas']) <= 0:
        print('No documents found for file_id', file_id, 'Deleted file: ', file_id)