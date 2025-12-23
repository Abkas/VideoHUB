from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Schema for following a user
class FollowCreate(BaseModel):
    following_id: int  # User to follow


# Schema for follower response
class FollowerResponse(BaseModel):
    id: str
    follower_id: int
    following_id: int
    status: str
    notify_on_upload: bool
    notify_on_live: bool
    followed_at: datetime
    
    # User details (populated by service)
    follower_username: Optional[str] = None
    follower_display_name: Optional[str] = None
    follower_email: Optional[str] = None
    
    class Config:
        from_attributes = True


# Schema for following response
class FollowingResponse(BaseModel):
    id: str
    follower_id: int
    following_id: int
    status: str
    notify_on_upload: bool
    notify_on_live: bool
    followed_at: datetime
    
    # User details (populated by service)
    following_username: Optional[str] = None
    following_display_name: Optional[str] = None
    following_email: Optional[str] = None
    
    class Config:
        from_attributes = True


# Schema for updating follow settings
class FollowUpdate(BaseModel):
    notify_on_upload: Optional[bool] = None
    notify_on_live: Optional[bool] = None
    status: Optional[str] = None
