from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.schemas.video.video_schemas import VideoCreate, VideoUpdate
from app.services.video.video_services import (
    create_video,
    get_video_by_id,
    get_all_videos,
    get_trending_videos,
    get_featured_videos,
    get_hot_videos,
    get_videos_from_following,
    get_recommended_videos,
    get_videos_by_user,
    update_video,
    delete_video,
    increment_video_view
)
from app.core.security import get_current_user, get_admin_user
from fastapi import File, UploadFile
from app.core.cloudinary_config import upload_to_cloudinary


router = APIRouter(prefix="/videos", tags=["Videos"])



@router.post("/upload")
def upload_to_cloudinary_route(file: UploadFile = File(...), resource_type: str = "auto", folder: str = "videohub", current_user: dict = Depends(get_current_user)):
    """Upload any file to Cloudinary (video, image, etc.)"""
    try:
        metadata = upload_to_cloudinary(file.file, resource_type=resource_type, folder=folder)
        return {"url": metadata["secure_url"], "metadata": metadata}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/upload/video")
async def upload_video_file_admin(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_admin_user)
):
    """Upload video file to Cloudinary (admin only)"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="Only video files are allowed")

        # Validate file size (max 500MB)
        file_size = 0
        content = await file.read()
        file_size = len(content)

        if file_size > 500 * 1024 * 1024:  # 500MB
            raise HTTPException(status_code=400, detail="File size too large. Maximum allowed size is 500MB")

        # Reset file pointer
        await file.seek(0)
        content = await file.read()

        # Upload to Cloudinary and get metadata
        metadata = upload_to_cloudinary(content, resource_type="video", folder="videohub/videos")

        # If duration is not available from Cloudinary, try to estimate it
        duration = metadata.get('duration', 0)
        if not duration and metadata.get('bytes'):
            # Rough estimation: assume 1MB = ~1 second for video (very rough)
            # This is just a fallback - real duration should come from Cloudinary
            estimated_duration = max(1, metadata['bytes'] // (1024 * 1024))  # At least 1 second
            duration = estimated_duration

        return {
            "url": metadata['secure_url'],
            "duration": duration,
            "format": metadata.get('format'),
            "width": metadata.get('width'),
            "height": metadata.get('height'),
            "bit_rate": metadata.get('bit_rate'),
            "bytes": metadata.get('bytes'),
            "public_id": metadata.get('public_id'),
            "message": "Video uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Video upload error: {str(e)}")  # Add logging
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@router.post("/admin/upload/thumbnail")
async def upload_thumbnail_file_admin(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_admin_user)
):
    """Upload thumbnail/image file to Cloudinary (admin only)"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")

        # Validate file size (max 10MB for thumbnails)
        file_size = 0
        content = await file.read()
        file_size = len(content)

        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File size too large. Maximum allowed size is 10MB")

        # Reset file pointer
        await file.seek(0)
        content = await file.read()

        # Upload to Cloudinary and get metadata
        metadata = upload_to_cloudinary(content, resource_type="image", folder="videohub/thumbnails")

        return {
            "url": metadata['secure_url'],
            "format": metadata.get('format'),
            "width": metadata.get('width'),
            "height": metadata.get('height'),
            "bytes": metadata.get('bytes'),
            "message": "Thumbnail uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Thumbnail upload error: {str(e)}")  # Add logging
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")
    
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


@router.get("/hot")
def get_hot_videos_list(limit: int = 20):
    """Get hot videos (high engagement)"""
    videos = get_hot_videos(limit)
    return {"videos": videos, "count": len(videos)}


@router.get("/following")
def get_following_videos_list(limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get videos from users you follow"""
    videos = get_videos_from_following(current_user['user_id'], limit)
    return {"videos": videos, "count": len(videos)}


@router.get("/recommended")
def get_recommended_videos_list(limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get recommended videos based on watch history"""
    videos = get_recommended_videos(current_user['user_id'], limit)
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
    """Update video details (owner or admin)"""
    updated_video = update_video(video_id, update_data, current_user)
    return updated_video


@router.delete("/{video_id}")
def delete_video_by_id(video_id: str, current_user: dict = Depends(get_current_user)):
    """Delete video (owner or admin)"""
    success = delete_video(video_id, current_user['user_id'], current_user.get('is_admin', False))
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

