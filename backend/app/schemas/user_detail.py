from pydantic import BaseModel, Field
from typing import Optional


class UserDetailBase(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None


class UserDetailCreate(UserDetailBase):
    pass


class UserDetailUpdate(UserDetailBase):
    pass


class UserDetail(UserDetailBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True 