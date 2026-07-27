# pyrefly: ignore [missing-import]
from langchain_core.prompts import PromptTemplate
# pyrefly: ignore [missing-import]
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

class QueryRewriter:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY or "dummy_key",
            temperature=0
        )
        self.prompt = PromptTemplate(
            input_variables=["chat_history", "query"],
            template="""You are an AI assistant helping to rewrite a user query for a semantic search engine.
Given the chat history and the latest user query, rewrite the query so that it is a standalone query that can be understood without the chat history.
If the query is already standalone, return it as is. Do not answer the question.

Chat History:
{chat_history}

User Query: {query}
Standalone Query:"""
        )
        
    def rewrite(self, query: str, chat_history: str = "") -> str:
        if not chat_history:
            return query
            
        try:
            chain = self.prompt | self.llm
            result = chain.invoke({
                "chat_history": chat_history,
                "query": query
            })
            
            content = result.content
            if isinstance(content, list):
                content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
            elif not isinstance(content, str):
                content = str(content)
                
            return content.strip()
        except Exception as e:
            print(f"Query rewriter exception (using raw query): {e}")
            return query
