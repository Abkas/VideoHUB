from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.schemas.video.video_schemas import VideoCreate, VideoUpdate
from app.services.video.video_services import (
    create_video,
    get_video_by_id,
    get_all_videos,
    get_trending_videos,
    get_featured_videos,
    get_videos_by_user,
    update_video,
    delete_video,
    increment_video_view
)
from app.core.security import get_current_user

router = APIRouter(prefix="/videos", tags=["Videos"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def upload_video(video_data: VideoCreate, current_user: dict = Depends(get_current_user)):
    """Upload a new video"""
    video_id = create_video(video_data, current_user['user_id'])
    return {"message": "Video created successfully", "video_id": video_id}


@router.get("/")
def get_all_videos_list(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[str] = None,
    sort_by: str = "created_at"
):
    """Get all videos with filters and pagination"""
    videos = get_all_videos(skip, limit, search, category, tags, sort_by)
    return {"videos": videos, "count": len(videos)}


@router.get("/trending")
def get_trending_videos_list(limit: int = 20):
    """Get trending videos"""
    videos = get_trending_videos(limit)
    return {"videos": videos, "count": len(videos)}


@router.get("/featured")
def get_featured_videos_list(limit: int = 20):
    """Get featured videos"""
    videos = get_featured_videos(limit)
    return {"videos": videos, "count": len(videos)}


@router.get("/{video_id}")
def get_video_details(video_id: str):
    """Get video details by ID"""
    video = get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.put("/{video_id}")
def update_video_details(video_id: str, update_data: VideoUpdate, current_user: dict = Depends(get_current_user)):
    """Update video details (owner only)"""
    updated_video = update_video(video_id, update_data, current_user['user_id'])
    return updated_video


@router.delete("/{video_id}")
def delete_video_by_id(video_id: str, current_user: dict = Depends(get_current_user)):
    """Delete video (owner only)"""
    success = delete_video(video_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"message": "Video deleted successfully"}


@router.get("/user/{user_id}")
def get_user_videos(user_id: str, skip: int = 0, limit: int = 20):
    """Get all videos uploaded by a specific user"""
    videos = get_videos_by_user(user_id, skip, limit)
    return {"videos": videos, "count": len(videos)}


@router.post("/{video_id}/view")
def increment_view_count(video_id: str):
    """Increment video view count"""
    success = increment_video_view(video_id)
    if not success:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"message": "View count incremented"}
