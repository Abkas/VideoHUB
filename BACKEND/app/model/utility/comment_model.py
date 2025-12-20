from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Comment(BaseModel):
    id: Optional[int] = None
    
    # References
    video_id: int
    user_id: int
    username: Optional[str] = None
    user_profile_picture: Optional[str] = None
    
    # Comment content
    text: str = Field(..., min_length=1, max_length=5000)
    
    # Threading/Replies
    parent_comment_id: Optional[int] = None  # For nested replies
    reply_to_user_id: Optional[int] = None
    reply_to_username: Optional[str] = None
    
    # Statistics
    likes_count: int = 0
    dislikes_count: int = 0
    replies_count: int = 0
    
    # Status
    is_edited: bool = False
    is_pinned: bool = False
    is_deleted: bool = False
    
    # Moderation
    is_flagged: bool = False
    flagged_count: int = 0
    moderation_status: str = "approved"  # approved, pending, rejected, hidden
    moderated_by: Optional[int] = None
    moderation_reason: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    edited_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
