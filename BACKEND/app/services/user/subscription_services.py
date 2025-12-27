from datetime import datetime, timedelta
from app.core.database import client
from bson.objectid import ObjectId

db = client['videohub']

# Plan definitions: plan_id -> duration in seconds
PLANS = {
    "30_min": 30 * 60,  # 30 minutes
    "1_hour": 60 * 60,  # 1 hour
    "1_day": 24 * 60 * 60,  # 24 hours
    "1_week": 7 * 24 * 60 * 60,  # 7 days
}

# Plan metadata for display
PLAN_METADATA = {
    "30_min": {
        "name": "30 Minutes",
        "duration_display": "30 Minutes",
        "price": 29,
        "currency": "Rs.",
        "tags": ["Most Popular"]
    },
    "1_hour": {
        "name": "1 Hour",
        "duration_display": "1 Hour",
        "price": 49,
        "currency": "Rs.",
        "tags": ["Loved"]
    },
    "1_day": {
        "name": "1 Day",
        "duration_display": "24 Hours",
        "price": 149,
        "currency": "Rs.",
        "tags": []
    },
    "1_week": {
        "name": "1 Week",
        "duration_display": "7 Days",
        "price": 399,
        "currency": "Rs.",
        "tags": []
    },
}


def get_subscription_status(user_id: int) -> dict:
    """
    Get user's subscription status
    Returns: expires_at, remaining_seconds, is_active
    """
    subscription = db['time_subscriptions'].find_one({'user_id': user_id})
    
    if not subscription:
        return {
            "expires_at": None,
            "remaining_seconds": 0,
            "is_active": False
        }
    
    expires_at = subscription['expires_at']
    now = datetime.utcnow()
    
    # Check if expired
    if expires_at <= now:
        return {
            "expires_at": expires_at.isoformat(),
            "remaining_seconds": 0,
            "is_active": False
        }
    
    # Calculate remaining seconds
    remaining = (expires_at - now).total_seconds()
    
    return {
        "expires_at": expires_at.isoformat(),
        "remaining_seconds": int(remaining),
        "is_active": True
    }


def subscribe_user(user_id: int, plan_id: str) -> dict:
    """
    Subscribe user to a plan or extend existing subscription
    If expires_at is in the future, add time to it
    If expired or null, set expires_at = now + plan duration
    """
    if plan_id not in PLANS:
        raise ValueError(f"Invalid plan_id: {plan_id}")
    
    duration_seconds = PLANS[plan_id]
    now = datetime.utcnow()
    
    # Get existing subscription
    existing = db['time_subscriptions'].find_one({'user_id': user_id})
    
    if existing and existing.get('expires_at'):
        expires_at = existing['expires_at']
        # If subscription is still active (not expired), add time to it
        if expires_at > now:
            new_expires_at = expires_at + timedelta(seconds=duration_seconds)
        else:
            # Expired, start fresh from now
            new_expires_at = now + timedelta(seconds=duration_seconds)
    else:
        # No subscription or no expires_at, start fresh
        new_expires_at = now + timedelta(seconds=duration_seconds)
    
    # Update or create subscription
    subscription_data = {
        'user_id': user_id,
        'expires_at': new_expires_at,
        'updated_at': now
    }
    
    if existing:
        # Update existing
        db['time_subscriptions'].update_one(
            {'user_id': user_id},
            {'$set': subscription_data}
        )
    else:
        # Create new
        subscription_data['created_at'] = now
        db['time_subscriptions'].insert_one(subscription_data)
    
    return get_subscription_status(user_id)


def extend_subscription(user_id: int, plan_id: str) -> dict:
    """
    Extend subscription (same logic as subscribe)
    """
    return subscribe_user(user_id, plan_id)


def get_all_plans() -> list:
    """
    Get all available subscription plans from database
    """
    # Fetch plans from database
    db_plans = list(db['subscription_plans'].find({'status': 'active'}).sort('duration_seconds', 1))
    
    plans = []
    for plan in db_plans:
        # Calculate duration display
        duration_seconds = plan.get('duration_seconds', 0)
        duration_display = format_duration(duration_seconds)
        
        plans.append({
            "plan_id": str(plan['_id']),  # Use MongoDB _id as plan_id
            "name": plan.get('name', 'Plan'),
            "duration_seconds": duration_seconds,
            "duration_display": duration_display,
            "price": plan.get('price', 0),
            "currency": plan.get('currency', 'Rs.'),
            "tags": plan.get('tags', []),
            "description": plan.get('description', '')
        })
    
    # If no plans in database, return empty list (admin should create plans)
    return plans


def format_duration(seconds: int) -> str:
    """Format duration in seconds to human-readable string"""
    if seconds < 60:
        return f"{seconds} Seconds"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"{minutes} Minute{'s' if minutes != 1 else ''}"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours} Hour{'s' if hours != 1 else ''}"
    else:
        days = seconds // 86400
        return f"{days} Day{'s' if days != 1 else ''}"


def subscribe_user(user_id: int, plan_id: str) -> dict:
    """
    Subscribe user to a plan or extend existing subscription
    If expires_at is in the future, add time to it
    If expired or null, set expires_at = now + plan duration
    """
    now = datetime.utcnow()
    
    # Get plan from database
    plan = None
    try:
        # Try to find by MongoDB ObjectId
        plan = db['subscription_plans'].find_one({'_id': ObjectId(plan_id), 'status': 'active'})
    except:
        pass
    
    if not plan:
        # Fallback: try to find by plan_id field or name
        plan = db['subscription_plans'].find_one({
            '$or': [
                {'plan_id': plan_id, 'status': 'active'},
                {'name': plan_id, 'status': 'active'}
            ]
        })
    
    if not plan:
        raise ValueError(f"Invalid plan_id: {plan_id}. Plan not found or inactive.")
    
    duration_seconds = plan.get('duration_seconds', 0)
    if duration_seconds <= 0:
        raise ValueError("Plan duration must be greater than 0")
    
    # Get existing subscription
    existing = db['time_subscriptions'].find_one({'user_id': user_id})
    
    if existing and existing.get('expires_at'):
        expires_at = existing['expires_at']
        # If subscription is still active (not expired), add time to it
        if expires_at > now:
            new_expires_at = expires_at + timedelta(seconds=duration_seconds)
        else:
            # Expired, start fresh from now
            new_expires_at = now + timedelta(seconds=duration_seconds)
    else:
        # No subscription or no expires_at, start fresh
        new_expires_at = now + timedelta(seconds=duration_seconds)
    
    # Update or create subscription
    subscription_data = {
        'user_id': user_id,
        'expires_at': new_expires_at,
        'plan_id': str(plan['_id']),
        'plan_name': plan.get('name', 'Plan'),
        'updated_at': now
    }
    
    if existing:
        # Update existing
        db['time_subscriptions'].update_one(
            {'user_id': user_id},
            {'$set': subscription_data}
        )
    else:
        # Create new
        subscription_data['created_at'] = now
        db['time_subscriptions'].insert_one(subscription_data)
    
    return get_subscription_status(user_id)
