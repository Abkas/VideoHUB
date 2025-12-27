"""
Admin Subscription Routes
Manage all subscriptions from admin panel
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.user.subscription_schemas import (
    SubscriptionResponse, 
    SubscriptionListResponse,
    SubscriptionStats,
    SubscriptionUpdate,
    AdminSubscriptionCreate,
    SubscriptionPlanResponse,
    SubscriptionPlanListResponse,
    SubscriptionPlanStats
)
from app.services.admin.subscription_services import (
    get_all_subscriptions,
    get_subscription_stats,
    admin_update_subscription,
    admin_cancel_subscription,
    admin_delete_subscription,
    get_user_subscriptions
)
from app.core.security import get_admin_user
from app.services.admin.subscription_services import get_all_subscription_plans
from typing import Optional

router = APIRouter(prefix="/admin/subscriptions", tags=["Admin Subscriptions"])


@router.get("/stats", response_model=SubscriptionPlanStats)
def get_stats(admin: dict = Depends(get_admin_user)):
    """Get subscription plan statistics for dashboard"""
    return get_subscription_stats()


@router.get("/plans")
def get_plans(admin: dict = Depends(get_admin_user)):
    """Get all subscription plans from database"""
    plans = get_all_subscription_plans()
    return {
        "plans": plans,
        "total": len(plans)
    }


@router.get("/", response_model=SubscriptionPlanListResponse)
def list_subscriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    plan: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    admin: dict = Depends(get_admin_user)
):
    """Get all subscription plans with filters"""
    return get_all_subscriptions(skip, limit, status, plan, search)


@router.post("/create", status_code=201)
def create_subscription_plan(
    subscription_data: AdminSubscriptionCreate,
    admin: dict = Depends(get_admin_user)
):
    """Create a new subscription plan (admin only)"""
    from datetime import datetime, timedelta
    from app.core.database import client
    
    db = client['videohub']
    
    # Calculate duration in days
    duration_map = {
        'hour': subscription_data.duration_value / 24,
        'day': subscription_data.duration_value,
        'month': subscription_data.duration_value * 30,
        'year': subscription_data.duration_value * 365
    }
    duration_days = duration_map.get(subscription_data.duration_unit, 30)
    
    # Fetch plan details from DB
    plan = db['subscription_plans'].find_one({'name': subscription_data.plan})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found in database")
    # Use custom price if provided, otherwise use default based on currency
    if subscription_data.custom_price:
        price = subscription_data.custom_price
    else:
        currency_lower = subscription_data.currency.lower()
        price_key = f'price_{currency_lower}'
        price = plan.get(price_key, plan.get('price_inr', 99))
    # Create subscription document
    subscription_doc = {
        'subscription_name': subscription_data.subscription_name,
        'plan': subscription_data.plan,
        'status': subscription_data.status,
        'billing_cycle': 'custom',
        'duration_value': subscription_data.duration_value,
        'duration_unit': subscription_data.duration_unit,
        'duration_days': duration_days,
        'price': price,
        'currency': subscription_data.currency,
        'description': subscription_data.description,
        'features': plan.get('features', []),
        'max_quality': plan.get('max_quality', '720p'),
        'concurrent_streams': plan.get('concurrent_streams', 1),
        'downloads_per_month': plan.get('downloads_per_month', 0),
        'ad_free': plan.get('ad_free', False),
        'created_by': admin['user_id'],
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    
    result = db['subscription_plans'].insert_one(subscription_doc)
    subscription_doc['_id'] = str(result.inserted_id)
    
    return {
        "message": "Subscription plan created successfully",
        "subscription": subscription_doc
    }


@router.get("/{subscription_id}")
def get_subscription(subscription_id: str, admin: dict = Depends(get_admin_user)):
    """Get subscription details by ID"""
    from app.services.user.subscription_services import get_subscription_by_id
    subscription = get_subscription_by_id(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@router.get("/user/{user_id}")
def get_user_subscription_history(user_id: int, admin: dict = Depends(get_admin_user)):
    """Get all subscriptions for a specific user"""
    subscriptions = get_user_subscriptions(user_id)
    return {
        "user_id": user_id,
        "subscriptions": subscriptions,
        "count": len(subscriptions)
    }


@router.put("/{subscription_id}")
def update_subscription(
    subscription_id: str,
    update_data: SubscriptionUpdate,
    admin: dict = Depends(get_admin_user)
):
    """Update subscription (admin only)"""
    updated = admin_update_subscription(subscription_id, update_data.dict(exclude_unset=True))
    return {
        "message": "Subscription updated successfully",
        "subscription": updated
    }


@router.post("/{subscription_id}/cancel")
def cancel_subscription(
    subscription_id: str,
    reason: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Cancel subscription (admin)"""
    success = admin_cancel_subscription(subscription_id, reason)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to cancel subscription")
    return {"message": "Subscription cancelled successfully"}


@router.delete("/{subscription_id}")
def delete_subscription(subscription_id: str, admin: dict = Depends(get_admin_user)):
    """Delete subscription (admin only - use with caution)"""
    success = admin_delete_subscription(subscription_id)
    return {"message": "Subscription deleted successfully"}


@router.post("/{subscription_id}/extend")
def extend_subscription(
    subscription_id: str,
    days: int = Query(..., ge=1, le=365),
    admin: dict = Depends(get_admin_user)
):
    """Extend subscription expiry date"""
    from datetime import timedelta
    from app.services.user.subscription_services import get_subscription_by_id
    
    subscription = get_subscription_by_id(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    from datetime import datetime
    current_expires = subscription.get('expires_at')
    if isinstance(current_expires, str):
        current_expires = datetime.fromisoformat(current_expires.replace('Z', '+00:00'))
    
    new_expires = current_expires + timedelta(days=days)
    
    update_data = {
        'expires_at': new_expires,
        'updated_at': datetime.now()
    }
    
    updated = admin_update_subscription(subscription_id, update_data)
    return {
        "message": f"Subscription extended by {days} days",
        "new_expires_at": new_expires,
        "subscription": updated
    }
