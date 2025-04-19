from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from app.db.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus
from app.models.vote import Vote
from app.models.user_detail import UserDetail
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
    # Build base query
    query = select(Report)
    
    # Apply status filter if provided
    if status:
        query = query.where(Report.status == status)
    
    # Add pagination and ordering
    query = query.offset(skip).limit(limit).order_by(desc(Report.created_at))
    
    # Execute query
    result = await db.execute(query)
    reports = result.scalars().all()
    
    # Process each report to add vote information
    report_list = []
    for report in reports:
        # Get vote count
        vote_count_result = await db.execute(
            select(func.count(Vote.id)).where(Vote.report_id == report.id)
        )
        vote_count = vote_count_result.scalar()
        
        # Get user IDs who voted
        vote_users_result = await db.execute(
            select(Vote.user_id).where(Vote.report_id == report.id)
        )
        vote_users = vote_users_result.scalars().all()
        
        # Create report dictionary with additional fields
        report_dict = {
            "id": report.id,
            "user_id": report.user_id,
            "title": report.title,
            "description": report.description,
            "type": report.type,
            "status": report.status,
            "location": report.location,
            "image_url": report.image_url,
            "created_at": report.created_at,
            "updated_at": report.updated_at,
            "vote_count": vote_count,
            "votes": list(vote_users)
        }
        report_list.append(report_dict)
    
    return report_list

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
    # Get the report
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update status
    report.status = status_update.status
    await db.commit()
    await db.refresh(report)
    
    return report

@router.post("/reports/{report_id}/complete", response_model=ReportSchema)
async def complete_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Mark a report as completed (admin only).
    """
    # Get the report
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update status to completed
    report.status = ReportStatus.COMPLETED
    await db.commit()
    await db.refresh(report)
    
    # Get user details for notification
    user_detail_result = await db.execute(
        select(UserDetail).where(UserDetail.user_id == report.user_id))
    user_detail = user_detail_result.scalar_one_or_none()
    
    # Send SMS notification if phone number exists
    if user_detail and user_detail.phone_number:
        await send_sms(
            to_number=user_detail.phone_number,
            message=f"Your report #{report.id} has been marked as completed. Thank you!"
        )
    
    return report