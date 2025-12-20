from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Playlist(BaseModel):
    id: Optional[int] = None
    
    # Owner
    user_id: int
    username: Optional[str] = None
    
    # Playlist details
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    thumbnail_url: Optional[str] = None
    
    # Privacy: public, private, unlisted
    privacy: str = "public"
    
    # Videos in playlist
    video_ids: List[int] = []
    video_count: int = 0
    
    # Statistics
    views: int = 0
    likes: int = 0
    shares: int = 0
    
    # Settings
    allow_collaborators: bool = False
    collaborator_ids: List[int] = []
    auto_add_new_videos: bool = False  # Auto-add new videos from specific channel
    auto_add_channel_id: Optional[int] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
