from typing import Optional, Dict, Any, List
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.services.embeddings.base import EmbeddingProvider

class SemanticCache:
    def __init__(self, qdrant_client: QdrantClient, embedding_provider: EmbeddingProvider, similarity_threshold: float = 0.92):
        self.client = qdrant_client
        self.embedding_provider = embedding_provider
        self.collection_name = "intellirag_cache"
        self.threshold = similarity_threshold
        
    def init_cache(self):
        collections = self.client.get_collections()
        exists = any(c.name == self.collection_name for c in collections.collections)
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.embedding_provider.dimension, 
                    distance=models.Distance.COSINE
                )
            )

    def get_cached_response(self, query: str, tenant_id: str) -> Optional[Dict[str, Any]]:
        query_vector = self.embedding_provider.get_embedding(query)
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="tenant_id",
                        match=models.MatchValue(value=tenant_id)
                    )
                ]
            ),
            limit=1
        )
        if results and results[0].score >= self.threshold:
            return results[0].payload
        return None

    def set_cached_response(self, query: str, response_payload: Dict[str, Any], tenant_id: str):
        query_vector = self.embedding_provider.get_embedding(query)
        import uuid
        point_id = str(uuid.uuid4())
        payload = {
            "query": query,
            "tenant_id": tenant_id,
            "response": response_payload
        }
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=point_id,
                    vector=query_vector,
                    payload=payload
                )
            ]
        )
