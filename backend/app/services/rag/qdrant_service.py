# pyrefly: ignore [missing-import]
from qdrant_client import QdrantClient
# pyrefly: ignore [missing-import]
from qdrant_client.http import models
from typing import List, Dict, Any, Optional
from app.core.config import settings

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY
        )
        self.collection_name = "intellirag_chunks"
        
    def init_collection(self, vector_size: int):
        collections = self.client.get_collections()
        exists = any(c.name == self.collection_name for c in collections.collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size, 
                    distance=models.Distance.COSINE
                ),
            )
            
            # Create payload indexes for filtering
            self.client.create_payload_index(
                collection_name=self.collection_name,
                field_name="tenant_id",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            self.client.create_payload_index(
                collection_name=self.collection_name,
                field_name="document_id",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )

    def insert_chunks(self, chunks: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]]):
        if embeddings and len(embeddings) > 0:
            self.init_collection(len(embeddings[0]))

        points = []
        for i, (chunk, emb, meta) in enumerate(zip(chunks, embeddings, metadatas)):
            point_id = str(meta.get("chunk_id")) 
            payload = {
                "text": chunk,
                **meta
            }
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=emb,
                    payload=payload
                )
            )
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        
    def search_chunks(self, query_vector: List[float], tenant_id: str, document_id: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        must_filters = [
            models.FieldCondition(
                key="tenant_id",
                match=models.MatchValue(value=str(tenant_id))
            )
        ]
        if document_id:
            must_filters.append(
                models.FieldCondition(
                    key="document_id",
                    match=models.MatchValue(value=str(document_id))
                )
            )
        
        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=models.Filter(must=must_filters),
                limit=top_k
            )
            retrieved = []
            for res in results:
                payload = res.payload or {}
                payload["score"] = res.score
                retrieved.append(payload)
            return retrieved
        except Exception as e:
            print(f"Error searching Qdrant: {e}")
            return []

    def delete_document_chunks(self, tenant_id: str, document_id: str):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="tenant_id",
                            match=models.MatchValue(value=tenant_id)
                        ),
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id)
                        )
                    ]
                )
            )
        )

