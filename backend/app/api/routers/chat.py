from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, or_
from app.db.database import get_db
from app.models.user import User
from app.models.chat import ChatRoom, ChatMessage
from app.models.user_detail import UserDetail
from app.schemas.chat import (
    ChatRoom as ChatRoomSchema,
    ChatRoomCreate,
    ChatMessage as ChatMessageSchema,
    ChatMessageCreate,
    ChatMessageWithUser,
    PusherAuthRequest,
    PusherMessage,
    JoinChatRoomRequest
)
from app.utils.deps import get_current_user
from app.utils.pusher_client import get_channel_name, trigger_message, authenticate_user
from typing import Any, List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/auth", response_model=dict)
async def pusher_auth(
    auth_request: PusherAuthRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Authenticate a user for Pusher channels.
    """
    try:
        # Generate authentication response
        auth_response = authenticate_user(
            socket_id=auth_request.socket_id,
            channel_name=auth_request.channel_name,
            user_id=current_user.id,
            username=current_user.username
        )
        return auth_response
    except Exception as e:
        logger.error(f"Failed to authenticate Pusher: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate with Pusher"
        )


@router.post("/rooms/join", response_model=ChatRoomSchema)
async def join_or_create_room(
    request: JoinChatRoomRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Join a chat room by pin code or create it if it doesn't exist.
    """
    # Check if room exists
    result = await db.execute(select(ChatRoom).where(ChatRoom.pin_code == request.pin_code))
    chat_room = result.scalar_one_or_none()
    
    if not chat_room:
        # Room doesn't exist, create it
        # First, get the current user's user detail to verify they have the same pin code
        detail_result = await db.execute(
            select(UserDetail).where(UserDetail.user_id == current_user.id)
        )
        user_detail = detail_result.scalar_one_or_none()
        
        if not user_detail or user_detail.pin_code != request.pin_code:
            # Only allow creating a room with your own pin code
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create a community chat for your own area pin code"
            )
        
        # Create the room
        chat_room = ChatRoom(
            pin_code=request.pin_code,
            name=f"Community Chat - {request.pin_code}"
        )
        db.add(chat_room)
        await db.commit()
        await db.refresh(chat_room)
        
        logger.info(f"Created new chat room for pin code {request.pin_code}")
    
    return chat_room


@router.post("/messages", response_model=ChatMessageSchema)
async def send_message(
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Send a message to a chat room.
    """
    # Check if room exists
    result = await db.execute(select(ChatRoom).where(ChatRoom.id == message.room_id))
    chat_room = result.scalar_one_or_none()
    
    if not chat_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat room not found"
        )
    
    # Create and save the message
    new_message = ChatMessage(
        room_id=message.room_id,
        user_id=current_user.id,
        message=message.message
    )
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    
    # Send message via Pusher
    channel_name = get_channel_name(chat_room.pin_code)
    try:
        trigger_message(
            channel_name=channel_name,
            event_name="new_message",
            data={
                "message_id": new_message.id,
                "room_id": new_message.room_id,
                "user_id": new_message.user_id,
                "username": current_user.username,
                "message": new_message.message,
                "created_at": new_message.created_at.isoformat()
            }
        )
    except Exception as e:
        logger.error(f"Failed to send message to Pusher: {str(e)}")
        # We don't want to fail the API call if Pusher fails
        # The message is already saved to the database
    
    return new_message


@router.get("/rooms", response_model=List[ChatRoomSchema])
async def get_available_rooms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all chat rooms available to the current user (by their pin code).
    """
    # Get the user's pin code from their details
    detail_result = await db.execute(
        select(UserDetail).where(UserDetail.user_id == current_user.id)
    )
    user_detail = detail_result.scalar_one_or_none()
    
    if not user_detail or not user_detail.pin_code:
        return []
    
    # Get rooms matching the user's pin code
    result = await db.execute(
        select(ChatRoom).where(ChatRoom.pin_code == user_detail.pin_code)
    )
    rooms = result.scalars().all()
    
    return list(rooms)


@router.get("/rooms/{room_id}/messages", response_model=List[ChatMessageWithUser])
async def get_room_messages(
    room_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get messages for a specific chat room.
    """
    # Check if room exists
    room_result = await db.execute(select(ChatRoom).where(ChatRoom.id == room_id))
    chat_room = room_result.scalar_one_or_none()
    
    if not chat_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat room not found"
        )
    
    # Get messages with user information
    query = select(ChatMessage, User.username) \
        .join(User, ChatMessage.user_id == User.id) \
        .where(ChatMessage.room_id == room_id) \
        .order_by(desc(ChatMessage.created_at)) \
        .offset(skip).limit(limit)
    
    result = await db.execute(query)
    
    # Process the results to include username
    messages_with_users = []
    for message, username in result:
        message_dict = {
            "id": message.id,
            "room_id": message.room_id,
            "user_id": message.user_id,
            "message": message.message,
            "created_at": message.created_at,
            "username": username
        }
        messages_with_users.append(message_dict)
    
    return messages_with_users 