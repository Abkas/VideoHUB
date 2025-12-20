from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['beads_db']


def create_payment_transaction(payment_data):
    """Create a new payment transaction"""
    payment_dict = payment_data.dict()
    payment_dict['created_at'] = datetime.now()
    result = db['payment_transactions'].insert_one(payment_dict)
    return str(result.inserted_id)


def get_payment_by_id(transaction_id):
    """Get payment transaction by ID"""
    payment = db['payment_transactions'].find_one({'_id': ObjectId(transaction_id)})
    if payment:
        payment['id'] = str(payment['_id'])
        payment.pop('_id')
    return payment


def get_user_payment_history(user_id, skip=0, limit=20):
    """Get payment history for a user"""
    payments = list(db['payment_transactions'].find({'user_id': user_id})
                   .sort('created_at', -1)
                   .skip(skip)
                   .limit(limit))
    for payment in payments:
        payment['id'] = str(payment['_id'])
        payment.pop('_id')
    return payments


def request_refund(transaction_id, user_id):
    """Request refund for a payment"""
    payment = get_payment_by_id(transaction_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    
    if payment.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if payment.get('status') == 'refunded':
        raise HTTPException(status_code=400, detail="Payment already refunded")
    
    result = db['payment_transactions'].update_one(
        {'_id': ObjectId(transaction_id)},
        {'$set': {'status': 'refund_requested', 'refund_requested_at': datetime.now()}}
    )
    return result.modified_count > 0
