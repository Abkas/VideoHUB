from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Like(BaseModel):
    id: Optional[int] = None
    
    # References
    video_id: int
    user_id: int
    
    # Like type: like, dislike
    like_type: str = "like"
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
