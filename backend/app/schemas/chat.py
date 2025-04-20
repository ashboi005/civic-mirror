from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRoomBase(BaseModel):
    pin_code: str
    name: str


class ChatRoomCreate(ChatRoomBase):
    pass


class ChatRoom(ChatRoomBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageBase(BaseModel):
    message: str


class ChatMessageCreate(ChatMessageBase):
    room_id: int


class ChatMessage(ChatMessageBase):
    id: int
    room_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageWithUser(ChatMessage):
    username: str

    class Config:
        from_attributes = True


class PusherAuthRequest(BaseModel):
    socket_id: str
    channel_name: str


class PusherMessage(BaseModel):
    message: str
    room_id: int


class JoinChatRoomRequest(BaseModel):
    pin_code: str 