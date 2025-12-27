from pydantic import BaseModel, Field
from typing import Optional


class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=30)
    slug: Optional[str] = Field(None, min_length=1, max_length=30)  # Auto-generated if not provided


class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=30)
    slug: Optional[str] = Field(None, min_length=1, max_length=30)
    is_active: Optional[bool] = None


class TagResponse(BaseModel):
    id: str
    name: str
    slug: str
    video_count: int
    is_active: bool
    
    class Config:
        from_attributes = True
