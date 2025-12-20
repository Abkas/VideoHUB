from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.video.like_schemas import LikeCreate
from app.services.video.like_services import (
    create_like,
    remove_like,
    get_video_likes,
    get_user_liked_videos,
    get_like_status
)
from app.core.security import get_current_user

router = APIRouter(prefix="/likes", tags=["Likes"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def like_or_dislike_video(like_data: LikeCreate, current_user: dict = Depends(get_current_user)):
    """Like or dislike a video"""
    result = create_like(like_data, current_user['user_id'])
    return result


@router.delete("/{video_id}")
def remove_like_from_video(video_id: int, current_user: dict = Depends(get_current_user)):
    """Remove like/dislike from video"""
    success = remove_like(video_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=404, detail="Like not found")
    return {"message": "Like removed successfully"}


@router.get("/video/{video_id}")
def get_likes_for_video(video_id: int, skip: int = 0, limit: int = 100):
    """Get all likes for a video"""
    likes = get_video_likes(video_id, skip, limit)
    return {"likes": likes, "count": len(likes)}


@router.get("/me")
def get_my_liked_videos_list(skip: int = 0, limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get videos liked by current user"""
    video_ids = get_user_liked_videos(current_user['user_id'], skip, limit)
    return {"video_ids": video_ids, "count": len(video_ids)}


@router.get("/video/{video_id}/status")
def get_user_like_status(video_id: int, current_user: dict = Depends(get_current_user)):
    """Check if current user liked/disliked this video"""
    status_result = get_like_status(video_id, current_user['user_id'])
    return status_result
