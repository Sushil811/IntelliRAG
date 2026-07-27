from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone
from app.models.base import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    MEMBER = "MEMBER"

class Organization(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.MEMBER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    organization = relationship("Organization", back_populates="users")
    conversations = relationship("Conversation", back_populates="user")
    
