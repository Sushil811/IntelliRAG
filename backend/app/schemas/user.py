from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import datetime
from app.models.user import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: RoleEnum = RoleEnum.MEMBER

class UserCreate(UserBase):
    password: str
    organization_name: str # The user registering will create an org initially or join one

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: UUID4
    organization_id: UUID4
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
