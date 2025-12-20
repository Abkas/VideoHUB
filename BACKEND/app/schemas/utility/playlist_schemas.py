from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Playlist Create
class PlaylistCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    privacy: str = "public"  # public, private, unlisted


# Playlist Update
class PlaylistUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    thumbnail_url: Optional[str] = None
    privacy: Optional[str] = None


# Playlist Add/Remove Video
class PlaylistVideoAction(BaseModel):
    video_id: int


# Playlist Response (List view)
class PlaylistListItem(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    title: str
    thumbnail_url: Optional[str] = None
    privacy: str
    video_count: int = 0
    views: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


# Playlist Response (Detail view)
class PlaylistDetail(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    privacy: str
    video_ids: List[int] = []
    video_count: int = 0
    views: int = 0
    likes: int = 0
    shares: int = 0
    allow_collaborators: bool = False
    collaborator_ids: List[int] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
