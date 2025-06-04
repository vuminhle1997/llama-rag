import json
import asyncio
import uuid

from datetime import datetime
from llama_index.core import PromptTemplate
from llama_index.core.agent.workflow import ReActAgent
from typing import List, AsyncGenerator
from llama_index.core.tools import BaseTool
from llama_index.llms.ollama import Ollama
from sqlmodel import Session
from models import Chat

from dependencies import logger

def create_agent(system_prompt: str, tools: List[BaseTool],
                 llm: Ollama,
                 **kwargs) -> ReActAgent:
    """
    Creates and configures a ReActAgent with specified parameters.

    Args:
        system_prompt (str): System prompt template for the agent
        tools (List[BaseTool]): List of tools available to the agent
        llm (Ollama): Ollama
        **kwargs: Additional keyword arguments to pass to ReActAgent

    Returns:
        ReActAgent: Configured agent instance with updated prompts and specified parameters

    Example:
        >>> system_prompt = "You are a helpful assistant"
        >>> tools = [Tool1(), Tool2()]
        >>> agent = create_agent(system_prompt, tools, llm)
    """
    agent = ReActAgent(
        llm=llm,
        tools=tools,
        system_prompt=system_prompt,
        **kwargs,
    )
    return agent
