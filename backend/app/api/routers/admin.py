from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from app.db.database import get_db
from app.models.user import User, VALID_ROLES
from app.models.report import Report, ReportStatus
from app.schemas.report import ReportStatus
from app.models.vote import Vote
from app.models.user_detail import UserDetail
from app.schemas.report import Report as ReportSchema, ReportWithVotes, ReportStatusUpdate
from app.schemas.user import User as UserSchema
from app.utils.deps import get_current_active_superuser
from app.utils.twilio_service import send_sms
from typing import Any, List, Optional
from enum import Enum
from pydantic import BaseModel


router = APIRouter()


# Add a schema for updating user roles
class UserRoleUpdate(BaseModel):
    role: str


@router.patch("/users/{user_id}/role", response_model=UserSchema)
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Update a user's role (admin only).
    Role can only be set for superusers and must be one of the valid roles.
    """
    # Get the user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate that the user is a superuser
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role can only be set for superusers"
        )
    
    # Validate the role
    if role_update.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"
        )
    
    # Update the user's role
    user.role = role_update.role
    await db.commit()
    await db.refresh(user)
    
    return user


@router.get("/reports", response_model=List[ReportWithVotes])
async def get_all_reports_admin(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Get reports that match the admin's role.
    If admin role is 'all', get all reports.
    Otherwise, only get reports that match the admin's role type.
    """
    # Build base query
    query = select(Report)
    
    # Apply status filter if provided
    if status:
        query = query.where(Report.status == status)
    
    # Filter by the admin's role
    if current_user.role and current_user.role != "all":
        # Admin can only see reports that match their role type
        query = query.where(Report.type.ilike(current_user.role))
    
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
    
    # In the get_all_reports_admin function, add logic for the super role
    if current_user.role == "super":
        # Admin can see all reports
        pass
    
    return report_list


@router.patch("/reports/{report_id}/status", response_model=ReportSchema)
async def update_report_status(
    report_id: int,
    status_update: ReportStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Update report status. Admin can only update reports that match their role.
    If admin role is 'all', they can update any report.
    """
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Check if admin has permission to update this report
    if current_user.role and current_user.role != "all" and report.type.lower() != current_user.role.lower():
        raise HTTPException(
            status_code=403,
            detail=f"You don't have permission to update this report type. Your role: {current_user.role}, Report type: {report.type}"
        )

    if report.status != ReportStatus.PENDING.value:  # Use .value for string comparison
        raise HTTPException(
            status_code=400,
            detail="Can only update reports in pending status"
        )

    if status_update.status != ReportStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=400,
            detail="This endpoint only allows setting status to in_progress"
        )

    report.status = status_update.status.value  # Store the string value
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
    Complete a report. Admin can only complete reports that match their role.
    If admin role is 'all', they can complete any report.
    """
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Check if admin has permission to complete this report
    if current_user.role and current_user.role != "all" and report.type.lower() != current_user.role.lower():
        raise HTTPException(
            status_code=403,
            detail=f"You don't have permission to complete this report type. Your role: {current_user.role}, Report type: {report.type}"
        )

    if report.status != ReportStatus.IN_PROGRESS.value:
        raise HTTPException(
            status_code=400,
            detail="Can only complete reports in in_progress status"
        )

    report.status = ReportStatus.COMPLETED.value
    await db.commit()
    await db.refresh(report)
    
    # Correct user detail lookup
    user_detail_result = await db.execute(
        select(UserDetail).where(UserDetail.user_id == report.user_id)
    )
    user_detail = user_detail_result.scalar_one_or_none()
    
    if user_detail and user_detail.phone_number:
        await send_sms(
            message=f"Your report #{report.id} is now completed. Thank you!"
        )
    
    return report


@router.patch("/users/{user_id}/superuser", response_model=UserSchema)
async def set_user_as_superuser(
    user_id: int,
    role_update: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Make a user a superuser with a specific role (admin only).
    """
    # Check if this is the first superuser (allow special case for setup)
    count_result = await db.execute(select(func.count(User.id)).where(User.is_superuser == True))
    superuser_count = count_result.scalar()
    
    if superuser_count > 0 and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can create other superusers"
        )
    
    # Get the user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate the role
    if role_update.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"
        )
    
    # Set user as superuser
    user.is_superuser = True
    user.role = role_update.role
    await db.commit()
    await db.refresh(user)
    
    return user