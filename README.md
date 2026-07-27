# IntelliRAG: Production-Grade Enterprise AI Knowledge Copilot & Hybrid RAG System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant_Vector_DB-DC2626?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**IntelliRAG** is an end-to-end, enterprise-ready Retrieval-Augmented Generation (RAG) platform designed to eliminate hallucinations, enforce strict multi-tenant data isolation, and provide lightning-fast, factual search across enterprise knowledge bases.

---

## 🌟 Architecture Overview

```
                      +----------------------------------+
                      |     React + TypeScript Frontend  |
                      | (Glassmorphism UI / TanStack)    |
                      +----------------+-----------------+
                                       |
                                HTTP / REST API (JWT)
                                       v
                      +----------------------------------+
                      |         FastAPI Backend          |
                      |   (AsyncIO / Pydantic / Auth)    |
                      +-------+------------------+-------+
                              |                  |
           +------------------+                  +------------------+
           |                                                        |
           v                                                        v
+-----------------------+                                +-----------------------+
|  Supabase PostgreSQL  |                                |   Qdrant Vector DB    |
| (Users / Orgs / Docs) |                                | (768-D Vector Chunks) |
+-----------------------+                                +-----------------------+
           |                                                        |
           +------------------+                  +------------------+
                              |                  |
                              v                  v
                      +----------------------------------+
                      |      Hybrid RAG Pipeline         |
                      |  - Query Rewriter (LLM)          |
                      |  - Vector Search (Qdrant)        |
                      |  - Keyword Search (Rank-BM25)    |
                      |  - Fusion (RRF Algorithm)        |
                      |  - Reranker (Cohere v3)          |
                      |  - Generation (Gemini Flash)     |
                      +----------------------------------+
```

---

## 🔥 Key Technical Highlights

### 1. Hybrid Search (Dense + Sparse) & RRF
Standard vector search can fail on exact keyword matches (part numbers, technical jargon, names). IntelliRAG implements **Hybrid Search**:
- **Dense Retrieval**: Cosine similarity in Qdrant Cloud using 768-dimensional Google Gemini Embeddings (`gemini-embedding-001`).
- **Sparse Retrieval**: In-memory Rank-BM25 keyword search.
- **Reciprocal Rank Fusion (RRF)**: Merges dense and sparse result lists using the RRF algorithm to produce a single, optimal candidate ranking.

### 2. Cohere Reranking Pipeline
After RRF fusion, candidate chunks pass through **Cohere Rerank v3** to re-score relevance against the user's intent, ensuring only top-scoring, highly relevant context reaches the LLM context window.

### 3. Asynchronous Non-Blocking Document Ingestion
Document parsing (`PDF`, `DOCX`, `TXT`, `MD`, `CSV`) is offloaded to background threads using FastAPI `BackgroundTasks` + `asyncio.to_thread`.
- Document status transitions cleanly from `PROCESSING` to `READY` or `FAILED` in PostgreSQL without blocking the main event loop.

### 4. Multi-Tenant Data Isolation
Enforces tenant payload filtering (`tenant_id`, `organization_id`, `document_id`) in Qdrant and PostgreSQL query filters so users can never access data outside their organization.

### 5. Conversational Query Rewriting
Multi-turn chat queries (e.g. *"What about its latency?"*) are rewritten by an LLM module into standalone search queries (*"What is the latency target for IntelliRAG?"*) prior to retrieval.

---

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database & ORM**: PostgreSQL (Supabase), Async SQLAlchemy 2.0, Alembic Migrations
- **Vector Database**: Qdrant Cloud (Managed Vector Engine)
- **AI & Embeddings**: Google Gemini API (`models/gemini-flash-latest`, `models/gemini-embedding-001`), Cohere Rerank API
- **RAG & Search**: LangChain, Rank-BM25
- **Authentication**: PyJWT (JWT Bearer Token), Bcrypt
- **Parsing**: PyPDF, python-docx, csv

### Frontend
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Vanilla CSS + TailwindCSS (Glassmorphism & Dark Mode)
- **State & Data Fetching**: TanStack React Query, Axios Interceptors
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Sushil811/IntelliRAG.git
cd IntelliRAG
```

### 2. Setup & Start Backend
```powershell
cd backend
..\venv\Scripts\python.exe -m pip install -r requirements.txt
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
*Backend API will run at `http://localhost:8000` (API Docs at `http://localhost:8000/api/openapi.json`).*

### 3. Setup & Start Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend Application will run at `http://localhost:5173`.*

---

## 📁 Repository Structure

```
IntelliRAG/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Routes (Auth, Documents, Chat) & Dependencies
│   │   ├── core/         # Security (Bcrypt, JWT) & Config settings
│   │   ├── db/           # Async SQLAlchemy Session & Base models
│   │   ├── models/       # Postgres Models (User, Org, Document, Conversation)
│   │   └── services/     # RAG Pipeline, Qdrant, BM25, Reranker, Ingestion
│   ├── alembic/          # Database Migrations
│   ├── test_e2e.py       # Comprehensive End-to-End Test Suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── context/      # AuthContext & Axios Interceptors
│   │   ├── layouts/      # Dashboard & Auth Glassmorphism Layouts
│   │   ├── pages/        # Dashboard, Chat, Documents, KnowledgeBase, Analytics
│   │   └── App.tsx       # Protected Routes & React Router
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── render.yaml           # Backend Deployment Spec
└── vercel.json           # Frontend Deployment Spec
```

---

## 🧪 Verification & Testing

To run the automated end-to-end integration test (testing User Reg/Login -> Doc Upload -> Ingestion -> Vector Search -> RAG Answer Generation):

```powershell
cd backend
..\venv\Scripts\python.exe test_e2e.py
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
