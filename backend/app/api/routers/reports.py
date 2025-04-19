from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus, ReportType
from app.models.vote import Vote
from app.schemas.report import ReportCreate, Report as ReportSchema, ReportWithVotes
from app.schemas.vote import VoteCreate, Vote as VoteSchema
from app.utils.deps import get_current_user
from app.utils.s3 import upload_image_to_s3
from typing import Any, List, Optional
import json

router = APIRouter()


@router.post("/", response_model=ReportSchema)
async def create_report(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    type: str = Form(ReportType.MISCELLANEOUS),
    location: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new report.
    """
    # Upload image to S3 if provided
    image_url = None
    if image:
        image_url = await upload_image_to_s3(image)
    
    # Create report
    new_report = Report(
        user_id=current_user.id,
        title=title,
        description=description,
        type=type,
        location=location,
        image_url=image_url,
        status=ReportStatus.PENDING
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    # Add vote_count to the response
    setattr(new_report, "vote_count", 0)
    
    return new_report


@router.get("/", response_model=List[ReportWithVotes])
async def get_all_reports(
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all reports with votes.
    """
    # Build the query
    query = select(Report)
    
    # Apply status filter if provided
    if status:
        query = query.where(Report.status == status)
    
    # Add pagination
    query = query.offset(skip).limit(limit).order_by(desc(Report.created_at))
    
    # Execute query
    result = await db.execute(query)
    reports = result.scalars().all()
    
    # For each report, get votes and add vote_count
    report_list = []
    for report in reports:
        # Get vote count
        vote_count_query = select(func.count(Vote.id)).where(Vote.report_id == report.id)
        vote_count_result = await db.execute(vote_count_query)
        vote_count = vote_count_result.scalar()
        
        # Get user IDs who voted
        vote_users_query = select(Vote.user_id).where(Vote.report_id == report.id)
        vote_users_result = await db.execute(vote_users_query)
        vote_users = [user_id for user_id in vote_users_result.scalars().all()]
        
        # Create a copy of the report with additional attributes
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
            "votes": vote_users
        }
        report_list.append(report_dict)
    
    return report_list


@router.get("/me", response_model=List[ReportWithVotes])
async def get_user_reports(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all reports created by the current user.
    """
    # Build the query
    query = select(Report).where(Report.user_id == current_user.id)
    
    # Add pagination
    query = query.offset(skip).limit(limit).order_by(desc(Report.created_at))
    
    # Execute query
    result = await db.execute(query)
    reports = result.scalars().all()
    
    # For each report, get votes and add vote_count
    report_list = []
    for report in reports:
        # Get vote count
        vote_count_query = select(func.count(Vote.id)).where(Vote.report_id == report.id)
        vote_count_result = await db.execute(vote_count_query)
        vote_count = vote_count_result.scalar()
        
        # Get user IDs who voted
        vote_users_query = select(Vote.user_id).where(Vote.report_id == report.id)
        vote_users_result = await db.execute(vote_users_query)
        vote_users = [user_id for user_id in vote_users_result.scalars().all()]
        
        # Create a copy of the report with additional attributes
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
            "votes": vote_users
        }
        report_list.append(report_dict)
    
    return report_list


@router.get("/{report_id}", response_model=ReportWithVotes)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific report by ID.
    """
    # Get the report
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Get vote count
    vote_count_query = select(func.count(Vote.id)).where(Vote.report_id == report.id)
    vote_count_result = await db.execute(vote_count_query)
    vote_count = vote_count_result.scalar()
    
    # Get user IDs who voted
    vote_users_query = select(Vote.user_id).where(Vote.report_id == report.id)
    vote_users_result = await db.execute(vote_users_query)
    vote_users = [user_id for user_id in vote_users_result.scalars().all()]
    
    # Create a copy of the report with additional attributes
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
        "votes": vote_users
    }
    
    return report_dict


@router.post("/vote", response_model=VoteSchema)
async def vote_for_report(
    vote: VoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Vote for a report.
    """
    # Check if report exists
    report_result = await db.execute(select(Report).where(Report.id == vote.report_id))
    report = report_result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Check if user already voted for this report
    existing_vote_result = await db.execute(
        select(Vote).where(
            Vote.user_id == current_user.id,
            Vote.report_id == vote.report_id
        )
    )
    existing_vote = existing_vote_result.scalar_one_or_none()
    
    if existing_vote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already voted for this report"
        )
    
    # Create new vote
    new_vote = Vote(
        user_id=current_user.id,
        report_id=vote.report_id
    )
    
    db.add(new_vote)
    await db.commit()
    await db.refresh(new_vote)
    
    return new_vote 