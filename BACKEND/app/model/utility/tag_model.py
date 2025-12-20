from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Tag(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=30)
    slug: str = Field(..., min_length=1, max_length=30)
    video_count: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
