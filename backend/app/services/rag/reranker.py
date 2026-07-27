import os
from typing import List, Dict, Any
from app.core.config import settings

class RerankerProvider:
    def __init__(self):
        self.api_key = settings.COHERE_API_KEY
        if self.api_key:
            import cohere
            self.cohere_client = cohere.Client(self.api_key)
        else:
            self.cohere_client = None
            
    def rerank(self, query: str, documents: List[Dict[str, Any]], top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Rerank using Cohere Rerank API.
        If no API key is provided, returns the top_n documents as-is (fallback).
        """
        if not documents:
            return []
            
        if not self.cohere_client:
            # Fallback to no-op reranking (trust RRF)
            return documents[:top_n]
            
        texts = [doc["text"] for doc in documents]
        
        # Call Cohere
        response = self.cohere_client.rerank(
            query=query,
            documents=texts,
            top_n=top_n,
            model="rerank-english-v3.0"
        )
        
        reranked = []
        for result in response.results:
            idx = result.index
            doc = documents[idx].copy()
            doc["rerank_score"] = result.relevance_score
            reranked.append(doc)
            
        return reranked
