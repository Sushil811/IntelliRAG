from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from pydantic import BaseModel
import uuid
import json

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat import Conversation, Message
from app.services.rag.pipeline import RAGPipeline
from app.services.rag.query_rewriter import QueryRewriter
from app.services.rag.bm25 import BM25Service
from app.services.rag.reranker import RerankerProvider

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[uuid.UUID] = None
    document_id: Optional[uuid.UUID] = None
    stream: bool = False

# Dependencies (Normally injected)
query_rewriter = QueryRewriter()
bm25_service = BM25Service()
reranker = RerankerProvider()
rag_pipeline = RAGPipeline(query_rewriter, bm25_service, reranker)

@router.post("/")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve or create conversation
    if request.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == current_user.id
            )
        )
        conversation = result.scalars().first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            document_id=request.document_id
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    # Fetch history
    msg_result = await db.execute(
        select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at.asc())
    )
    history_messages = msg_result.scalars().all()
    chat_history = "\n".join([f"{m.role}: {m.content}" for m in history_messages[-5:]]) # limit context

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.query
    )
    db.add(user_msg)
    await db.commit()

    if request.stream:
        # For simplicity, returning regular response here, but you'd use SSE (Server-Sent Events)
        # using a generator yielding chunks of tokens
        pass

    # Process via RAG Pipeline
    rag_response = rag_pipeline.process_query(
        query=request.query,
        tenant_id=str(current_user.organization_id),
        chat_history=chat_history,
        document_id=str(request.document_id) if request.document_id else None
    )

    # Save AI message
    ai_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=rag_response["answer"],
        metadata_json=rag_response
    )
    db.add(ai_msg)
    
    # Optionally update conversation title if it's the first message
    if not conversation.title:
        conversation.title = request.query[:50]
        
    await db.commit()

    return {
        "conversation_id": conversation.id,
        "answer": rag_response["answer"],
        "sources": rag_response["sources"],
        "retrieval": rag_response["retrieval"],
        "usage": rag_response["usage"]
    }
