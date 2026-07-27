from typing import Dict, Any, List, Optional, Tuple
import uuid

from app.services.documents.loaders import extract_pages
from app.services.documents.chunker import chunk_pages
from app.services.embeddings.base import EmbeddingProvider
from app.services.rag.qdrant_service import QdrantService
from app.models.document import DocumentStatus

class DocumentIngestionService:
    def __init__(self, qdrant_service: QdrantService, embedding_provider: EmbeddingProvider):
        self.qdrant = qdrant_service
        self.embedding_provider = embedding_provider
        
    def process_document(
        self, 
        file_content: bytes, 
        file_type: str, 
        document_id: str, 
        tenant_id: str,
        document_name: str = "document.pdf"
    ) -> Tuple[List[str], List[Dict[str, Any]]]:
        """
        Main pipeline: Extract Pages -> Chunk Pages -> Embed -> Qdrant
        """
        # 1. Extract Pages
        pages = extract_pages(file_content, file_type)
        if not pages:
            raise ValueError("No text could be extracted from the document.")
            
        # 2. Chunk Pages
        chunk_objs = chunk_pages(pages)
        if not chunk_objs:
            raise ValueError("Document yielded no text chunks.")
            
        chunks = [c["text"] for c in chunk_objs]
            
        # 3. Generate Embeddings (could be batched)
        embeddings = self.embedding_provider.get_embeddings(chunks)
        
        # 4. Prepare Metadata
        metadatas = []
        for i, c_obj in enumerate(chunk_objs):
            chunk_id = str(uuid.uuid4())
            text = c_obj["text"]
            page_num = c_obj.get("page_number", 1)
            meta = {
                "chunk_id": chunk_id,
                "document_id": document_id,
                "document_name": document_name,
                "tenant_id": tenant_id,
                "page_number": page_num,
                "chunk_index": i,
                "chunk_text": text,
                "text": text,
                "source": document_name
            }
            metadatas.append(meta)
            
        # 5. Store in Qdrant
        self.qdrant.insert_chunks(chunks, embeddings, metadatas)
        
        return chunks, metadatas

