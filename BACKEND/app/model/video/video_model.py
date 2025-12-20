from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Video(BaseModel):
    id: Optional[int] = None
    
    # Basic information
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    
    # Uploader information
    uploader_id: int
    uploader_username: Optional[str] = None
    
    # Media URLs
    video_url: str
    thumbnail_url: Optional[str] = None
    preview_gif_url: Optional[str] = None
    
    # Available qualities
    available_qualities: List[str] = []  # e.g., ["360p", "720p", "1080p"]
    quality_urls: Optional[dict] = None  # {quality: url}
    
    # Video metadata
    duration: int  # Duration in seconds
    file_size: Optional[int] = None  # File size in bytes
    resolution: Optional[str] = None  # e.g., "1920x1080"
    aspect_ratio: Optional[str] = None  # e.g., "16:9"
    fps: Optional[int] = None
    codec: Optional[str] = None
    
    # Categorization
    tags: List[str] = []
    categories: List[str] = []
    language: str = "en"
    
    # Status: processing, published, private, unlisted, deleted, flagged
    status: str = "processing"
    # Content rating: safe, mature, explicit
    content_rating: str = "safe"
    is_premium: bool = False
    is_featured: bool = False
    
    # Statistics
    views: int = 0
    likes: int = 0
    dislikes: int = 0
    comments_count: int = 0
    shares_count: int = 0
    favorites_count: int = 0
    
    # Engagement rate (calculated)
    like_ratio: Optional[float] = None
    engagement_score: Optional[float] = None
    
    # Privacy and settings
    allow_comments: bool = True
    allow_downloads: bool = False
    is_monetized: bool = False
    age_restricted: bool = False
    
    # SEO and discovery
    slug: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    search_tags: Optional[List[str]] = None
    
    # Geographic data
    upload_location: Optional[str] = None
    restricted_countries: Optional[List[str]] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    published_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    
    # Moderation
    flagged_count: int = 0
    moderation_notes: Optional[str] = None
    moderated_by: Optional[int] = None
    moderated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
