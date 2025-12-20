from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Video Create
class VideoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    video_url: str
    thumbnail_url: Optional[str] = None
    duration: int
    tags: List[str] = []
    categories: List[str] = []
    content_rating: str = "safe"
    is_premium: bool = False
    allow_comments: bool = True
    allow_downloads: bool = False


# Video Update
class VideoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    status: Optional[str] = None
    content_rating: Optional[str] = None
    is_premium: Optional[bool] = None
    is_featured: Optional[bool] = None
    allow_comments: Optional[bool] = None
    allow_downloads: Optional[bool] = None


# Video Response (List view - minimal info)
class VideoListItem(BaseModel):
    id: int
    title: str
    thumbnail_url: Optional[str] = None
    duration: int
    views: int = 0
    likes: int = 0
    uploader_id: int
    uploader_username: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Video Response (Detail view - full info)
class VideoDetail(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    uploader_id: int
    uploader_username: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    preview_gif_url: Optional[str] = None
    available_qualities: List[str] = []
    duration: int
    file_size: Optional[int] = None
    resolution: Optional[str] = None
    tags: List[str] = []
    categories: List[str] = []
    language: str = "en"
    status: str
    content_rating: str
    is_premium: bool = False
    is_featured: bool = False
    views: int = 0
    likes: int = 0
    dislikes: int = 0
    comments_count: int = 0
    shares_count: int = 0
    favorites_count: int = 0
    allow_comments: bool = True
    allow_downloads: bool = False
    created_at: datetime
    published_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
