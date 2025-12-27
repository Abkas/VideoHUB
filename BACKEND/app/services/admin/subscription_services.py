from datetime import datetime
from app.core.database import client
from bson.objectid import ObjectId
from typing import Optional

db = client['videohub']


def get_all_subscription_plans():
    """Get all subscription plans from database"""
    plans = list(db['subscription_plans'].find({'status': 'active'}).sort('duration_seconds', 1))
    for plan in plans:
        plan['id'] = str(plan['_id'])
        plan.pop('_id', None)
    return plans


def create_subscription_plan(plan_data: dict) -> str:
    """Create a new subscription plan"""
    plan_data['created_at'] = datetime.utcnow()
    plan_data['updated_at'] = datetime.utcnow()
    plan_data['status'] = 'active'
    
    result = db['subscription_plans'].insert_one(plan_data)
    return str(result.inserted_id)


def update_subscription_plan(plan_id: str, update_data: dict):
    """Update a subscription plan"""
    update_data['updated_at'] = datetime.utcnow()
    db['subscription_plans'].update_one(
        {'_id': ObjectId(plan_id)},
        {'$set': update_data}
    )
    return get_subscription_plan_by_id(plan_id)


def delete_subscription_plan(plan_id: str) -> bool:
    """Delete a subscription plan (soft delete by setting status to inactive)"""
    result = db['subscription_plans'].update_one(
        {'_id': ObjectId(plan_id)},
        {'$set': {'status': 'inactive', 'updated_at': datetime.utcnow()}}
    )
    return result.modified_count > 0


def get_subscription_plan_by_id(plan_id: str):
    """Get subscription plan by ID"""
    plan = db['subscription_plans'].find_one({'_id': ObjectId(plan_id)})
    if plan:
        plan['id'] = str(plan['_id'])
        plan.pop('_id', None)
    return plan


def get_subscription_stats():
    """Get subscription statistics"""
    now = datetime.utcnow()
    
    # Count active subscriptions
    active_subscriptions = db['time_subscriptions'].count_documents({
        'expires_at': {'$gt': now}
    })
    
    # Count total subscriptions (all time)
    total_subscriptions = db['time_subscriptions'].count_documents({})
    
    # Count expired subscriptions
    expired_subscriptions = db['time_subscriptions'].count_documents({
        'expires_at': {'$lte': now}
    })
    
    # Get subscription history (recent purchases)
    recent_subscriptions = list(
        db['time_subscriptions'].find()
        .sort('created_at', -1)
        .limit(50)
    )
    
    for sub in recent_subscriptions:
        sub['id'] = str(sub['_id'])
        sub.pop('_id', None)
        # Check if active
        if sub.get('expires_at'):
            sub['is_active'] = sub['expires_at'] > now
        else:
            sub['is_active'] = False
    
    return {
        'active_users': active_subscriptions,
        'total_subscriptions': total_subscriptions,
        'expired_subscriptions': expired_subscriptions,
        'recent_subscriptions': recent_subscriptions
    }


def get_all_subscriptions(skip: int = 0, limit: int = 20):
    """Get all user subscriptions with pagination"""
    subscriptions = list(
        db['time_subscriptions'].find()
        .sort('created_at', -1)
        .skip(skip)
        .limit(limit)
    )
    
    now = datetime.utcnow()
    for sub in subscriptions:
        sub['id'] = str(sub['_id'])
        sub.pop('_id', None)
        if sub.get('expires_at'):
            sub['is_active'] = sub['expires_at'] > now
            sub['remaining_seconds'] = max(0, int((sub['expires_at'] - now).total_seconds()))
        else:
            sub['is_active'] = False
            sub['remaining_seconds'] = 0
    
    total = db['time_subscriptions'].count_documents({})
    
    return {
        'subscriptions': subscriptions,
        'total': total,
        'skip': skip,
        'limit': limit
    }
