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
    # Validate required fields
    if not plan_data.get('name'):
        raise ValueError("Plan name is required")
    if not isinstance(plan_data.get('duration_seconds', 0), int) or plan_data.get('duration_seconds', 0) <= 0:
        raise ValueError("Duration must be a positive integer in seconds")
    if not isinstance(plan_data.get('price', 0), (int, float)) or plan_data.get('price', 0) < 0:
        raise ValueError("Price must be a non-negative number")

    # Clean and validate tags
    allowed_tags = ['most popular', 'loved', 'best value']
    tags = plan_data.get('tags', [])
    if not isinstance(tags, list):
        tags = []
    # Remove empty strings and duplicates, and validate against allowed tags
    cleaned_tags = []
    for tag in tags:
        if tag and isinstance(tag, str):
            cleaned_tag = tag.strip()
            if cleaned_tag in allowed_tags:
                cleaned_tags.append(cleaned_tag)
    # Remove duplicates
    tags = list(set(cleaned_tags))
    plan_data['tags'] = tags

    plan_data['created_at'] = datetime.utcnow()
    plan_data['updated_at'] = datetime.utcnow()
    plan_data['status'] = 'active'
    
    result = db['subscription_plans'].insert_one(plan_data)
    return str(result.inserted_id)


def update_subscription_plan(plan_id: str, update_data: dict):
    """Update a subscription plan"""
    # Validate fields if provided
    if 'duration_seconds' in update_data:
        if not isinstance(update_data['duration_seconds'], int) or update_data['duration_seconds'] <= 0:
            raise ValueError("Duration must be a positive integer in seconds")
    
    if 'price' in update_data:
        if not isinstance(update_data['price'], (int, float)) or update_data['price'] < 0:
            raise ValueError("Price must be a non-negative number")

    # Clean and validate tags if provided
    if 'tags' in update_data:
        allowed_tags = ['most popular', 'loved', 'best value']
        tags = update_data['tags']
        if not isinstance(tags, list):
            tags = []
        # Remove empty strings and duplicates, and validate against allowed tags
        cleaned_tags = []
        for tag in tags:
            if tag and isinstance(tag, str):
                cleaned_tag = tag.strip()
                if cleaned_tag in allowed_tags:
                    cleaned_tags.append(cleaned_tag)
        # Remove duplicates
        tags = list(set(cleaned_tags))
        update_data['tags'] = tags

    update_data['updated_at'] = datetime.utcnow()
    db['subscription_plans'].update_one(
        {'_id': ObjectId(plan_id)},
        {'$set': update_data}
    )
    return get_subscription_plan_by_id(plan_id)


def delete_subscription_plan(plan_id: str) -> bool:
    """Delete a subscription plan (soft delete by setting status to inactive)"""
    try:
        result = db['subscription_plans'].update_one(
            {'_id': ObjectId(plan_id)},
            {'$set': {'status': 'inactive', 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error deleting plan {plan_id}: {e}")
        return False


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
    
    # Calculate total income earned
    total_income = 0.0
    all_subscriptions = list(db['time_subscriptions'].find({}, {'plan_id': 1}))
    
    for sub in all_subscriptions:
        plan_id = sub.get('plan_id')
        if plan_id:
            try:
                # plan_id is stored as string, convert to ObjectId
                plan = db['subscription_plans'].find_one({'_id': ObjectId(plan_id)}, {'price': 1})
                if plan and 'price' in plan:
                    total_income += plan['price']
            except:
                # Skip invalid plan_ids
                pass
    
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
        'total_income': total_income,
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
