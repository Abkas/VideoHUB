from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Subscription Create
class SubscriptionCreate(BaseModel):
    plan: str  # free, basic, premium, premium_plus
    billing_cycle: str = "monthly"  # monthly, yearly
    payment_method: Optional[str] = None  # card, upi, netbanking, wallet, qr
    payment_gateway: Optional[str] = None  # razorpay, fonepay, paypal
    country_code: Optional[str] = "IN"  # IN, NP, etc.
    discount_code: Optional[str] = None


# Admin Subscription Create (for manual subscription creation)
class AdminSubscriptionCreate(BaseModel):
    subscription_name: str
    plan: str  # free, basic, premium, premium_plus
    duration_value: int
    duration_unit: str  # hour, day, month, year
    status: str = "active"  # active, inactive, trial, pending
    currency: str = "INR"  # INR, NPR, USD
    custom_price: Optional[float] = None
    description: Optional[str] = None


# Subscription Update
class SubscriptionUpdate(BaseModel):
    auto_renew: Optional[bool] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None


# Subscription Response
class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    email: Optional[str] = None
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
    payment_gateway: Optional[str] = None
    payment_method: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Admin Subscription List
class SubscriptionListResponse(BaseModel):
    subscriptions: List[SubscriptionResponse]
    total: int
    page: int
    page_size: int


# Subscription Plan Response (for plan templates)
class SubscriptionPlanResponse(BaseModel):
    id: str
    subscription_name: str
    plan: str
    status: str
    billing_cycle: str
    duration_value: int
    duration_unit: str
    duration_days: float
    price: float
    currency: str
    description: Optional[str] = None
    features: List[str] = []
    max_quality: Optional[str] = None
    concurrent_streams: Optional[int] = None
    downloads_per_month: Optional[int] = None
    ad_free: Optional[bool] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Subscription Plan List Response
class SubscriptionPlanListResponse(BaseModel):
    subscriptions: List[SubscriptionPlanResponse]
    total: int
    page: int
    page_size: int


# Subscription Stats (for admin dashboard)
class SubscriptionStats(BaseModel):
    total_subscriptions: int
    active_subscriptions: int
    trial_subscriptions: int
    cancelled_subscriptions: int
    expired_subscriptions: int
    monthly_revenue: float
    total_revenue: float
    plan_distribution: dict  # {"basic": 10, "premium": 20, ...}
    gateway_distribution: dict  # {"razorpay": 15, "fonepay": 10, ...}


# Subscription Plan Stats (for plan templates)
class SubscriptionPlanStats(BaseModel):
    total_subscriptions: int
    active_subscriptions: int
    trial_subscriptions: int
    monthly_revenue: float
    plan_distribution: dict  # {"basic": 10, "premium": 20, ...}
