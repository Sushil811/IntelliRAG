from typing import Dict, Any, List
import uuid

from app.services.documents.loaders import extract_text
from app.services.documents.chunker import chunk_text
from app.services.embeddings.base import EmbeddingProvider
from app.services.rag.qdrant_service import QdrantService
from app.models.document import DocumentStatus

class DocumentIngestionService:
    def __init__(self, qdrant_service: QdrantService, embedding_provider: EmbeddingProvider):
        self.qdrant = qdrant_service
        self.embedding_provider = embedding_provider
        
    def process_document(self, file_content: bytes, file_type: str, document_id: str, tenant_id: str) -> None:
        """
        Main pipeline: Extract Text -> Chunk -> Embed -> Qdrant
        Note: Status updates to DB should be handled outside this or via callbacks.
        """
        # 1. Extract Text
        text = extract_text(file_content, file_type)
        if not text.strip():
            raise ValueError("No text could be extracted from the document.")
            
        # 2. Chunk
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("Document yielded no text chunks.")
            
        # 3. Generate Embeddings (could be batched)
        embeddings = self.embedding_provider.get_embeddings(chunks)
        
        # 4. Prepare Metadata
        metadatas = []
        for i, chunk in enumerate(chunks):
            metadatas.append({
                "chunk_id": str(uuid.uuid4()),
                "document_id": document_id,
                "tenant_id": tenant_id,
                "chunk_index": i,
                "source": "document"
            })
            
        # 5. Store in Qdrant
        self.qdrant.insert_chunks(chunks, embeddings, metadatas)
        
        # In a real async environment, returning the chunks and metadata 
        # so the caller can save them to Postgres (DocumentChunk) is necessary.
        return chunks, metadatas
