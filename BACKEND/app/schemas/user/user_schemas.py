from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User Registration
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = None


# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# User Update
class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = None
    profile_picture: Optional[str] = None
    cover_image: Optional[str] = None
    show_mature_content: Optional[bool] = None
    content_language: Optional[str] = None
    email_notifications: Optional[bool] = None


# User Response (Public - what others see)
class UserPublic(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool = False
    total_videos: int = 0
    total_views: int = 0
    subscribers_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


# User Response (Private - what user sees about themselves)
class UserPrivate(BaseModel):
    id: str
    username: str
    email: EmailStr
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None
    cover_image: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    role: str
    status: str
    current_subscription_id: Optional[int] = None
    total_videos: int = 0
    total_views: int = 0
    total_likes: int = 0
    subscribers_count: int = 0
    subscribing_count: int = 0
    is_verified: bool = False
    is_premium: bool = False
    email_notifications: bool = True
    show_mature_content: bool = False
    content_language: str
    favorite_video_ids: List[int] = []
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Token Response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPrivate
