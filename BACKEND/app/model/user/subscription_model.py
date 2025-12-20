from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Subscription(BaseModel):
    id: Optional[int] = None
    
    # User reference
    user_id: int
    
    # Plan: free, basic, premium, premium_plus, enterprise
    plan: str
    # Status: active, trial, expired, cancelled, suspended, pending
    status: str = "pending"
    # Billing cycle: monthly, quarterly, semi_annual, annual, lifetime
    billing_cycle: str = "monthly"
    
    # Pricing
    price: float
    currency: str = "USD"
    discount_percentage: float = 0.0
    discount_code: Optional[str] = None
    final_price: float  # After discount
    
    # Trial information
    is_trial: bool = False
    trial_days: int = 0
    trial_started_at: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    
    # Subscription period
    started_at: datetime = Field(default_factory=datetime.now)
    expires_at: datetime
    next_billing_date: Optional[datetime] = None
    
    # Auto-renewal
    auto_renew: bool = True
    auto_renew_disabled_at: Optional[datetime] = None
    
    # Payment information: credit_card, debit_card, paypal, stripe, bank_transfer, crypto, other
    payment_method: Optional[str] = None
    payment_provider: Optional[str] = None  # e.g., "stripe", "paypal"
    payment_provider_customer_id: Optional[str] = None
    payment_provider_subscription_id: Optional[str] = None
    last_payment_date: Optional[datetime] = None
    # Payment status: pending, completed, failed, refunded, partial_refund
    last_payment_status: Optional[str] = None
    last_payment_amount: Optional[float] = None
    
    # Card details (last 4 digits only for security)
    card_last_four: Optional[str] = None
    card_brand: Optional[str] = None
    card_expiry_month: Optional[int] = None
    card_expiry_year: Optional[int] = None
    
    # Cancellation
    cancelled_at: Optional[datetime] = None
    cancelled_by_user_id: Optional[int] = None
    cancellation_reason: Optional[str] = None
    cancellation_feedback: Optional[str] = None
    scheduled_cancellation_date: Optional[datetime] = None  # Cancel at period end
    
    # Upgrade/Downgrade tracking
    previous_plan: Optional[str] = None
    plan_changed_at: Optional[datetime] = None
    upgrade_count: int = 0
    downgrade_count: int = 0
    
    # Billing history
    total_paid: float = 0.0
    total_refunded: float = 0.0
    successful_payments: int = 0
    failed_payments: int = 0
    
    # Features and limits based on plan
    features: Optional[dict] = None  # Plan-specific features
    upload_limit_gb: Optional[int] = None
    video_quality_limit: Optional[str] = None
    concurrent_streams: int = 1
    download_allowed: bool = False
    ad_free: bool = False
    
    # Grace period
    grace_period_days: int = 3
    in_grace_period: bool = False
    grace_period_ends_at: Optional[datetime] = None
    
    # Notes and metadata
    notes: Optional[str] = None
    metadata: Optional[dict] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
