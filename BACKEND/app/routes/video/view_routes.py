from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.schemas.video.view_schemas import ViewCreate
from app.services.video.view_services import (
    record_view,
    get_video_views,
    get_video_analytics,
    get_user_view_history
)
from app.core.security import get_current_user

router = APIRouter(prefix="/views", tags=["Views"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def record_video_view(view_data: ViewCreate, current_user: Optional[dict] = Depends(get_current_user)):
    """Record a video view"""
    user_id = current_user['user_id'] if current_user else None
    view_id = record_view(view_data, user_id)
    return {"message": "View recorded", "view_id": view_id}


@router.get("/video/{video_id}")
def get_views_for_video(video_id: str):
    """Get view count and analytics for a video"""
    views_data = get_video_views(video_id)
    return views_data


@router.get("/video/{video_id}/analytics")
def get_analytics_for_video(video_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed analytics for a video (owner/admin only)"""
    analytics = get_video_analytics(video_id, current_user['user_id'])
    return analytics


@router.get("/me")
def get_my_view_history_list(skip: int = 0, limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get current user's view history"""
    history = get_user_view_history(current_user['user_id'], skip, limit)
    return {"history": history, "count": len(history)}
