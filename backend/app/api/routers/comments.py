from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.models.user import User
from app.models.report import Report
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, Comment as CommentSchema, CommentWithUser
from app.utils.deps import get_current_user
from typing import Any, List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=CommentSchema)
async def create_comment(
    comment: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new comment on a report.
    """
    # Check if report exists
    report_result = await db.execute(select(Report).where(Report.id == comment.report_id))
    report = report_result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Create comment
    new_comment = Comment(
        user_id=current_user.id,
        report_id=comment.report_id,
        text=comment.text
    )
    
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    
    return new_comment


@router.get("/report/{report_id}", response_model=List[CommentWithUser])
async def get_comments_by_report(
    report_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all comments for a specific report with user details.
    """
    # Check if report exists
    report_result = await db.execute(select(Report).where(Report.id == report_id))
    report = report_result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Get comments for the report with user info
    query = select(Comment, User.username) \
        .join(User, Comment.user_id == User.id) \
        .where(Comment.report_id == report_id) \
        .order_by(desc(Comment.created_at)) \
        .offset(skip).limit(limit)
    
    result = await db.execute(query)
    
    # Process the results to include username
    comments_with_users = []
    for comment, username in result:
        comment_dict = {
            "id": comment.id,
            "user_id": comment.user_id,
            "report_id": comment.report_id,
            "text": comment.text,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "username": username
        }
        comments_with_users.append(comment_dict)
    
    return comments_with_users


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete a comment. Users can only delete their own comments.
    """
    # Get the comment
    comment_result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = comment_result.scalar_one_or_none()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if the user is the owner of the comment or a superuser
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this comment"
        )
    
    # Delete the comment
    await db.delete(comment)
    await db.commit() 