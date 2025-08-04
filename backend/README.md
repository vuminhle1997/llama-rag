# Backend

The backend is a robust and scalable system designed to provide a REST API for interacting with Large Language Models (LLMs) and supporting Retrieval Augmented Generation (RAG) workflows. It integrates various services for data persistence, caching, and vector search, enabling seamless document retrieval and LLM-powered text generation. The backend is built using FastAPI and leverages several cutting-edge technologies to deliver high performance and flexibility.

## Features

- **FastAPI Framework**: Provides a high-performance REST API.
- **LlamaIndex Integration**: Facilitates efficient document indexing and retrieval.
- **Local LLMs with Ollama or via inference providers**: Supports local deployment of LLMs for text generation and embeddings.
- **ChromaDB**: Serves as a vector database for semantic search and document retrieval.
- **Redis**: Used for caching and session management.
- **Azure Entra ID**: Enables secure authentication and authorization.
- **Database Support**: Communicates with PostgreSQL and MySQL for data persistence.
- **Opentelemetry and Arize Phoenix**: Provides tracing and observability for local LLM operations.

## Architecture

The backend communicates with the following services:

- **PostgreSQL**: Primary relational database for data storage.
- **MySQL**: Used for migration and additional relational data needs.
- **Redis**: Provides caching and session management.
- **Ollama Service**: Handles LLM and embedding operations.
- **ChromaDB Service**: Manages vector storage and retrieval for semantic search.

## Setup Instructions

### 1. Create and Activate Virtual Environment

```bash
python -m venv $PWD/venv
source ./venv/bin/activate
```

### 2. Install Dependencies

Install the required Python packages using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file by copying the provided `.env.example` file:

```bash
cp .env.example .env
```

Edit the `.env` file to include your configuration. Example configuration:

```env
# Azure Entra ID authentication
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
TENANT_ID=your_tenant_id
REDIRECT_URI=http://localhost:4000/redirect

# JWT for user and redis
SECRET_KEY=<openssl rand -hex 32, necessary for generating SECRET>

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# PostgreSQL configuration
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/llama-rag
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=password

# MySQL configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password

# ChromaDB configuration
CHROMA_COLLECTION_NAME=llama-rage-TEST

# Arize Phoenix Provider
PHOENIX_API_KEY=<taken from the Phoenix Service API KEY Provider>

# LLM communication
LLM_PROVIDER=<IONOS|Ollama>
IONOS_API_KEY=
IONOS_BASE_URL=https://openai.inference.de-txl.ionos.com/v1
```

### 4. Start the FastAPI Server

Use Hypercorn as the ASGI server to start the FastAPI application:

```bash
# granian --interface asgi --host 0.0.0.0 --port 4000 --reload --reload-ignore-dirs logs main:app
hypercorn main:app --bind 0.0.0.0:{$PORT}
```

This command starts the server with the following settings:

- **External Access**: Accessible via `0.0.0.0`.
- **Port**: Runs on port `4000`.

## Required Services

Ensure the following services are running and properly configured:

- **PostgreSQL**: For relational data storage.
- **MySQL**: For importing MySQL/MariaDB dumps and migrating them to _PostgreSQL_
- **Redis**: For session management.
- **ChromaDB**: For vector storage and retrieval.
- **Ollama**: For LLM and embedding services.
- **Arize Phoenix**: For tracing and monitoring LLM activities.
- **Azure Entra ID**: For authentication and authorization.

## Additional Notes

- The backend is designed to work seamlessly with the frontend and other components of the system.
- Refer to the `.env.example` file for all required environment variables.
- Use the provided [Jupyter notebooks](../notebooks) for prototyping and testing LLM workflows.
