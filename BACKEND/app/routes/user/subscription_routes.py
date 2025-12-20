from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user.subscription_schemas import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.services.user.subscription_services import (
    create_subscription,
    get_subscription_by_id,
    get_user_active_subscription,
    get_user_subscription_history,
    update_subscription,
    cancel_subscription,
    upgrade_subscription,
    downgrade_subscription
)
from app.core.security import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user_subscription(subscription_data: SubscriptionCreate, current_user: dict = Depends(get_current_user)):
    """Create a new subscription for current user"""
    subscription_id = create_subscription(subscription_data, current_user['user_id'])
    return {"message": "Subscription created successfully", "subscription_id": subscription_id}


@router.get("/me")
def get_my_subscription(current_user: dict = Depends(get_current_user)):
    """Get current user's active subscription"""
    subscription = get_user_active_subscription(current_user['user_id'])
    if not subscription:
        return {"message": "No active subscription"}
    return subscription


@router.get("/me/history")
def get_subscription_history(skip: int = 0, limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get current user's subscription history"""
    subscriptions = get_user_subscription_history(current_user['user_id'], skip, limit)
    return {"subscriptions": subscriptions, "count": len(subscriptions)}


@router.put("/{subscription_id}")
def update_subscription_settings(subscription_id: str, update_data: SubscriptionUpdate, current_user: dict = Depends(get_current_user)):
    """Update subscription settings (auto-renew, payment method)"""
    updated_subscription = update_subscription(subscription_id, update_data, current_user['user_id'])
    return updated_subscription


@router.post("/{subscription_id}/cancel")
def cancel_user_subscription(subscription_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel subscription"""
    success = cancel_subscription(subscription_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to cancel subscription")
    return {"message": "Subscription cancelled successfully"}


@router.post("/{subscription_id}/upgrade")
def upgrade_user_subscription(subscription_id: str, new_plan: str, current_user: dict = Depends(get_current_user)):
    """Upgrade to a higher plan"""
    success = upgrade_subscription(subscription_id, new_plan, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to upgrade subscription")
    return {"message": "Subscription upgraded successfully"}


@router.post("/{subscription_id}/downgrade")
def downgrade_user_subscription(subscription_id: str, new_plan: str, current_user: dict = Depends(get_current_user)):
    """Downgrade to a lower plan"""
    success = downgrade_subscription(subscription_id, new_plan, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to downgrade subscription")
    return {"message": "Subscription downgraded successfully"}


@router.get("/{subscription_id}")
def get_subscription_details(subscription_id: str, current_user: dict = Depends(get_current_user)):
    """Get subscription details by ID"""
    subscription = get_subscription_by_id(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check if user owns this subscription
    if subscription.get('user_id') != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return subscription
