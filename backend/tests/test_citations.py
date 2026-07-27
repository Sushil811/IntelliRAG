import pytest
import io
import uuid
from unittest.mock import MagicMock

import pypdf
from app.services.documents.loaders import extract_pages, extract_pages_from_pdf
from app.services.documents.chunker import chunk_pages
from app.services.documents.ingestion import DocumentIngestionService
from app.services.rag.hybrid_search import reciprocal_rank_fusion
from app.services.rag.reranker import RerankerProvider
from app.services.rag.pipeline import RAGPipeline

def create_sample_pdf_bytes() -> bytes:
    writer = pypdf.PdfWriter()
    page1 = writer.add_blank_page(width=200, height=200)
    page2 = writer.add_blank_page(width=200, height=200)
    
    # We can write simple PDF text streams or use pypdf builtins
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()

def test_extract_pages_txt():
    content = b"Full-time employees receive 20 paid vacation days per calendar year."
    pages = extract_pages(content, "txt")
    assert len(pages) == 1
    assert pages[0]["page_number"] == 1
    assert "vacation days" in pages[0]["text"]

def test_chunk_pages_preserves_page_numbers():
    pages = [
        {"page_number": 1, "text": "Page one text content about policy."},
        {"page_number": 5, "text": "Page five text content about vacation days."}
    ]
    chunks = chunk_pages(pages, chunk_size=50, chunk_overlap=10)
    assert len(chunks) >= 2
    p1_chunks = [c for c in chunks if c["page_number"] == 1]
    p5_chunks = [c for c in chunks if c["page_number"] == 5]
    assert len(p1_chunks) >= 1
    assert len(p5_chunks) >= 1
    assert "vacation" in p5_chunks[0]["text"]

def test_ingestion_qdrant_payload_metadata():
    mock_qdrant = MagicMock()
    mock_embeddings = MagicMock()
    mock_embeddings.get_embeddings.return_value = [[0.1, 0.2, 0.3]]
    
    ingestion = DocumentIngestionService(mock_qdrant, mock_embeddings)
    content = b"Full-time employees receive 20 paid vacation days per calendar year."
    doc_id = str(uuid.uuid4())
    tenant_id = str(uuid.uuid4())
    doc_name = "IntelliRAG_Employee_Handbook.pdf"
    
    chunks, metadatas = ingestion.process_document(
        file_content=content,
        file_type="txt",
        document_id=doc_id,
        tenant_id=tenant_id,
        document_name=doc_name
    )
    
    assert len(metadatas) == 1
    meta = metadatas[0]
    assert meta["document_name"] == doc_name
    assert meta["document_id"] == doc_id
    assert meta["page_number"] == 1
    assert "chunk_id" in meta
    assert meta["chunk_text"] == content.decode()
    assert meta["text"] == content.decode()
    
    # Verify qdrant insert call received correct metadata
    mock_qdrant.insert_chunks.assert_called_once()
    args, kwargs = mock_qdrant.insert_chunks.call_args
    passed_chunks, passed_embs, passed_metas = args
    assert passed_metas[0]["document_name"] == doc_name
    assert passed_metas[0]["page_number"] == 1

def test_retrieval_and_rrf_preserves_metadata():
    vector_results = [
        {
            "chunk_id": "chunk_1",
            "document_id": "doc_1",
            "document_name": "IntelliRAG_Employee_Handbook.pdf",
            "page_number": 5,
            "text": "Full-time employees receive 20 paid vacation days."
        }
    ]
    bm25_results = [
        {
            "chunk_id": "chunk_1",
            "document_id": "doc_1",
            "document_name": "IntelliRAG_Employee_Handbook.pdf",
            "page_number": 5,
            "text": "Full-time employees receive 20 paid vacation days."
        }
    ]
    
    fused = reciprocal_rank_fusion(vector_results, bm25_results)
    assert len(fused) == 1
    assert fused[0]["document_name"] == "IntelliRAG_Employee_Handbook.pdf"
    assert fused[0]["page_number"] == 5
    
    reranker = RerankerProvider()
    reranked = reranker.rerank("vacation days", fused)
    assert len(reranked) == 1
    assert reranked[0]["document_name"] == "IntelliRAG_Employee_Handbook.pdf"
    assert reranked[0]["page_number"] == 5

def test_rag_pipeline_context_and_sources_format():
    mock_rewriter = MagicMock()
    mock_rewriter.rewrite.return_value = "vacation days"
    mock_bm25 = MagicMock()
    mock_bm25.search.return_value = []
    mock_reranker = MagicMock()
    
    mock_qdrant = MagicMock()
    mock_qdrant.search_chunks.return_value = [
        {
            "chunk_id": "c123",
            "document_id": "d456",
            "document_name": "IntelliRAG_Employee_Handbook.pdf",
            "page_number": 5,
            "text": "Full-time employees receive 20 paid vacation days per calendar year."
        }
    ]
    mock_embedding = MagicMock()
    mock_embedding.get_embedding.return_value = [0.1, 0.2]
    mock_reranker.rerank.side_effect = lambda q, docs, top_n=5: docs[:top_n]
    
    pipeline = RAGPipeline(
        query_rewriter=mock_rewriter,
        bm25_service=mock_bm25,
        reranker=mock_reranker,
        qdrant_service=mock_qdrant,
        embedding_provider=mock_embedding
    )
    
    # Mock LLM invoke
    mock_llm_response = MagicMock()
    mock_llm_response.content = "Full-time employees receive 20 paid vacation days per calendar year. [Source: IntelliRAG_Employee_Handbook.pdf, Page 5]"
    mock_llm_response.usage_metadata = {"input_tokens": 50, "output_tokens": 20}
    pipeline.llm = MagicMock()
    pipeline.llm.invoke.return_value = mock_llm_response
    
    res = pipeline.process_query("vacation days", tenant_id="tenant_1")
    
    # Verify no Unknown or Page N/A in context source headers
    llm_args, _ = pipeline.llm.invoke.call_args
    system_msg_content = llm_args[0][0].content
    assert "[Source: Unknown" not in system_msg_content
    assert "Page N/A" not in system_msg_content.split("Context:")[1]
    assert "[Source: IntelliRAG_Employee_Handbook.pdf, Page 5]" in system_msg_content
    
    # Verify response payload sources
    sources = res["sources"]
    assert len(sources) == 1
    assert sources[0]["document_name"] == "IntelliRAG_Employee_Handbook.pdf"
    assert sources[0]["page_number"] == 5
    assert sources[0]["page"] == 5


