import asyncio
import httpx
import uuid

BASE_URL = "http://localhost:8000/api"

async def test_e2e_flow():
    # 1. Start test using AsyncClient on FastAPI app directly or running server
    from app.main import app
    from httpx import ASGITransport

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL) as client:
        print("--- 1. Testing Health Endpoint ---")
        res = await client.get("/health")
        print("Health status:", res.status_code, res.json())

        test_email = f"test_user_{uuid.uuid4().hex[:6]}@example.com"
        test_password = "Password123!"

        print("\n--- 2. Registering User ---")
        reg_data = {
            "email": test_email,
            "password": test_password,
            "full_name": "Test Engineer",
            "organization_name": "Antigravity AI"
        }
        res = await client.post("/auth/register", json=reg_data)
        print("Register status:", res.status_code, res.json())

        print("\n--- 3. Logging in User ---")
        login_data = {
            "username": test_email,
            "password": test_password
        }
        res = await client.post("/auth/login", data=login_data)
        print("Login status:", res.status_code)
        token_data = res.json()
        access_token = token_data.get("access_token")
        print("Access Token acquired:", bool(access_token))

        headers = {"Authorization": f"Bearer {access_token}"}

        print("\n--- 4. Checking Current User (/auth/me) ---")
        res = await client.get("/auth/me", headers=headers)
        print("Current user:", res.json())

        print("\n--- 5. Uploading Test Knowledge Document ---")
        doc_content = b"""
IntelliRAG Security and Infrastructure Policy 2026

1. Authentication & Authorization:
All enterprise data access requires JWT Bearer token authentication signed with HS256 algorithm.
Organization data is strictly isolated using multi-tenant tenant_id isolation in Qdrant vector database.

2. Retrieval Augmented Generation (RAG):
The hybrid retrieval pipeline combines Gemini vector embeddings with BM25 keyword matching and Cohere reranking.
Maximum context latency threshold is targetted under 1000 milliseconds.

3. Deployment Target:
Backend is deployed on Render Docker containers and frontend on Vercel Edge CDN.
"""
        files = {"file": ("security_policy.txt", doc_content, "text/plain")}
        res = await client.post("/documents/upload", headers=headers, files=files)
        print("Upload status:", res.status_code, res.json())
        doc_id = res.json().get("document_id")

        print("\n--- 6. Waiting for Background Document Ingestion ---")
        for i in range(10):
            await asyncio.sleep(1)
            res = await client.get("/documents/", headers=headers)
            docs = res.json()
            matching = [d for d in docs if str(d.get("id")) == str(doc_id)]
            if matching:
                status = matching[0].get("status")
                print(f"Check {i+1}: Document status = {status}")
                if status in ["ready", "READY", "failed", "FAILED"]:
                    break

        print("\n--- 7. Querying Chat RAG Copilot ---")
        chat_req = {
            "query": "What is the authentication requirement and latency target for IntelliRAG?"
        }
        res = await client.post("/chat/", headers=headers, json=chat_req)
        print("Chat response status:", res.status_code)
        chat_res = res.json()
        print("\nAnswer:\n", chat_res.get("answer"))
        print("\nSources:\n", chat_res.get("sources"))
        print("\nRetrieval Metadata:\n", chat_res.get("retrieval"))

if __name__ == "__main__":
    asyncio.run(test_e2e_flow())
