import json
import asyncio
import uuid

from datetime import datetime
from llama_index.core import PromptTemplate
from llama_index.core.agent import ReActAgent
from llama_index.core.base.llms.types import MessageRole, ChatMessage
from llama_index.core.chat_engine.types import StreamingAgentChatResponse
from llama_index.core.memory import ChatMemoryBuffer
from typing import List, AsyncGenerator
from llama_index.core.tools import BaseTool
from sqlmodel import Session
from models import Chat

from dependencies import logger

def create_agent(memory: ChatMemoryBuffer, system_prompt: PromptTemplate, tools: List[BaseTool],
                 **kwargs) -> ReActAgent:
    """
    Creates and configures a ReActAgent with specified parameters.

    Args:
        memory (ChatMemoryBuffer): Memory buffer to store conversation history
        system_prompt (PromptTemplate): System prompt template for the agent
        tools (List[BaseTool]): List of tools available to the agent
        **kwargs: Additional keyword arguments to pass to ReActAgent.from_llm()

    Returns:
        ReActAgent: Configured agent instance with updated prompts and specified parameters

    Example:
        >>> memory = ChatMemoryBuffer()
        >>> system_prompt = PromptTemplate("You are a helpful assistant")
        >>> tools = [Tool1(), Tool2()]
        >>> agent = create_agent(memory, system_prompt, tools)
    """
    agent = ReActAgent.from_llm(
        system_prompt=system_prompt,
        memory=memory,
        max_iterations=50,
        **kwargs,
        verbose=True,
        tools=tools,
    )
    agent.update_prompts({"agent_worker:system_prompt": system_prompt})
    return agent
