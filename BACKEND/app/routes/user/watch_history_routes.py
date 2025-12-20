from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user.watch_history_schemas import WatchHistoryUpdate, WatchHistoryResponse
from app.services.user.watch_history_services import (
    get_user_watch_history,
    update_watch_progress,
    get_watch_progress,
    remove_from_history,
    clear_watch_history
)
from app.core.security import get_current_user

router = APIRouter(prefix="/watch-history", tags=["Watch History"])


@router.get("/me")
def get_my_watch_history(skip: int = 0, limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get current user's watch history"""
    history = get_user_watch_history(current_user['user_id'], skip, limit)
    return {"history": history, "count": len(history)}


@router.put("/{video_id}")
def update_video_watch_progress(video_id: int, watch_data: WatchHistoryUpdate, current_user: dict = Depends(get_current_user)):
    """Update watch progress for a video"""
    result = update_watch_progress(video_id, current_user['user_id'], watch_data)
    return {"message": "Watch progress updated", "result": result}


@router.delete("/{video_id}")
def remove_video_from_history(video_id: int, current_user: dict = Depends(get_current_user)):
    """Remove video from watch history"""
    success = remove_from_history(video_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=404, detail="Watch history entry not found")
    return {"message": "Removed from watch history"}


@router.delete("/me/clear")
def clear_user_watch_history(current_user: dict = Depends(get_current_user)):
    """Clear entire watch history"""
    deleted_count = clear_watch_history(current_user['user_id'])
    return {"message": "Watch history cleared", "deleted_count": deleted_count}


@router.get("/{video_id}")
def get_video_watch_progress(video_id: int, current_user: dict = Depends(get_current_user)):
    """Get watch progress for a specific video"""
    progress = get_watch_progress(video_id, current_user['user_id'])
    if not progress:
        return {"message": "No watch progress found", "video_id": video_id}
    return progress
