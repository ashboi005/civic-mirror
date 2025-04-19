from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CommentBase(BaseModel):
    text: str


class CommentCreate(CommentBase):
    report_id: int


class Comment(CommentBase):
    id: int
    user_id: int
    report_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CommentWithUser(Comment):
    username: str  # This is the username of the user who created the comment 