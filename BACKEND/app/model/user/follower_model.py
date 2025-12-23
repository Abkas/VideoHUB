from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Follower(BaseModel):
    id: Optional[int] = None
    
    # User who is following
    follower_id: int
    
    # User being followed
    following_id: int
    
    # Follow status: active, blocked, muted
    status: str = "active"
    
    # Notification preferences
    notify_on_upload: bool = True
    notify_on_live: bool = True
    
    # Timestamps
    followed_at: datetime = Field(default_factory=datetime.now)
    unfollowed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
