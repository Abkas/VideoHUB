from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import get_admin_user
from app.services.admin.subscription_services import (
    get_all_subscription_plans,
    create_subscription_plan,
    update_subscription_plan,
    delete_subscription_plan,
    get_subscription_plan_by_id,
    get_subscription_stats,
    get_all_subscriptions
)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson.objectid import ObjectId

router = APIRouter(prefix="/admin/subscriptions", tags=["Admin Subscriptions"])


class PlanCreate(BaseModel):
    name: str
    duration_seconds: int  # Duration in seconds (must be > 0)
    price: float  # Price must be >= 0
    currency: str = "Rs."
    tags: List[str] = []  # Tags for UI customization (e.g., "Popular", "Best Value", "Premium")
    description: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Premium Plan",
                "duration_seconds": 604800,  # 7 days
                "price": 399.0,
                "currency": "Rs.",
                "tags": ["Premium", "Best Value"],
                "description": "Get unlimited access with premium features"
            }
        }


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    duration_seconds: Optional[int] = None  # Duration in seconds (must be > 0)
    price: Optional[float] = None  # Price must be >= 0
    currency: Optional[str] = None
    tags: Optional[List[str]] = None  # Tags for UI customization (e.g., "Popular", "Best Value", "Premium")
    description: Optional[str] = None
    status: Optional[str] = None  # "active" or "inactive"


@router.get("/stats")
def get_stats(admin: dict = Depends(get_admin_user)):
    """Get subscription statistics"""
    return get_subscription_stats()


@router.get("/plans")
def get_plans(admin: dict = Depends(get_admin_user)):
    """Get all subscription plans"""
    plans = get_all_subscription_plans()
    return {
        "plans": plans,
        "total": len(plans)
    }


@router.post("/plans")
def create_plan(plan_data: PlanCreate, admin: dict = Depends(get_admin_user)):
    """Create a new subscription plan"""
    plan_dict = plan_data.dict()
    plan_id = create_subscription_plan(plan_dict)
    return {
        "message": "Plan created successfully",
        "plan_id": plan_id
    }


@router.put("/plans/{plan_id}")
def update_plan(plan_id: str, plan_data: PlanUpdate, admin: dict = Depends(get_admin_user)):
    """Update a subscription plan"""
    update_dict = plan_data.dict(exclude_unset=True)
    updated = update_subscription_plan(plan_id, update_dict)
    if not updated:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {
        "message": "Plan updated successfully",
        "plan": updated
    }


@router.delete("/plans/{plan_id}")
def delete_plan(plan_id: str, admin: dict = Depends(get_admin_user)):
    """Delete a subscription plan"""
    success = delete_subscription_plan(plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"message": "Plan deleted successfully"}


@router.get("/plans/{plan_id}")
def get_plan(plan_id: str, admin: dict = Depends(get_admin_user)):
    """Get a specific subscription plan"""
    plan = get_subscription_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.get("/tags")
def get_available_tags(admin: dict = Depends(get_admin_user)):
    """Get available tags for subscription plans"""
    return {
        "tags": [
            {"value": "most popular", "label": "Most Popular", "description": "Highlights the plan as the most popular choice"},
            {"value": "loved", "label": "Loved", "description": "Shows the plan is loved by users"},
            {"value": "best value", "label": "Best Value", "description": "Indicates the plan offers the best value"}
        ]
    }


@router.get("/history")
def get_subscription_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin: dict = Depends(get_admin_user)
):
    """Get all subscription history"""
    from app.core.database import client
    from datetime import datetime
    
    db = client['videohub']
    history_records = list(db['subscription_history'].find()
                          .sort('created_at', -1)
                          .skip(skip)
                          .limit(limit))
    
    # Format history records
    for record in history_records:
        record['id'] = str(record['_id'])
        record.pop('_id', None)
        
        # Ensure username and display_name are always set
        if 'username' not in record:
            record['username'] = 'Unknown'
        if 'display_name' not in record:
            record['display_name'] = record.get('username', 'Unknown')
            
        if record.get('username') == 'Unknown':
            user_id = record.get('user_id')
            print(f"Looking up username for user_id: {user_id}")
            if user_id:
                try:
                    user = db['users'].find_one({'_id': ObjectId(user_id)}, {'username': 1, 'display_name': 1})
                    print(f"Found user: {user}")
                    if user:
                        record['username'] = user.get('username', 'Unknown')
                        record['display_name'] = user.get('display_name', user.get('username', 'Unknown'))
                        print(f"Set username to: {record['username']}")
                    else:
                        print("User not found")
                        # As fallback, use part of the user_id
                        record['username'] = f"User_{user_id[:8]}"
                        record['display_name'] = f"User_{user_id[:8]}"
                except Exception as e:
                    print(f"Error looking up user: {e}")
                    record['username'] = f"User_{user_id[:8] if user_id else 'Unknown'}"
                    record['display_name'] = f"User_{user_id[:8] if user_id else 'Unknown'}"
        else:
            print(f"Record already has username: {record.get('username')}")
        
        # Add computed fields
        record['is_active'] = record.get('expires_at', datetime.utcnow()) > datetime.utcnow()
    
    total = db['subscription_history'].count_documents({})
    
    return {
        'subscriptions': history_records,
        'total': total,
        'skip': skip,
        'limit': limit
    }
