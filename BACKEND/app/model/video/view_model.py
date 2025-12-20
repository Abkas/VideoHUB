from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class View(BaseModel):
    id: Optional[int] = None
    
    # References
    video_id: int
    user_id: Optional[int] = None  # Can be null for anonymous views
    
    # View details
    watch_duration: int = 0  # Seconds watched
    video_duration: Optional[int] = None  # Total video duration at time of view
    completion_percentage: float = 0.0
    
    # Device and location info
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_type: Optional[str] = None  # mobile, desktop, tablet, tv
    browser: Optional[str] = None
    os: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    
    # Quality watched
    quality_watched: Optional[str] = None  # 360p, 720p, 1080p, etc.
    
    # Session info
    session_id: Optional[str] = None
    referrer: Optional[str] = None  # Where they came from
    
    # Engagement
    is_unique_view: bool = True
    is_completed: bool = False  # Watched >90%
    resumed_from: int = 0  # Timestamp where they resumed watching
    
    # Timestamps
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
