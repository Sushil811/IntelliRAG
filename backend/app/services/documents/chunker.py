from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(text: str, chunk_size: int = 800, chunk_overlap: int = 120) -> list[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_text(text)
    return chunks
