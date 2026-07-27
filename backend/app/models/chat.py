from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.models.base import Base

class Conversation(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False)
    title = Column(String(255), nullable=True)
    
    # E.g., if a conversation is restricted to a specific document
    document_id = Column(UUID(as_uuid=True), ForeignKey("document.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversation.id"), nullable=False, index=True)
    
    role = Column(String(50), nullable=False) # "user" or "assistant"
    content = Column(String, nullable=False)
    
    # Store retrieved context, citations, tokens used, etc.
    metadata_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    conversation = relationship("Conversation", back_populates="messages")
    feedback = relationship("Feedback", back_populates="message", uselist=False, cascade="all, delete-orphan")

class Feedback(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("message.id"), nullable=False, unique=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    
    is_positive = Column(Boolean, nullable=False)
    category = Column(String(100), nullable=True) # Incorrect Answer, Wrong Source, etc.
    comments = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    message = relationship("Message", back_populates="feedback")
