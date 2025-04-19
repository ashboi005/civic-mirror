from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.report import ReportType, ReportStatus
from enum import Enum


class ReportBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str = ReportType.MISCELLANEOUS
    location: Optional[str] = None


class ReportCreate(ReportBase):
    base64_image: Optional[str] = None
    image_type: Optional[str] = None


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None


class ReportStatusUpdate(BaseModel):
    status: str


class ReportComplete(BaseModel):
    pass


class Report(ReportBase):
    id: int
    user_id: int
    status: str
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    vote_count: int = 0  # Will be calculated in the API

    class Config:
        from_attributes = True


class ReportWithVotes(Report):
    votes: List[int] = []  # List of user IDs who voted

    class Config:
        from_attributes = True 


class ReportStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"  # Renamed from ACCEPTED
    COMPLETED = "completed" # Changed from "COMPLETED"

class ReportStatusUpdate(BaseModel):
    status: ReportStatus