from llama_index.core import PromptTemplate
from llama_index.core.agent import ReActAgent, AgentRunner, FunctionCallingAgent
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.settings import Settings
from typing import List
from llama_index.core.tools import BaseTool


def create_agent(memory: ChatMemoryBuffer, system_prompt: PromptTemplate, tools: List[BaseTool],
                 **kwargs) -> ReActAgent:
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