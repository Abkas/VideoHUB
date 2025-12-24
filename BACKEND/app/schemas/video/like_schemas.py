from pydantic import BaseModel
from datetime import datetime


# Like Create
class LikeCreate(BaseModel):
    video_id: str
    like_type: str = "like"  # like or dislike


# Like Response
class LikeResponse(BaseModel):
    id: int
    video_id: str
    user_id: int
    like_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True
