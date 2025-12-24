from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Comment Create
class CommentCreate(BaseModel):
    video_id: str
    text: str = Field(..., min_length=1, max_length=5000)
    parent_comment_id: Optional[int] = None


# Comment Update
class CommentUpdate(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


# Comment Response
class CommentResponse(BaseModel):
    id: int
    video_id: int
    user_id: int
    username: Optional[str] = None
    user_profile_picture: Optional[str] = None
    text: str
    parent_comment_id: Optional[int] = None
    replies_count: int = 0
    is_edited: bool = False
    is_pinned: bool = False
    created_at: datetime
    edited_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
