from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# View Create
class ViewCreate(BaseModel):
    video_id: int
    watch_duration: int = 0
    quality_watched: Optional[str] = None
    device_type: Optional[str] = None
    session_id: Optional[str] = None


# View Response
class ViewResponse(BaseModel):
    id: int
    video_id: int
    user_id: Optional[int] = None
    watch_duration: int = 0
    completion_percentage: float = 0.0
    quality_watched: Optional[str] = None
    device_type: Optional[str] = None
    is_completed: bool = False
    started_at: datetime
    
    class Config:
        from_attributes = True
