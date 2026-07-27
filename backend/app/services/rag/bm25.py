from typing import List, Dict, Any, Optional
# pyrefly: ignore [missing-import]
from rank_bm25 import BM25Okapi
import re

class BM25Service:
    def __init__(self):
        # In a real distributed app, you'd store the BM25 index in a DB or Cache
        # For this portfolio project, we will build it on-the-fly or cache it in memory per document/tenant
        self.corpus_cache: Dict[str, BM25Okapi] = {}
        self.chunk_cache: Dict[str, List[Dict[str, Any]]] = {}
        
    def _tokenize(self, text: str) -> List[str]:
        return [word.lower() for word in re.findall(r'\b\w+\b', text)]
        
    def build_index(self, tenant_id: str, document_id: str, chunks: List[Dict[str, Any]]):
        """
        Build a BM25 index for a specific document or tenant.
        chunks = [{"text": "...", "metadata": {...}}, ...]
        """
        cache_key = f"{tenant_id}_{document_id}"
        tokenized_corpus = [self._tokenize(chunk["text"]) for chunk in chunks]
        
        if tokenized_corpus:
            bm25 = BM25Okapi(tokenized_corpus)
            self.corpus_cache[cache_key] = bm25
            self.chunk_cache[cache_key] = chunks
            
    def search(self, query: str, tenant_id: str, document_id: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        # This is simplified. In a real scenario, you'd want to search across all documents of a tenant.
        # Here we assume we know the document or we just build a global tenant index.
        cache_key = f"{tenant_id}_{document_id}"
        
        if cache_key not in self.corpus_cache:
            return []
            
        bm25 = self.corpus_cache[cache_key]
        chunks = self.chunk_cache[cache_key]
        
        tokenized_query = self._tokenize(query)
        doc_scores = bm25.get_scores(tokenized_query)
        
        # Get top K
        top_indices = sorted(range(len(doc_scores)), key=lambda i: doc_scores[i], reverse=True)[:top_k]
        
        results = []
        for i in top_indices:
            if doc_scores[i] > 0:
                res = chunks[i].copy()
                res["score"] = doc_scores[i]
                results.append(res)
                
        return results
