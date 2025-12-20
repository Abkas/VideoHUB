from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user.payment_transaction_schemas import PaymentTransactionCreate, PaymentTransactionResponse
from app.services.user.payment_transaction_services import (
    create_payment_transaction,
    get_payment_by_id,
    get_user_payment_history,
    request_refund
)
from app.core.security import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_payment(payment_data: PaymentTransactionCreate, current_user: dict = Depends(get_current_user)):
    """Create a new payment transaction"""
    transaction_id = create_payment_transaction(payment_data)
    return {"message": "Payment transaction created", "transaction_id": transaction_id}


@router.get("/me")
def get_my_payment_history(skip: int = 0, limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get current user's payment history"""
    payments = get_user_payment_history(current_user['user_id'], skip, limit)
    return {"payments": payments, "count": len(payments)}


@router.get("/{transaction_id}")
def get_payment_transaction(transaction_id: str, current_user: dict = Depends(get_current_user)):
    """Get payment transaction details"""
    payment = get_payment_by_id(transaction_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    
    # Check if user owns this transaction
    if payment.get('user_id') != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return payment


@router.post("/{transaction_id}/refund")
def refund_payment(transaction_id: str, current_user: dict = Depends(get_current_user)):
    """Request refund for a payment"""
    success = request_refund(transaction_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to request refund")
    return {"message": "Refund requested successfully"}


@router.get("/{transaction_id}/invoice")
def get_invoice(transaction_id: str, current_user: dict = Depends(get_current_user)):
    """Get invoice for a payment"""
    payment = get_payment_by_id(transaction_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    
    if payment.get('user_id') != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # TODO: Generate invoice PDF or return invoice URL
    return {"invoice_url": payment.get('invoice_url')}


@router.get("/{transaction_id}/receipt")
def get_receipt(transaction_id: str, current_user: dict = Depends(get_current_user)):
    """Get receipt for a payment"""
    payment = get_payment_by_id(transaction_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    
    if payment.get('user_id') != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # TODO: Generate receipt PDF or return receipt URL
    return {"receipt_url": payment.get('receipt_url')}
