from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime, timedelta

db = client['videohub']


def create_subscription(subscription_data, user_id):
    """Create a new subscription for a user"""
    subscription_dict = subscription_data.dict()
    subscription_dict['user_id'] = user_id
    subscription_dict['status'] = 'active'
    subscription_dict['created_at'] = datetime.now()
    subscription_dict['started_at'] = datetime.now()
    
    # Calculate expiration based on billing cycle
    if subscription_dict['billing_cycle'] == 'monthly':
        subscription_dict['expires_at'] = datetime.now() + timedelta(days=30)
    elif subscription_dict['billing_cycle'] == 'yearly':
        subscription_dict['expires_at'] = datetime.now() + timedelta(days=365)
    
    result = db['subscriptions'].insert_one(subscription_dict)
    return str(result.inserted_id)


def get_subscription_by_id(subscription_id):
    """Get subscription by ID - checks both subscription_plans and subscriptions"""
    # Try subscription_plans first
    subscription = db['subscription_plans'].find_one({'_id': ObjectId(subscription_id)})
    
    # If not found in plans, try subscriptions collection
    if not subscription:
        subscription = db['subscriptions'].find_one({'_id': ObjectId(subscription_id)})
    
    if subscription:
        subscription['id'] = str(subscription['_id'])
        subscription.pop('_id')
    return subscription


def get_user_active_subscription(user_id):
    """Get user's active subscription"""
    subscription = db['subscriptions'].find_one({
        'user_id': user_id,
        'status': 'active'
    })
    if subscription:
        subscription['id'] = str(subscription['_id'])
        subscription.pop('_id')
    return subscription


def get_user_subscription_history(user_id, skip=0, limit=20):
    """Get user's subscription history"""
    subscriptions = list(db['subscriptions'].find({'user_id': user_id})
                        .sort('created_at', -1)
                        .skip(skip)
                        .limit(limit))
    for subscription in subscriptions:
        subscription['id'] = str(subscription['_id'])
        subscription.pop('_id')
    return subscriptions


def update_subscription(subscription_id, update_data, user_id):
    """Update subscription settings"""
    subscription = get_subscription_by_id(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if subscription.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['subscriptions'].update_one(
        {'_id': ObjectId(subscription_id)},
        {'$set': update_data.dict(exclude_unset=True)}
    )
    return get_subscription_by_id(subscription_id)


def cancel_subscription(subscription_id, user_id):
    """Cancel a subscription"""
    subscription = get_subscription_by_id(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if subscription.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['subscriptions'].update_one(
        {'_id': ObjectId(subscription_id)},
        {'$set': {'status': 'cancelled', 'cancelled_at': datetime.now()}}
    )
    return result.modified_count > 0


def upgrade_subscription(subscription_id, new_plan, user_id):
    """Upgrade subscription to a higher plan"""
    subscription = get_subscription_by_id(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if subscription.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['subscriptions'].update_one(
        {'_id': ObjectId(subscription_id)},
        {'$set': {'plan': new_plan, 'updated_at': datetime.now()}}
    )
    return result.modified_count > 0


def downgrade_subscription(subscription_id, new_plan, user_id):
    """Downgrade subscription to a lower plan"""
    subscription = get_subscription_by_id(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if subscription.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['subscriptions'].update_one(
        {'_id': ObjectId(subscription_id)},
        {'$set': {'plan': new_plan, 'updated_at': datetime.now()}}
    )
    return result.modified_count > 0
