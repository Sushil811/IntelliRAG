import asyncio
import httpx
from app.main import app
from httpx import ASGITransport

async def test_chat():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://localhost:8000/api") as client:
        # Test without auth token
        res_no_auth = await client.post("/chat/", json={"query": "hi"})
        print("Without token status:", res_no_auth.status_code, res_no_auth.json())

        # Test with auth token
        reg_res = await client.post("/auth/register", json={
            "email": "chat_tester@example.com",
            "password": "Password123!",
            "full_name": "Tester",
            "organization_name": "Org"
        })
        login_res = await client.post("/auth/login", data={"username": "chat_tester@example.com", "password": "Password123!"})
        token = login_res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        res_auth = await client.post("/chat/", headers=headers, json={"query": "hi"})
        print("With token status:", res_auth.status_code)
        if res_auth.status_code == 200:
            print("Response:", res_auth.json().get("answer"))
        else:
            print("Error response:", res_auth.json())

if __name__ == "__main__":
    asyncio.run(test_chat())
