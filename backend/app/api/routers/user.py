from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.user import User, VALID_ROLES
from app.models.user_detail import UserDetail
from app.schemas.user_detail import UserDetailCreate, UserDetailUpdate, UserDetail as UserDetailSchema
from app.schemas.user import User as UserSchema
from app.utils.deps import get_current_user
from typing import Any
from pydantic import BaseModel

router = APIRouter()


class UserUpdateSuperuser(BaseModel):
    is_superuser: bool
    role: str = None


@router.patch("/me/superuser", response_model=UserSchema)
async def update_my_superuser_status(
    update_data: UserUpdateSuperuser,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update your own superuser status. 
    This is for development purposes - in a real app, you would need admin approval.
    """
    # Set superuser status
    current_user.is_superuser = update_data.is_superuser
    
    # Set role if becoming a superuser and role is provided
    if update_data.is_superuser and update_data.role:
        if update_data.role not in VALID_ROLES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"
            )
        current_user.role = update_data.role
    elif not update_data.is_superuser:
        # Clear role if not a superuser
        current_user.role = None
    
    # Save changes
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


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