from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.utility.playlist_schemas import PlaylistCreate, PlaylistUpdate, PlaylistVideoAction
from app.services.utility.playlist_services import (
    create_playlist,
    get_playlist_by_id,
    get_all_playlists,
    get_user_playlists,
    update_playlist,
    delete_playlist,
    add_video_to_playlist,
    remove_video_from_playlist
)
from app.core.security import get_current_user

router = APIRouter(prefix="/playlists", tags=["Playlists"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user_playlist(playlist_data: PlaylistCreate, current_user: dict = Depends(get_current_user)):
    """Create a new playlist"""
    playlist_id = create_playlist(playlist_data, current_user['user_id'])
    return {"message": "Playlist created successfully", "playlist_id": playlist_id}


@router.get("/")
def get_public_playlists(skip: int = 0, limit: int = 20):
    """Get all public playlists"""
    playlists = get_all_playlists(skip, limit)
    return {"playlists": playlists, "count": len(playlists)}


@router.get("/me")
def get_my_playlists(skip: int = 0, limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get current user's playlists"""
    playlists = get_user_playlists(current_user['user_id'], skip, limit, include_private=True)
    return {"playlists": playlists, "count": len(playlists)}


@router.get("/{playlist_id}")
def get_playlist_details(playlist_id: str):
    """Get playlist details by ID"""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist


@router.put("/{playlist_id}")
def update_playlist_details(playlist_id: str, update_data: PlaylistUpdate, current_user: dict = Depends(get_current_user)):
    """Update playlist details (owner only)"""
    updated_playlist = update_playlist(playlist_id, update_data, current_user['user_id'])
    return updated_playlist


@router.delete("/{playlist_id}")
def delete_user_playlist(playlist_id: str, current_user: dict = Depends(get_current_user)):
    """Delete playlist (owner only)"""
    success = delete_playlist(playlist_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return {"message": "Playlist deleted successfully"}


@router.post("/{playlist_id}/videos")
def add_video_to_user_playlist(playlist_id: str, video_data: PlaylistVideoAction, current_user: dict = Depends(get_current_user)):
    """Add video to playlist"""
    success = add_video_to_playlist(playlist_id, video_data.video_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add video to playlist")
    return {"message": "Video added to playlist"}


@router.delete("/{playlist_id}/videos/{video_id}")
def remove_video_from_user_playlist(playlist_id: str, video_id: int, current_user: dict = Depends(get_current_user)):
    """Remove video from playlist"""
    success = remove_video_from_playlist(playlist_id, video_id, current_user['user_id'])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove video from playlist")
    return {"message": "Video removed from playlist"}


@router.get("/user/{user_id}")
def get_playlists_by_user(user_id: str, skip: int = 0, limit: int = 20):
    """Get all public playlists by a user"""
    playlists = get_user_playlists(user_id, skip, limit, include_private=False)
    return {"playlists": playlists, "count": len(playlists)}
