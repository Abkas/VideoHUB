from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Subscription Create
class SubscriptionCreate(BaseModel):
    plan: str  # free, basic, premium, premium_plus, enterprise
    billing_cycle: str = "monthly"
    payment_method: Optional[str] = None
    discount_code: Optional[str] = None


# Subscription Update
class SubscriptionUpdate(BaseModel):
    auto_renew: Optional[bool] = None
    payment_method: Optional[str] = None


# Subscription Response
class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan: str
    status: str
    billing_cycle: str
    price: float
    currency: str = "USD"
    discount_percentage: float = 0.0
    final_price: float
    is_trial: bool = False
    trial_ends_at: Optional[datetime] = None
    started_at: datetime
    expires_at: datetime
    next_billing_date: Optional[datetime] = None
    auto_renew: bool = True
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
