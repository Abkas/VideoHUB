from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.services.user.subscription_services import (
    get_subscription_status,
    subscribe_user,
    extend_subscription,
    get_all_plans
)
from pydantic import BaseModel

router = APIRouter(prefix="/subscription", tags=["Subscription"])


class SubscribeRequest(BaseModel):
    plan_id: str


@router.get("/status")
def get_status(current_user: dict = Depends(get_current_user)):
    """
    Get current user's subscription status
    Returns: expires_at, remaining_seconds, is_active
    """
    status_data = get_subscription_status(current_user['user_id'])
    return status_data


@router.post("/subscribe")
def subscribe(request: SubscribeRequest, current_user: dict = Depends(get_current_user)):
    """
    Subscribe to a plan or extend existing subscription
    Accepts plan_id: "30_min", "1_hour", "1_day", "1_week"
    """
    try:
        result = subscribe_user(current_user['user_id'], request.plan_id)
        return {
            "message": "Subscription updated successfully",
            **result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/extend")
def extend(request: SubscribeRequest, current_user: dict = Depends(get_current_user)):
    """
    Extend subscription (same logic as subscribe)
    """
    try:
        result = extend_subscription(current_user['user_id'], request.plan_id)
        return {
            "message": "Subscription extended successfully",
            **result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/plans")
def get_plans():
    """
    Get all available subscription plans (public endpoint)
    """
    plans = get_all_plans()
    return {
        "plans": plans,
        "total": len(plans)
    }
