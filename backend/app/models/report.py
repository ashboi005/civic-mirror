from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False, default=ReportStatus.PENDING)
    image_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reports")
    votes = relationship("Vote", back_populates="report", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="report", cascade="all, delete-orphan") 