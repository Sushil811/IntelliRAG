from fastapi import APIRouter
from app.api.routes import auth, documents, chat

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
# We will include chat, search, etc. here later
