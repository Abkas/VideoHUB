from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PaymentTransaction(BaseModel):
    id: Optional[int] = None
    
    # References
    subscription_id: int
    user_id: int
    
    # Transaction details
    amount: float
    currency: str = "USD"
    # Status: pending, completed, failed, refunded, partial_refund
    status: str = "pending"
    
    # Payment method: credit_card, debit_card, paypal, stripe, bank_transfer, crypto, other
    payment_method: str
    payment_provider: str
    provider_transaction_id: Optional[str] = None
    provider_response: Optional[dict] = None
    
    # Transaction type: subscription, upgrade, renewal, refund
    transaction_type: str
    description: Optional[str] = None
    
    # Billing details
    billing_email: Optional[str] = None
    billing_name: Optional[str] = None
    billing_address: Optional[dict] = None
    
    # Invoice
    invoice_number: Optional[str] = None
    invoice_url: Optional[str] = None
    receipt_url: Optional[str] = None
    
    # Refund information
    refunded_at: Optional[datetime] = None
    refund_amount: Optional[float] = None
    refund_reason: Optional[str] = None
    
    # Failure information
    failure_reason: Optional[str] = None
    failure_code: Optional[str] = None
    retry_count: int = 0
    next_retry_at: Optional[datetime] = None
    
    # Timestamps
    processed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
