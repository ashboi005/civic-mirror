from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VoteBase(BaseModel):
    report_id: int


class VoteCreate(VoteBase):
    pass


class Vote(VoteBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True 