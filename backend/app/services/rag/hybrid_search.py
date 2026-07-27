from typing import List, Dict, Any

def reciprocal_rank_fusion(vector_results: List[Dict[str, Any]], bm25_results: List[Dict[str, Any]], k: int = 60, top_n: int = 5) -> List[Dict[str, Any]]:
    """
    Combines results from Vector Search and BM25 using Reciprocal Rank Fusion (RRF).
    RRF Score = 1 / (k + rank)
    """
    fused_scores: Dict[str, float] = {}
    chunk_map: Dict[str, Dict[str, Any]] = {}
    
    # Process vector results
    for rank, doc in enumerate(vector_results):
        chunk_id = str(doc.get("chunk_id") or doc.get("id"))
        if chunk_id not in chunk_map:
            chunk_map[chunk_id] = doc
            fused_scores[chunk_id] = 0.0
        fused_scores[chunk_id] += 1 / (k + rank + 1)
        
    # Process bm25 results
    for rank, doc in enumerate(bm25_results):
        chunk_id = str(doc.get("chunk_id") or doc.get("id"))
        if chunk_id not in chunk_map:
            chunk_map[chunk_id] = doc
            fused_scores[chunk_id] = 0.0
        fused_scores[chunk_id] += 1 / (k + rank + 1)
        
    # Sort by fused score
    sorted_chunks = sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    
    results = []
    for chunk_id, score in sorted_chunks[:top_n]:
        doc = chunk_map[chunk_id].copy()
        doc["rrf_score"] = score
        results.append(doc)
        
    return results
