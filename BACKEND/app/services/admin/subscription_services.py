"""
Admin Subscription Services
Manage subscriptions for admin panel
"""

from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime
from fastapi import HTTPException
from typing import List, Dict, Any

db = client['videohub']


def get_all_subscriptions(skip: int = 0, limit: int = 20, status: str = None, plan: str = None, search: str = None):
    """Get all subscription plans with filters"""
    query = {}
    
    # Filter by status
    if status:
        query['status'] = status
    
    # Filter by plan
    if plan:
        query['plan'] = plan
    
    # Search by subscription name
    if search:
        query['$or'] = [
            {'subscription_name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
        ]
    
    total = db['subscription_plans'].count_documents(query)
    
    subscriptions = list(db['subscription_plans'].find(query)
                        .sort('created_at', -1)
                        .skip(skip)
                        .limit(limit))
    
    for subscription in subscriptions:
        subscription['id'] = str(subscription['_id'])
        subscription.pop('_id')
    
    return {
        "subscriptions": subscriptions,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit
    }


def get_subscription_stats():
    """Get subscription plan statistics for admin dashboard"""
    
    # Count by status
    total_subscriptions = db['subscription_plans'].count_documents({})
    active_subscriptions = db['subscription_plans'].count_documents({'status': 'active'})
    trial_subscriptions = db['subscription_plans'].count_documents({'status': 'trial'})
    inactive_subscriptions = db['subscription_plans'].count_documents({'status': 'inactive'})
    pending_subscriptions = db['subscription_plans'].count_documents({'status': 'pending'})
    
    # Revenue calculation (sum of price for active plans)
    pipeline = [
        {'$match': {'status': 'active'}},
        {'$group': {
            '_id': None,
            'total_revenue': {'$sum': '$price'}
        }}
    ]
    revenue_result = list(db['subscription_plans'].aggregate(pipeline))
    monthly_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0.0
    
    # Plan distribution
    plan_pipeline = [
        {'$group': {
            '_id': '$plan',
            'count': {'$sum': 1}
        }}
    ]
    plan_results = list(db['subscription_plans'].aggregate(plan_pipeline))
    plan_distribution = {item['_id']: item['count'] for item in plan_results}
    
    return {
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "trial_subscriptions": trial_subscriptions,
        "monthly_revenue": monthly_revenue,
        "plan_distribution": plan_distribution
    }


def admin_update_subscription(subscription_id: str, update_data: Dict[str, Any]):
    """Admin can update subscription plans"""
    # Try subscription_plans first
    subscription = db['subscription_plans'].find_one({'_id': ObjectId(subscription_id)})
    collection_name = 'subscription_plans'
    
    # If not found in plans, check subscriptions (user subscriptions)
    if not subscription:
        subscription = db['subscriptions'].find_one({'_id': ObjectId(subscription_id)})
        collection_name = 'subscriptions'
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # For subscription plans, recalculate duration if needed
    if collection_name == 'subscription_plans' and ('duration_value' in update_data or 'duration_unit' in update_data):
        duration_value = update_data.get('duration_value', subscription.get('duration_value', 1))
        duration_unit = update_data.get('duration_unit', subscription.get('duration_unit', 'month'))
        
        duration_map = {
            'hour': duration_value / 24,
            'day': duration_value,
            'month': duration_value * 30,
            'year': duration_value * 365
        }
        update_data['duration_days'] = duration_map.get(duration_unit, 30)
    
    update_data['updated_at'] = datetime.now()
    
    result = db[collection_name].update_one(
        {'_id': ObjectId(subscription_id)},
        {'$set': update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update subscription")
    
    # Get updated subscription
    updated = db[collection_name].find_one({'_id': ObjectId(subscription_id)})
    updated['id'] = str(updated['_id'])
    updated.pop('_id')
    return updated


def admin_cancel_subscription(subscription_id: str, reason: str = None):
    """Admin can cancel any subscription"""
    subscription = db['subscriptions'].find_one({'_id': ObjectId(subscription_id)})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    update_data = {
        'status': 'cancelled',
        'cancelled_at': datetime.now(),
        'cancellation_reason': reason or 'Admin cancelled',
        'updated_at': datetime.now()
    }
    
    result = db['subscriptions'].update_one(
        {'_id': ObjectId(subscription_id)},
        {'$set': update_data}
    )
    
    return result.modified_count > 0


def admin_delete_subscription(subscription_id: str):
    """Admin can delete a subscription plan or user subscription (use with caution)"""
    # Try subscription_plans first
    result = db['subscription_plans'].delete_one({'_id': ObjectId(subscription_id)})
    
    # If not found in plans, try subscriptions collection
    if result.deleted_count == 0:
        result = db['subscriptions'].delete_one({'_id': ObjectId(subscription_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return True


def get_user_subscriptions(user_id: int):
    """Get all subscriptions for a specific user"""
    subscriptions = list(db['subscriptions'].find({'user_id': user_id}).sort('created_at', -1))
    
    for subscription in subscriptions:
        subscription['id'] = str(subscription['_id'])
        subscription.pop('_id')
    
    return subscriptions


def get_all_subscription_plans():
    """Get all active subscription plan definitions"""
    plans = list(db['subscription_plans'].find({'is_active': True}).sort('price_inr', 1))
    
    # Convert to the format expected by frontend (keyed by plan name)
    plans_dict = {}
    for plan in plans:
        plan_name = plan['name']
        plan['id'] = str(plan['_id'])
        plan.pop('_id')
        plans_dict[plan_name] = plan
    
    return plans_dict
