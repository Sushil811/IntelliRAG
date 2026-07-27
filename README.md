# IntelliRAG: Production-Grade Enterprise AI Knowledge Copilot & Hybrid RAG System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant_Vector_DB-DC2626?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**IntelliRAG | Production Enterprise AI Knowledge Copilot & Hybrid RAG System**


**IntelliRAG** is an end-to-end, enterprise-ready **Retrieval-Augmented Generation (RAG)** platform designed to eliminate hallucinations, enforce strict multi-tenant data isolation, and provide lightning-fast, factual search across enterprise knowledge bases (PDFs, DOCX, TXT, MD, CSV).


Tech Stack: Python (FastAPI), React 18, TypeScript, PostgreSQL (Supabase), Qdrant Cloud Vector DB, Google Gemini, Cohere Rerank, BM25, Docker

• Architected an enterprise Hybrid RAG platform combining Dense Vector Search (Qdrant 768-D) and Sparse Keyword Search (Rank-BM25) merged via Reciprocal Rank Fusion (RRF) and Cohere Rerank v3.
• Implemented non-blocking async document ingestion using FastAPI BackgroundTasks & asyncio.to_thread, transitioning document state (PROCESSING ➔ READY) across PDF, DOCX, CSV formats.
• Engineered strict multi-tenant data isolation using Qdrant payload field filters and PostgreSQL organization-level UUID scoping.
• Developed a responsive Glassmorphic dashboard using React 18, TypeScript, and TanStack React Query with real-time semantic chunk inspection and latency analytics.


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

## 🏛️ 1. Database Schema & Data Modeling

The relational database layer is powered by **PostgreSQL (Supabase)** and managed asynchronously via **SQLAlchemy 2.0 (AsyncIO)** and **Alembic**.

```
  +------------------+         +------------------+
  |   Organization   | 1     * |       User       |
  |------------------|---------|------------------|
  | id (UUID, PK)    |         | id (UUID, PK)    |
  | name (String)    |         | email (String)   |
  | created_at       |         | hashed_password  |
  +------------------+         | organization_id  |
           | 1                 | role (ADMIN/USER)|
           |                   +------------------+
           | 1                           | 1
           v *                           v *
  +------------------+         +------------------+
  |     Document     |         |   Conversation   |
  |------------------|         |------------------|
  | id (UUID, PK)    |         | id (UUID, PK)    |
  | organization_id  |         | user_id (FK)     |
  | name, file_type  |         | document_id (FK) |
  | status (ENUM)    |         +------------------+
  +------------------+                   | 1
                                         v *
                               +------------------+
                               |     Message      |
                               |------------------|
                               | id (UUID, PK)    |
                               | conversation_id  |
                               | role (user/ai)   |
                               | content (Text)   |
                               | metadata_json    |
                               +------------------+
```

### Document Status Lifecycle (State Machine)
1. **`PROCESSING`**: Set immediately when `POST /api/documents/upload` receives a file.
2. **`READY`**: Set when text extraction, chunking, Gemini embedding, and Qdrant vector storage complete successfully.
3. **`FAILED`**: Set if text extraction or vector storage encounters an unhandled exception.

---

## 🔐 2. Security & Authentication Mechanics

### Password Security (`bcrypt`)
- Passwords are salted and hashed using **native `bcrypt`** (`bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt())`).
- Passwords are automatically truncated at 72 bytes to prevent `ValueError` buffer issues on Python 3.13.

### JWT Token Lifecycle (`PyJWT`)
- On successful login (`POST /api/auth/login`), the server issues an **HS256 JWT Access Token**.
- Token Payload contains:
  ```json
  {
    "sub": "<user_uuid_string>",
    "exp": "<timestamp_7_days_ahead>"
  }
  ```
- **FastAPI Dependency (`get_current_user`)**:
  Extracts the `Authorization: Bearer <token>` header, decodes the payload, converts `sub` to `uuid.UUID`, and fetches the active `User` record from PostgreSQL.

---

## ⚙️ 3. Asynchronous Document Ingestion Engine

```
[ Upload File ]
       │
       ▼
[ FastAPI Route (/documents/upload) ]  ──► Returns HTTP 200 (Status: PROCESSING)
       │
       ▼  (FastAPI BackgroundTasks)
[ process_document_task (Async Threadpool) ]
       │
       ├──► 1. Text Extraction (PyPDF / python-docx / csv / utf-8-sig)
       ├──► 2. Recursive Text Chunking (~500 chars)
       ├──► 3. Batch Embeddings (Google Gemini 768-D)
       ├──► 4. Qdrant Upsert (Points + tenant_id metadata)
       └──► 5. Async DB Session Status Update (PROCESSING ➔ READY)
```

