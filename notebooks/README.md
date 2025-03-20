# Backend

The backend provides a REST API for interacting with Large Language Models (LLMs) while leveraging various services for data persistence, caching, and vector search. It enables RAG (Retrieval Augmented Generation) workflows by combining document retrieval with LLM-powered text generation. The API supports document ingestion, semantic search, and conversational interactions with documents.

This codebase contains:
- Python backend with FastAPI
- Jupyter notebooks for LLM prototyping/testing
- Integration with Postgres, Redis, ChromaDB
- Azure Entra ID authentication
- LLM and embedding services via Ollama

## Setup

1. Create and activate virtual environment:
```bash
python -m venv $PWD/venv
source ./venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with required environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
# Example .env configuration:
```
# Azure AD authentication
```
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
TENANT_ID=your_tenant_id
REDIRECT_URI=http://localhost:4000/redirect
```

# Redis configuration
```
REDIS_HOST=localhost
REDIS_PORT=6379
```

Required services:
- PostgreSQL database
- Redis cache
- ChromaDB vector store
- Ollama for LLM/embeddings
- Azure Entra ID for auth

