from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone
from app.models.base import Base

class DocumentStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    CHUNKING = "CHUNKING"
    EMBEDDING = "EMBEDDING"
    INDEXING = "INDEXING"
    READY = "READY"
    FAILED = "FAILED"

class Document(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False, index=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    
    name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # pdf, docx, txt, md, csv
    department = Column(String(255), nullable=True)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    organization = relationship("Organization", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("document.id"), nullable=False, index=True)
    
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    section = Column(String(255), nullable=True)
    
    # Store minimal text context here, full vectors in Qdrant
    text_content = Column(String, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    
    document = relationship("Document", back_populates="chunks")
