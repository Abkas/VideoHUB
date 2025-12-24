from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user.follower_schemas import FollowCreate, FollowerResponse, FollowingResponse, FollowUpdate
from app.services.user.follower_services import (
    follow_user,
    unfollow_user,
    get_followers,
    get_following,
    is_following,
    get_follower_count,
    get_following_count,
    update_follow_settings
)
from app.core.security import get_current_user
from typing import List

router = APIRouter(prefix="/followers", tags=["Followers"])


@router.post("/follow", status_code=status.HTTP_201_CREATED)
def follow_user_route(follow_data: FollowCreate, current_user: dict = Depends(get_current_user)):
    """Follow a user"""
    follow_id = follow_user(current_user['user_id'], follow_data.following_id)
    return {"message": "Successfully followed user", "follow_id": follow_id}


@router.delete("/unfollow/{following_id}")
def unfollow_user_route(following_id: str, current_user: dict = Depends(get_current_user)):
    """Unfollow a user"""
    success = unfollow_user(current_user['user_id'], following_id)
    if not success:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    return {"message": "Successfully unfollowed user"}


@router.get("/me/followers", response_model=List[FollowerResponse])
def get_my_followers(skip: int = 0, limit: int = 1000, current_user: dict = Depends(get_current_user)):
    """Get current user's followers"""
    followers = get_followers(current_user['user_id'], skip, limit)
    return followers


@router.get("/me/following", response_model=List[FollowingResponse])
def get_my_following(skip: int = 0, limit: int = 1000, current_user: dict = Depends(get_current_user)):
    """Get users that current user follows"""
    following = get_following(current_user['user_id'], skip, limit)
    return following


@router.get("/{user_id}/followers", response_model=List[FollowerResponse])
def get_user_followers(user_id: str, skip: int = 0, limit: int = 1000):
    """Get followers of a specific user"""
    followers = get_followers(user_id, skip, limit)
    return followers


@router.get("/{user_id}/following", response_model=List[FollowingResponse])
def get_user_following(user_id: str, skip: int = 0, limit: int = 1000):
    """Get users that a specific user follows"""
    following = get_following(user_id, skip, limit)
    return following


@router.get("/is-following/{user_id}")
def check_is_following(user_id: str, current_user: dict = Depends(get_current_user)):
    """Check if current user follows a specific user"""
    following = is_following(current_user['user_id'], user_id)
    return {"is_following": following}


@router.get("/stats/{user_id}")
def get_follower_stats(user_id: str):
    """Get follower statistics for a user"""
    followers_count = get_follower_count(user_id)
    following_count = get_following_count(user_id)
    return {
        "followers_count": followers_count,
        "following_count": following_count
    }


@router.put("/settings/{following_id}")
def update_follow_notification_settings(
    following_id: str,
    update_data: FollowUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update follow notification settings"""
    success = update_follow_settings(
        current_user['user_id'],
        following_id,
        update_data.dict(exclude_unset=True)
    )
    if not success:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    return {"message": "Follow settings updated successfully"}
