from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SavedVideoResponse(BaseModel):
    """Response schema for saved video status"""
    saved: bool = Field(..., description="Whether the video is saved")
    saved_at: Optional[datetime] = Field(None, description="When the video was saved")


class SavedVideoCreate(BaseModel):
    """Schema for creating a saved video record"""
    video_id: str = Field(..., description="ID of the video to save")


class SavedVideoDetail(BaseModel):
    """Detailed saved video information"""
    id: str = Field(..., description="Saved video record ID")
    video_id: str = Field(..., description="Video ID")
    user_id: str = Field(..., description="User ID")
    saved_at: datetime = Field(..., description="When saved")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
