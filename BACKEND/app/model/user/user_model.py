from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class User(BaseModel):
    id: Optional[int] = None
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    hashed_password: str
    
    # Role and status (user, admin, moderator)
    role: str = "user"
    # Status: active, suspended, banned, pending
    status: str = "active"
    
    # Current subscription reference (ID to active subscription)
    current_subscription_id: Optional[int] = None
    
    # Profile information
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None
    cover_image: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = None
    
    # Statistics
    total_videos: int = 0
    total_views: int = 0
    total_likes: int = 0
    subscribers_count: int = 0
    subscribing_count: int = 0
    
    # Preferences
    is_verified: bool = False
    is_premium: bool = False
    email_notifications: bool = True
    privacy_settings: Optional[dict] = None
    
    # Content settings
    show_mature_content: bool = False
    content_language: str = "en"
    
    # Favorites (simple list of video IDs)
    favorite_video_ids: List[int] = []
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    