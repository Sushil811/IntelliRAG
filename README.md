# IntelliRAG - Enterprise AI Knowledge Copilot

IntelliRAG is a production-grade AI Knowledge Assistant powered by Retrieval-Augmented Generation (RAG), Hybrid Search, Re-ranking, and Agentic AI workflows.

## Features

- **Hybrid Search**: Combines Dense Vector Search (Qdrant + Gemini/OpenAI) and Keyword Search (BM25).
- **Reciprocal Rank Fusion (RRF)**: Merges retrieval results intelligently.
- **Re-Ranking**: Uses Cohere's Rerank API to improve the relevance of retrieved chunks.
- **Agentic AI Workflow**: Built with LangGraph. AI can route requests, use tools (summarize, search, compare), and answer complex queries.
- **LLM-as-a-judge Evaluation**: Built-in RAG evaluation metric generation.
- **Enterprise UI**: Stunning frontend built with React, Vite, Tailwind CSS, Recharts, and Lucide Icons.

## Tech Stack

- **Backend**: FastAPI (Python 3.12+), SQLAlchemy, Alembic, PostgreSQL, Qdrant
- **AI / LLM**: LangChain, LangGraph, Google Gemini (Default), OpenAI (Fallback), Cohere (Reranking)
- **Frontend**: React.js (Vite), Tailwind CSS, TanStack Query, React Router
- **Infrastructure**: Docker, Docker Compose

## Quick Start

### 1. Environment Setup

Copy the environment template and fill in your API keys:
```bash
cp .env.example .env
```

### 2. Start Infrastructure

Start PostgreSQL and Qdrant locally using Docker Compose:
```bash
docker-compose up -d
```

### 3. Backend Setup

Install dependencies and run database migrations:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
```

Run the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup

Install dependencies and run the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

## Deployment

- **Backend**: Deploys natively to Render via the provided `render.yaml`.
- **Frontend**: Deploys natively to Vercel via the provided `vercel.json`.
