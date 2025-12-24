from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class SavedVideoModel(BaseModel):
    """Model for saved/bookmarked videos"""
    user_id: str = Field(..., description="ID of the user who saved the video")
    video_id: str = Field(..., description="ID of the saved video")
    saved_at: datetime = Field(default_factory=datetime.utcnow, description="When the video was saved")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }
        populate_by_name = True
