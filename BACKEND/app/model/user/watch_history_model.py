from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WatchHistory(BaseModel):
    id: Optional[int] = None
    
    # References
    video_id: int
    user_id: int
    
    # Watch details
    watch_position: int = 0  # Last position watched in seconds
    watch_duration: int = 0  # Total time watched
    completion_percentage: float = 0.0
    
    # Status
    is_completed: bool = False
    is_removed: bool = False  # User can remove from history
    
    # Timestamps
    last_watched_at: datetime = Field(default_factory=datetime.now)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
