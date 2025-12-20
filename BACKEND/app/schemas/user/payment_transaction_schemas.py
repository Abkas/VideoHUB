from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Payment Transaction Create
class PaymentTransactionCreate(BaseModel):
    subscription_id: int
    amount: float
    payment_method: str
    payment_provider: str
    transaction_type: str  # subscription, upgrade, renewal, refund


# Payment Transaction Response
class PaymentTransactionResponse(BaseModel):
    id: int
    subscription_id: int
    user_id: int
    amount: float
    currency: str = "USD"
    status: str
    payment_method: str
    payment_provider: str
    provider_transaction_id: Optional[str] = None
    transaction_type: str
    invoice_number: Optional[str] = None
    invoice_url: Optional[str] = None
    receipt_url: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
