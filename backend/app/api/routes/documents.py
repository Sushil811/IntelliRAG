from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.services.documents.ingestion import DocumentIngestionService
from app.services.rag.qdrant_service import QdrantService
from app.services.embeddings.gemini import GeminiEmbeddingProvider

router = APIRouter()

# In a real app, you might inject these via dependency injection
qdrant_service = QdrantService()
embedding_provider = GeminiEmbeddingProvider()
ingestion_service = DocumentIngestionService(qdrant_service, embedding_provider)

import asyncio
from app.db.session import AsyncSessionLocal

async def update_doc_status(document_id: str, status: DocumentStatus):
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Document).where(Document.id == uuid.UUID(document_id))
            )
            doc = result.scalars().first()
            if doc:
                doc.status = status
                await session.commit()
    except Exception as e:
        print(f"Error updating doc status in DB: {e}")

def process_document_task(file_content: bytes, file_type: str, document_id: str, tenant_id: str):
    try:
        ingestion_service.process_document(file_content, file_type, document_id, tenant_id)
        asyncio.run(update_doc_status(document_id, DocumentStatus.READY))
    except Exception as e:
        print(f"Error processing document {document_id}: {e}")
        asyncio.run(update_doc_status(document_id, DocumentStatus.FAILED))


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "txt", "md", "csv"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
        
    content = await file.read()
    
    # Create DB Record
    doc = Document(
        organization_id=current_user.organization_id,
        uploaded_by=current_user.id,
        name=file.filename,
        file_type=ext,
        status=DocumentStatus.PROCESSING
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    
    # Send to background task for parsing and embedding
    background_tasks.add_task(
        process_document_task,
        content,
        ext,
        str(doc.id),
        str(current_user.organization_id)
    )
    
    return {"message": "Document uploaded successfully", "document_id": doc.id}

@router.get("/")
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.organization_id == current_user.organization_id)
    )
    docs = result.scalars().all()
    return docs

@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.organization_id == current_user.organization_id
        )
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Delete from Qdrant
    qdrant_service.delete_document_chunks(str(current_user.organization_id), str(doc.id))
    
    # Delete from DB
    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully"}
