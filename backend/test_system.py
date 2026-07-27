import asyncio
import pytest
from app.services.rag.qdrant_service import QdrantService
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

@pytest.mark.asyncio
async def test_all():
    print("Testing Supabase PostgreSQL Connection...")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            print("PostgreSQL connection successful! Result:", result.scalar())
    except Exception as e:
        print("PostgreSQL Connection Failed:", e)

    print("\nTesting Qdrant Cloud Connection...")
    try:
        qdrant = QdrantService()
        collections = qdrant.client.get_collections()
        print("Qdrant connection successful! Collections:", collections)
    except Exception as e:
        print("Qdrant Connection Failed:", e)

if __name__ == "__main__":
    asyncio.run(test_all())
