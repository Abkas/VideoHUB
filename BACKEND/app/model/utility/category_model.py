from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Category(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=50)
    slug: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = None
    color: Optional[str] = None  # Hex color code for UI
    video_count: int = 0
    is_active: bool = True
    display_order: int = 0  # For sorting in UI
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
