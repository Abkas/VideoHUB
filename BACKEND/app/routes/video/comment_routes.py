from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.video.comment_schemas import CommentCreate, CommentUpdate
from app.services.video.comment_services import (
    create_comment,
    get_comment_by_id,
    get_video_comments,
    get_comment_replies,
    update_comment,
    delete_comment,
    pin_comment,
    unpin_comment
)
from app.core.security import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_new_comment(comment_data: CommentCreate, current_user: dict = Depends(get_current_user)):
    """Create a new comment"""
    comment_id = create_comment(comment_data, current_user['user_id'])
    return {"message": "Comment created successfully", "comment_id": comment_id}


@router.get("/video/{video_id}")
def get_comments_for_video(video_id: int, skip: int = 0, limit: int = 50):
    """Get all comments for a video"""
    comments = get_video_comments(video_id, skip, limit)
    return {"comments": comments, "count": len(comments)}


@router.get("/{comment_id}")
def get_comment_details(comment_id: str):
    """Get comment details by ID"""
    comment = get_comment_by_id(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.get("/{comment_id}/replies")
def get_replies_to_comment(comment_id: str, skip: int = 0, limit: int = 50):
    """Get all replies to a comment"""
    replies = get_comment_replies(comment_id, skip, limit)
    return {"replies": replies, "count": len(replies)}


@router.put("/{comment_id}")
def update_user_comment(comment_id: str, update_data: CommentUpdate, current_user: dict = Depends(get_current_user)):
    """Update comment (owner only)"""
    updated_comment = update_comment(comment_id, update_data, current_user['user_id'])
    return updated_comment


@router.delete("/{comment_id}")
def delete_user_comment(comment_id: str, current_user: dict = Depends(get_current_user)):
    """Delete comment (owner only)"""
    success = delete_comment(comment_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted successfully"}


@router.post("/{comment_id}/pin")
def pin_video_comment(comment_id: str, current_user: dict = Depends(get_current_user)):
    """Pin comment (video owner only)"""
    success = pin_comment(comment_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to pin comment")
    return {"message": "Comment pinned successfully"}


@router.delete("/{comment_id}/pin")
def unpin_video_comment(comment_id: str, current_user: dict = Depends(get_current_user)):
    """Unpin comment (video owner only)"""
    success = unpin_comment(comment_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to unpin comment")
    return {"message": "Comment unpinned successfully"}
