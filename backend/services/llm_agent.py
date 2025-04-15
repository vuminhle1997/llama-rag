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

async def stream_agent_response(
    agent: ReActAgent,
    user_input: str,
    db_client: Session,
    chat_id: str,
    user_message: ChatMessage,
) -> AsyncGenerator[str, None]:
    """
    Asynchronously streams the response from a ReActAgent to the client in a Server-Sent Events (SSE) format.
    This function handles the interaction with a ReActAgent to generate a streaming response based on user input.
    It yields chunks of the response as they are generated, formatted as SSE events. The full response is saved
    to the database once streaming is complete.
    Args:
        agent (ReActAgent): The agent responsible for generating the response.
        user_input (str): The input message from the user.
        db_client (Session): The database session used to save the chat messages.
        chat_id (str): The unique identifier for the chat session.
        user_message (ChatMessage): The user's message object to be saved alongside the assistant's response.
    Yields:
        str: Server-Sent Event (SSE) formatted strings containing chunks of the agent's response or status updates.
    Raises:
        Exception: If an error occurs during the agent's response generation or database operations.
    Notes:
        - The function ensures that the assistant's full response is saved to the database after streaming is complete.
        - If an error occurs during streaming, an error message is sent to the client, and the error is logged.
        - The function handles both structured response chunks (with a `delta` attribute) and raw string responses.
    """
    full_response_text = ""
    try:
        streaming_response: StreamingAgentChatResponse = await agent.astream_chat(user_input)

        async_generator = streaming_response.async_response_gen()

        async for chunk in async_generator:
            delta = None
            if hasattr(chunk, 'delta') and chunk.delta:
                delta = chunk.delta
            elif isinstance(chunk, str): # Handle simpler cases if agent streams raw strings
                delta = chunk

            if delta:
                full_response_text += delta
                # Format as Server-Sent Event (SSE)
                yield f"data: {json.dumps({'value': delta})}\n\n"
                await asyncio.sleep(0.1)

        # Signal the end of the stream
        yield f"data: {json.dumps({'status': 'done'})}\n\n"

    except Exception as e:
        logger.error(f"Error during agent streaming for chat {chat_id}: {e}", exc_info=True)
        yield f"data: {json.dumps({'error': 'An error occurred during streaming.'})}\n\n"
        full_response_text += "\n\n[Error during generation]"
    finally:
        # Save the Assistant's full message AFTER streaming is complete
        if full_response_text:
            assistant_message = ChatMessage(
                id=str(uuid.uuid4()),
                role=MessageRole.ASSISTANT,
                text=full_response_text.strip(),
                block_type='text',
                additional_kwargs={},
                chat_id=chat_id,
                created_at=datetime.now(),
            )
            messages = [
                user_message,
                assistant_message,
            ]
            try:
                db_chat = db_client.get(Chat, chat_id)
                if db_chat:
                    for chat_message in messages:
                        db_chat.messages.append(chat_message)

                    db_chat.last_interacted_at = datetime.now()
                    db_client.commit()
                    db_client.refresh(db_chat)
                    logger.info(f"Assistant message saved for chat {chat_id}")
                else:
                    logger.error(f"Chat {chat_id} not found when trying to save assistant message.")

            except Exception as db_error:
                logger.error(f"Failed to save assistant message for chat {chat_id}: {db_error}", exc_info=True)
                db_client.rollback()
        else:
            logger.warning(f"No response generated for chat {chat_id}, not saving assistant message.")
