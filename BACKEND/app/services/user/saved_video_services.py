from datetime import datetime
from typing import List
from bson import ObjectId
from app.core.database import client

db = client['videohub']
saved_videos_collection = db['saved_videos']
videos_collection = db['videos']


def save_video(user_id: str, video_id: str) -> dict:
    """Save a video for a user"""
    # Check if already saved
    existing = saved_videos_collection.find_one({
        'user_id': user_id,
        'video_id': video_id
    })
    
    if existing:
        return {
            'saved': True,
            'saved_at': existing.get('saved_at')
        }
    
    # Create saved video record
    saved_video = {
        'user_id': user_id,
        'video_id': video_id,
        'saved_at': datetime.utcnow()
    }
    
    result = saved_videos_collection.insert_one(saved_video)
    
    # Increment favorites count on video
    try:
        videos_collection.update_one(
            {'_id': ObjectId(video_id)},
            {'$inc': {'favorites_count': 1}}
        )
    except Exception:
        pass
    
    return {
        'saved': True,
        'saved_at': saved_video['saved_at']
    }


def unsave_video(user_id: str, video_id: str) -> dict:
    """Remove a saved video for a user"""
    result = saved_videos_collection.delete_one({
        'user_id': user_id,
        'video_id': video_id
    })
    
    if result.deleted_count == 0:
        return {'saved': False}
    
    # Decrement favorites count on video
    try:
        videos_collection.update_one(
            {'_id': ObjectId(video_id)},
            {'$inc': {'favorites_count': -1}}
        )
    except Exception:
        pass
    
    return {'saved': False}


def get_save_status(user_id: str, video_id: str) -> dict:
    """Check if a video is saved by user"""
    saved_video = saved_videos_collection.find_one({
        'user_id': user_id,
        'video_id': video_id
    })
    
    if saved_video:
        return {
            'saved': True,
            'saved_at': saved_video.get('saved_at')
        }
    else:
        return {
            'saved': False,
            'saved_at': None
        }


def get_user_saved_videos(user_id: str, skip: int = 0, limit: int = 20) -> List[dict]:
    """Get all saved videos for a user with video details"""
    # Get saved video records
    saved_videos = list(saved_videos_collection.find(
        {'user_id': user_id}
    ).sort('saved_at', -1).skip(skip).limit(limit))
    
    if not saved_videos:
        return []
    
    # Get video IDs
    video_ids = []
    for sv in saved_videos:
        try:
            if ObjectId.is_valid(sv['video_id']):
                video_ids.append(ObjectId(sv['video_id']))
        except:
            pass
    
    # Fetch video details
    videos = list(videos_collection.find(
        {'_id': {'$in': video_ids}},
        {
            '_id': 1,
            'title': 1,
            'description': 1,
            'thumbnail_url': 1,
            'duration': 1,
            'views': 1,
            'likes': 1,
            'uploader_id': 1,
            'uploader_username': 1,
            'created_at': 1
        }
    ))
    
    # Create a mapping of video_id to video data
    video_map = {str(v['_id']): v for v in videos}
    
    # Combine saved video data with video details
    result = []
    for sv in saved_videos:
        video_id = sv['video_id']
        if video_id in video_map:
            video = video_map[video_id].copy()
            video['id'] = str(video['_id'])
            video.pop('_id', None)
            video['saved_at'] = sv.get('saved_at')
            result.append(video)
    
    return result


def get_saved_videos_count(user_id: str) -> int:
    """Get count of saved videos for a user"""
    return saved_videos_collection.count_documents({'user_id': user_id})
