# LlamaRAG - Local LLM with RAG capabilities

A powerful application combining local Large Language Models with Retrieval-Augmented Generation (RAG), featuring both chat functionality and Azure API integration.

## 🚀 Features

- Local LLM support with customizable model selection
- RAG implementation for enhanced response accuracy
- Interactive chat interface
- Azure API integration for additional capabilities
- Modern, responsive UI built with NextJS and Tailwind

## 🛠️ Tech Stack

### Frontend
- [NextJS](https://nextjs.org/): A React-based framework for building modern web applications
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development
- ShadcnUI Components: Pre-built UI components for enhanced design
- TypeScript: A strongly typed programming language for JavaScript

### Backend
- [FastAPI](https://fastapi.tiangolo.com/): A modern web framework for building APIs with Python
- [ChromaDB](https://www.trychroma.com/): A vector database for efficient document retrieval
- [PostgreSQL](https://www.postgresql.org/): A powerful, open-source relational database system
- [LlamaIndex](https://gpt-index.readthedocs.io/): A library for RAG implementation
- Local LLM integration (compatible with various models, e.g., [Ollama](https://ollama.ai/))
- [Redis](https://redis.io/): An in-memory data structure store for session management and caching

### Storage & Caching
- Local file system for document and image storage
- Efficient document processing pipeline

## 🏃‍♂️ Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/vuminhle1997/llama-rag.git
   cd llama-rag
   ```
2. Install dependencies for both frontend and backend:
   ```bash
   # Backend
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   yarn set version stable
   yarn install
   ```
3. Configure your environment variables:
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the placeholders (`<...>`) in the `.env` file with your actual configuration values.

4. Start the development servers:
   ```bash
   # Backend
   cd backend
   source venv/bin/activate
   granian --host 0.0.0.0 --port 4000 --reload --reload-ignore-dirs logs main:app

   # Frontend
   cd ../frontend
   yarn dev
   ```

## 📝 Prerequisites

- Node.js 20+
- Python 3.8+
- PostgreSQL
- Local LLM of choice (e.g., Ollama)
- Docker

## 🔧 Installation & Setup

1. Ensure Docker is installed and running on your system.
2. Use the provided `docker-compose.yml` file to set up the environment:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:4000](http://localhost:4000)

## 📂 Folder Structure

- [Backend](./backend): Contains the FastAPI application, database models, and services.
- [Frontend](./frontend): Contains the NextJS application and UI components.
- [Notebooks](./notebooks): Includes Jupyter notebooks for prototyping and experimentation.
