from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus
from app.models.vote import Vote
from app.schemas.report import Report as ReportSchema, ReportWithVotes, ReportStatusUpdate
from app.utils.deps import get_current_active_superuser
from app.utils.twilio_service import send_sms
from typing import Any, List, Optional

router = APIRouter()


@router.get("/reports", response_model=List[ReportWithVotes])
async def get_all_reports_admin(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Get all reports with votes (admin only).
    """


@router.patch("/reports/{report_id}/status", response_model=ReportSchema)
async def update_report_status(
    report_id: int,
    status_update: ReportStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Update the status of a report (admin only).
    """


@router.post("/reports/{report_id}/complete", response_model=ReportSchema)
async def complete_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Mark a report as completed (admin only).
    """

