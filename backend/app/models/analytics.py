from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from app.models.base import Base

class AIRequestLog(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    
    endpoint = Column(String(255), nullable=False)
    model = Column(String(255), nullable=False)
    
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    
    estimated_cost = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class EvaluationResult(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False, index=True)
    message_id = Column(UUID(as_uuid=True), ForeignKey("message.id"), nullable=False)
    
    faithfulness = Column(Float, nullable=True)
    answer_relevance = Column(Float, nullable=True)
    context_relevance = Column(Float, nullable=True)
    citation_accuracy = Column(Float, nullable=True)
    retrieval_precision = Column(Float, nullable=True)
    retrieval_recall = Column(Float, nullable=True)
    
    overall_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    
    action = Column(String(255), nullable=False) # e.g. "DOCUMENT_UPLOAD", "USER_CREATED"
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
