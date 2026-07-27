import asyncio
from app.db.session import AsyncSessionLocal, engine
from app.models.base import Base
from app.models.user import User, Organization
from app.models.document import Document
from app.models.chat import Conversation, Message
from sqlalchemy import text

async def check():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("All tables created / verified successfully!")
        
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = result.scalars().all()
        print("Existing tables in DB:", tables)

if __name__ == "__main__":
    asyncio.run(check())
