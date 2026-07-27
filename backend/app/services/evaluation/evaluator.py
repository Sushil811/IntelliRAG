from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
import json
from app.core.config import settings

class EvaluationScore(BaseModel):
    faithfulness: float = Field(..., description="Score from 0.0 to 1.0 indicating if the answer is faithful to the context")
    answer_relevance: float = Field(..., description="Score from 0.0 to 1.0 indicating if the answer addresses the question")
    context_relevance: float = Field(..., description="Score from 0.0 to 1.0 indicating if the retrieved context was relevant")
    overall_score: float = Field(..., description="Overall score combining the metrics")

class LLMJudgeEvaluator:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY or "dummy_key",
            temperature=0
        )
        self.prompt = PromptTemplate(
            input_variables=["question", "context", "answer"],
            template="""You are an impartial AI judge evaluating a RAG pipeline's answer.
Given the question, retrieved context, and the generated answer, evaluate the following metrics on a scale of 0.0 to 1.0:
1. Faithfulness: Is the answer entirely supported by the context without hallucination?
2. Answer Relevance: Does the answer directly address the user's question?
3. Context Relevance: Is the retrieved context actually useful for answering the question?
4. Overall Score: Your final weighted score for the quality of the generation.

Provide your output ONLY as a valid JSON object matching this schema:
{{
    "faithfulness": 0.0,
    "answer_relevance": 0.0,
    "context_relevance": 0.0,
    "overall_score": 0.0
}}

Question: {question}

Context: {context}

Answer: {answer}
"""
        )
        
    def evaluate(self, question: str, context: str, answer: str) -> EvaluationScore:
        chain = self.prompt | self.llm
        result = chain.invoke({
            "question": question,
            "context": context,
            "answer": answer
        })
        try:
            # Clean up the markdown block if it exists
            content = result.content.strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            data = json.loads(content)
            return EvaluationScore(**data)
        except Exception as e:
            print(f"Evaluation parsing failed: {e}")
            return EvaluationScore(faithfulness=0.0, answer_relevance=0.0, context_relevance=0.0, overall_score=0.0)
