from llama_index.core.memory import (
    Memory,
    StaticMemoryBlock,
    FactExtractionMemoryBlock,
    VectorMemoryBlock,
)
from llama_index.core.settings import Settings
from llama_index.core.llms import ChatMessage as LLMChatMessage
from llama_index.vector_stores.chroma import ChromaVectorStore
from typing import List

def create_memory(chat_id: str,
                  llm,
                  messages: List[LLMChatMessage],
                  vector_store: ChromaVectorStore,
                  token_limit = 128_000):
    """
    Creates a memory object for managing chat interactions and storing relevant information.

    Args:
        chat_id (str): The unique identifier for the chat session.
        llm: The language model instance used for processing and extracting information.
        messages (List[LLMChatMessage]): A list of chat messages to initialize the memory with.
        vector_store (ChromaVectorStore): The vector store used for managing vector-based memory blocks.
        token_limit (int, optional): The maximum token limit for the memory. Defaults to 128,000.

    Returns:
        Memory: An initialized memory object containing the specified memory blocks and chat history.
    """
    blocks = [
        StaticMemoryBlock(
            name="core_info",
            static_content="You are a smart AI assistant and follows the rules and system prompts that "
                           "were given by the user",
            priority=0,
        ),
        FactExtractionMemoryBlock(
            name="extracted_info",
            llm=llm,
            max_facts=10,
            priority=1,
        ),
        VectorMemoryBlock(
            name="vector_memory",
            vector_store=vector_store,
            priority=2,
            embed_model=Settings.embed_model,
            similarity_top_k=3, # The top-k message batches to retrieve
            retrieval_context_window=5 # optional: How many previous messages to include in the retrieval query
        ),
    ]
    memory = Memory.from_defaults(
        token_limit=token_limit,
        memory_blocks=blocks,
        session_id=chat_id,
        chat_history_token_ratio=0.3, # 0.3 are stored in short-term (memory), the rest 0.7 are in long-term (blocks)
        token_flush_size=1024,
    )
    memory.put_messages(messages)

    return memory