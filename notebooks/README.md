Here's a rewritten README that emphasizes the Jupyter Notebook prototyping aspect:

# LLM Prototyping & Backend API

This repository contains Jupyter Notebooks for prototyping with Large Language Models (LLMs) and a supporting backend API for production deployment. The notebooks allow for rapid experimentation with LLM workflows, while the backend provides a REST API for integrating these capabilities into applications.

## Development Setup

1. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment:

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required services:

- PostgreSQL
- ChromaDB vector store
- Ollama (for local LLM/embeddings) or Inference Providers (e.g. IONOS for LLM/embeddings)

Start by exploring the notebooks, then use the backend API to integrate successful prototypes into the application.

## Jupyter Notebooks for Prototyping

The notebooks directory contains exploratory work with:

- LLM prompt engineering
- RAG (Retrieval Augmented Generation) workflows
- Vector search experiments
- Model benchmarks and evaluation

To launch Jupyter:

```bash
jupyter notebook
```
