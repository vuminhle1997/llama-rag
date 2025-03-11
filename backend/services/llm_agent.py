# from typing import List
# from llama_index.core import PromptTemplate
# from llama_index.core.agent.legacy.react.base import ReActAgent
# from llama_index.core.memory import ChatMemoryBuffer
# from llama_index.core.tools import BaseTool
# from pydantic import BaseModel
# from llama_index.core.settings import Settings
#
# class LLMService(BaseModel):
#     memory: ChatMemoryBuffer # chad id
#     system_prompt: PromptTemplate
#     tools: List[BaseTool]
#
#     def chat(self, query: str):
#         agent = ReActAgent.from_tools(
#             llm=Settings.llm,
#             tools=self.tools,
#             verbose=True,
#             memory=self.memory,
#             max_iterations=Settings.max_iterations,
#         )
#         agent.update_prompts({"agent_worker:system_prompt": self.system_prompt})
#         return agent.chat(query)
#
#     async def achat(self, query: str):
#         agent = ReActAgent.from_tools(
#             llm=Settings.llm,
#             tools=self.tools,
#             verbose=True,
#             memory=self.memory,
#             max_iterations=Settings.max_iterations,
#         )
#         agent.update_prompts({"agent_worker:system_prompt": self.system_prompt})
#         return await agent.achat(query)
