from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Watch History Create/Update
class WatchHistoryUpdate(BaseModel):
    video_id: int
    watch_position: int = 0
    watch_duration: int = 0
    completion_percentage: float = 0.0


# Watch History Response
class WatchHistoryResponse(BaseModel):
    id: int
    video_id: int
    user_id: int
    watch_position: int = 0
    watch_duration: int = 0
    completion_percentage: float = 0.0
    is_completed: bool = False
    last_watched_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
