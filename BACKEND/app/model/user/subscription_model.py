from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TimeSubscription(BaseModel):
    """Simple time-based subscription model"""
    id: Optional[str] = None
    user_id: int
    expires_at: datetime  # UTC datetime when subscription expires
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        from_attributes = True