### Non-Blocking Execution Strategy
- Standard document parsing can freeze the web server event loop.
- IntelliRAG wraps heavy document extraction and vector generation inside `await asyncio.to_thread(ingestion_service.process_document, ...)` inside an `async def process_document_task`.
- This ensures FastAPI continues handling incoming HTTP requests without latency spikes.

---

## 🔍 4. The Hybrid RAG Retrieval Subsystem

When a query arrives, IntelliRAG executes a 5-stage retrieval pipeline:

```
                          [ User Query ]
                                │
                                ▼
                      [ 1. Query Rewriter ]  (Converts context history to standalone query)
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
      [ 2. Dense Vector Search ]     [ 3. Sparse BM25 Search ]
     (Qdrant Cloud - 768D Cosine)   (Rank-BM25 Keyword Matching)
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
                    [ 4. RRF Hybrid Fusion ]
                  (Reciprocal Rank Fusion Score)
                                │
                                ▼
                     [ 5. Cohere Reranker ]
                   (Re-scores top 5 candidates)
                                │
                                ▼
                   [ 6. LLM Context Prompt ]
                     (Gemini Flash Generation)
```

### 1. Conversational Query Rewriting
If previous conversation messages exist, the `QueryRewriter` uses Google Gemini to turn ambiguous questions like *"What is its latency?"* into explicit standalone queries: *"What is the latency target for IntelliRAG?"*.

### 2. Dense Retrieval (Qdrant Vector Cloud)
- Query text is converted to a 768-dimensional float vector using `models/gemini-embedding-001`.
- Searches Qdrant collection `intellirag_chunks` using Cosine distance.
- Applies strict payload filtering: `tenant_id == user.organization_id`.

### 3. Sparse Retrieval (Rank-BM25 Keyword Matching)
- Tokenizes query words and evaluates document term frequencies against Inverse Document Frequency (IDF).
- Captures exact string matches (e.g. `ERR_502`, specific serial numbers or names) that vector embeddings might miss.

### 4. Reciprocal Rank Fusion (RRF)
Merges dense vector results and sparse BM25 results into a single unified rank score using the RRF formula:

$$RRF\_Score(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$

*(where $k = 60$, and $r_m(d)$ is the rank position of document $d$ in result set $m$).*

### 5. Cohere Reranking
Top fused candidate chunks are sent to **Cohere Rerank v3**. Cohere acts as a cross-encoder model that evaluates deep sentence relevance, filtering out noise and keeping only the top 5 most factual context chunks.

---

## 🤖 5. Grounded Generation & Hallucination Mitigation

The retrieved top context chunks are formatted into a strict System Prompt:

```text
You are an enterprise AI knowledge assistant. 
Answer the user's question using ONLY the provided context.
If the context does not contain enough information, say "I couldn't find enough information in the knowledge base to answer this question."
Do not hallucinate. Cite sources for your factual claims.

Context:
{retrieved_context_chunks}
```

This strict prompt boundary ensures the LLM generates answers **strictly derived from the enterprise knowledge base**.

---

## 🎨 6. Frontend Architecture & State Management

- **React 18 + Vite + TypeScript**: Type-safe, modular SPA architecture.
- **TanStack React Query**: Manages server state, automatic caching, background polling (`refetchInterval: 3000ms`), and optimistic query updates.
- **`AuthContext` & Axios Interceptors**: Automatically injects `Authorization: Bearer <token>` on all outbound API calls.
- **Framer Motion & Glassmorphic Design System**: Uses semi-transparent glass cards (`backdrop-blur-xl`), vibrant HSL gradients, and smooth spring animation transitions.

---

## 📊 Summary Table of Key Components

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **API Framework** | FastAPI (Python 3.13) | Asynchronous REST API server |
| **Relational Database** | PostgreSQL (Supabase) + SQLAlchemy | Stores Users, Orgs, Documents & Messages |
| **Vector Engine** | Qdrant Cloud | 768-D Vector Search with Tenant Filters |
| **Embeddings** | Gemini `models/gemini-embedding-001` | Dense text representation |
| **LLM Generation** | Gemini `models/gemini-flash-latest` | Fast, factual answer generation |
| **Keyword Search** | Rank-BM25 | Exact string matching |
| **Reranking** | Cohere Rerank v3 | Relevance re-scoring |
| **Frontend Stack** | React 18 + TypeScript + Vite | Enterprise Glassmorphism Dashboard |

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

To run the automated end-to-end integration test:

```powershell
cd backend
..\venv\Scripts\python.exe test_e2e.py
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
