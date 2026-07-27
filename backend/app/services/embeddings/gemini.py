from typing import List
# pyrefly: ignore [missing-import]
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.services.embeddings.base import EmbeddingProvider
from app.core.config import settings

class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        # We assume GEMINI_API_KEY is set in environment or settings
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=settings.GEMINI_API_KEY or "dummy_key_to_allow_app_startup"
        )
        self._dimension = 768 # models/embedding-001 dimension
        
    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        return self.embeddings.embed_documents(texts)
        
    def get_embedding(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)
        
    @property
    def dimension(self) -> int:
        return self._dimension
