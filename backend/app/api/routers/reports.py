from fastapi import APIRouter, Depends, HTTPException, status, Body, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus
from app.models.vote import Vote
from app.schemas.report import ReportCreate, Report as ReportSchema, ReportWithVotes
from app.schemas.vote import VoteCreate, Vote as VoteSchema
from app.utils.deps import get_current_user
from app.utils.s3 import upload_base64_image_to_s3
from app.utils.gemini import classify_image
from typing import Any, List, Optional
import json
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
import re


router = APIRouter()

VALID_ROLES = ["garbage", "labour", "electrician", "plumber", "all"]

@router.post("/", response_model=ReportSchema, summary="Create a new report with JSON and base64 image",
    description="""
    Create a new report using JSON data with a base64-encoded image.
    
    The image should be provided as a base64-encoded string in the `base64_image` field,
    and the image type (extension) should be provided in the `image_type` field (e.g., 'jpg', 'png').
    If an image is provided, the `type` field will be automatically determined by AI.
    """
)
async def create_report(
    report: ReportCreate = Body(
        ...,
        examples={
            "with_image": {
                "summary": "Create report with base64 image (type will be auto-detected)",
                "description": "A normal example with base64 encoded image",
                "value": {
                    "title": "Pothole on Main Street",
                    "description": "Large pothole causing traffic issues",
                    "type": "INFRASTRUCTURE",
                    "location": "123 Main St",
                    "base64_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAY...",
                    "image_type": "jpg"
                }
            },
            "without_image": {
                "summary": "Create report without image (uses provided type)",
                "description": "An example without an image",
                "value": {
                    "title": "Noise complaint",
                    "description": "Loud music after hours",
                    "type": "NOISE",
                    "location": "456 Elm St"
                }
            }
        }
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new report. If an image is provided, its type is automatically classified by Gemini.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    image_url = None
    report_type = report.type  # Default to user-provided type

    if report.base64_image and report.image_type:
        logger.info(f"Image provided. Attempting upload and AI classification.")
        # 1. Upload image to S3
        try:
            if not report.base64_image.strip():
                logger.warning("Base64 image string is empty")
                raise ValueError("Base64 image string is empty")
            image_url = await upload_base64_image_to_s3(report.base64_image, report.image_type)
            logger.info(f"Image uploaded successfully, URL: {image_url}")
        except Exception as e:
            logger.error(f"Failed to upload image: {str(e)}", exc_info=True)
            # Decide if upload failure should prevent report creation
            # raise HTTPException(status_code=400, detail=f"Image upload failed: {str(e)}")

        # 2. Classify image with Gemini
        try:
            logger.info("Attempting Gemini image classification...")
            response = await classify_image(report.base64_image)
            
            # Directly check if the response is in VALID_ROLES
            if response in VALID_ROLES:
                logger.info(f"Gemini classification successful: {response}")
                report_type = response
            else:
                logger.warning(f"Gemini classification returned unexpected result: '{response}'. Defaulting to 'miscellaneous'.")
                report_type = "miscellaneous"
        except Exception as e:
            logger.error(f"Gemini classification failed: {str(e)}", exc_info=True)
            logger.warning(f"Falling back to user-provided type: {report.type}")
            report_type = report.type  # Explicitly fall back

    else:
        logger.info("No image provided or image type missing. Using user-provided type.")
        report_type = report.type

    # Remove the validation against ReportType
    # Validate the final report_type against the enum
    if report_type not in VALID_ROLES:
        logger.warning(f"Invalid report type determined: '{report_type}'. Defaulting to 'miscellaneous'.")
        report_type = "miscellaneous"  # Use the correct fallback

    # Create report with the determined type and image_url
    logger.info(f"Creating report with title: {report.title}, type: {report_type}, image_url: {image_url}")
    new_report = Report(
        user_id=current_user.id,
        title=report.title,
        description=report.description,
        type=report_type, # Use the determined type (Gemini or user)
        location=report.location,
        image_url=image_url,
        status=ReportStatus.PENDING
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    # Verify the image_url was saved correctly
    logger.info(f"Report created with ID: {new_report.id}, type: {new_report.type}, image_url: {new_report.image_url}")
    
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