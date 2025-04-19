from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.user import VALID_ROLES


class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    role: Optional[str] = None  # Only relevant if is_superuser is True

    @validator('role')
    def validate_role(cls, v, values):
        # Only validate if role is provided
        if v is not None:
            # Role is only meaningful for superusers
            if not values.get('is_superuser', False):
                return None
                
            # Check if the role is valid
            if v not in VALID_ROLES:
                raise ValueError(f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    role: Optional[str] = None
    
    @validator('role')
    def validate_role(cls, v, values):
        # Only validate if role is provided
        if v is not None:
            # If is_superuser is explicitly set to False, role should be None
            if 'is_superuser' in values and values['is_superuser'] is False:
                return None
                
            # Check if the role is valid
            if v not in VALID_ROLES:
                raise ValueError(f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
        return v


class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str 