from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.user import User
from app.models.user_detail import UserDetail
from app.schemas.user_detail import UserDetailCreate, UserDetailUpdate, UserDetail as UserDetailSchema
from app.utils.deps import get_current_user
from typing import Any

router = APIRouter()


@router.post("/details", response_model=UserDetailSchema)
async def create_user_details(
    user_detail: UserDetailCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create user details for the current user.
    """
    # Check if user already has details
    result = await db.execute(select(UserDetail).where(UserDetail.user_id == current_user.id))
    existing_detail = result.scalar_one_or_none()
    
    if existing_detail:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User details already exist. Use PUT to update."
        )
    
    # Create new user details
    new_details = UserDetail(
        user_id=current_user.id,
        age=user_detail.age,
        sex=user_detail.sex,
        phone_number=user_detail.phone_number,
        address=user_detail.address,
        city=user_detail.city,
        state=user_detail.state,
        pin_code=user_detail.pin_code
    )
    
    db.add(new_details)
    await db.commit()
    await db.refresh(new_details)
    
    return new_details


@router.get("/details", response_model=UserDetailSchema)
async def get_user_details(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get details of the current user.
    """
    result = await db.execute(select(UserDetail).where(UserDetail.user_id == current_user.id))
    user_detail = result.scalar_one_or_none()
    
    if not user_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User details not found"
        )
    
    return user_detail


@router.put("/details", response_model=UserDetailSchema)
async def update_user_details(
    user_detail: UserDetailUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update details of the current user.
    """
    result = await db.execute(select(UserDetail).where(UserDetail.user_id == current_user.id))
    existing_detail = result.scalar_one_or_none()
    
    if not existing_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User details not found. Create details first."
        )
    
    # Update fields if provided
    update_data = user_detail.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(existing_detail, field, value)
    
    await db.commit()
    await db.refresh(existing_detail)
    
    return existing_detail