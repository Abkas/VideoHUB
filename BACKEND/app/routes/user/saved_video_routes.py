from fastapi import APIRouter, Depends, status, Query
from app.core.security import get_current_user
from app.schemas.user.saved_video_schemas import SavedVideoResponse
from app.services.user import saved_video_services

router = APIRouter(prefix="/saved", tags=["Saved Videos"])


@router.post("/{video_id}", status_code=status.HTTP_201_CREATED, response_model=SavedVideoResponse)
def save_video_endpoint(video_id: str, current_user: dict = Depends(get_current_user)):
    """Save a video to favorites"""
    user_id = current_user['user_id']
    result = saved_video_services.save_video(user_id, video_id)
    return result


@router.delete("/{video_id}", response_model=SavedVideoResponse)
def unsave_video_endpoint(video_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a video from favorites"""
    user_id = current_user['user_id']
    result = saved_video_services.unsave_video(user_id, video_id)
    return result


@router.get("/{video_id}/status", response_model=SavedVideoResponse)
def get_save_status_endpoint(video_id: str, current_user: dict = Depends(get_current_user)):
    """Check if video is saved"""
    user_id = current_user['user_id']
    result = saved_video_services.get_save_status(user_id, video_id)
    return result


@router.get("/me")
def get_my_saved_videos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get user's saved videos with details"""
    user_id = current_user['user_id']
    videos = saved_video_services.get_user_saved_videos(user_id, skip, limit)
    total_count = saved_video_services.get_saved_videos_count(user_id)
    
    return {
        "videos": videos,
        "count": len(videos),
        "total": total_count
    }

