from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict, Any

def chunk_text(text: str, chunk_size: int = 800, chunk_overlap: int = 120) -> list[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_text(text)
    return chunks

def chunk_pages(pages: List[Dict[str, Any]], chunk_size: int = 800, chunk_overlap: int = 120) -> List[Dict[str, Any]]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    all_chunks = []
    for page in pages:
        page_num = page.get("page_number", 1)
        text_content = page.get("text", "")
        if not text_content.strip():
            continue
        sub_chunks = text_splitter.split_text(text_content)
        for sub in sub_chunks:
            all_chunks.append({
                "page_number": page_num,
                "text": sub
            })
    return all_chunks

