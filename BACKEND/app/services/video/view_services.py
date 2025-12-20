from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['beads_db']


def record_view(view_data, user_id=None):
    """Record a video view"""
    view_dict = view_data.dict()
    view_dict['user_id'] = user_id
    view_dict['started_at'] = datetime.now()
    view_dict['is_completed'] = False
    
    # Calculate completion percentage
    video = db['videos'].find_one({'_id': ObjectId(str(view_data.video_id))})
    if video:
        duration = video.get('duration', 1)
        view_dict['completion_percentage'] = (view_data.watch_duration / duration) * 100 if duration > 0 else 0
        view_dict['is_completed'] = view_dict['completion_percentage'] >= 90
    
    result = db['views'].insert_one(view_dict)
    
    # Increment video view count
    db['videos'].update_one(
        {'_id': ObjectId(str(view_data.video_id))},
        {'$inc': {'views': 1}}
    )
    
    return str(result.inserted_id)


def get_video_views(video_id):
    """Get view count for a video"""
    view_count = db['views'].count_documents({'video_id': video_id})
    unique_users = len(db['views'].distinct('user_id', {'video_id': video_id}))
    
    return {
        "video_id": video_id,
        "total_views": view_count,
        "unique_viewers": unique_users
    }


def get_video_analytics(video_id, user_id):
    """Get detailed analytics for a video (owner only)"""
    video = db['videos'].find_one({'_id': ObjectId(video_id)})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.get('uploader_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get views data
    total_views = db['views'].count_documents({'video_id': int(video_id)})
    unique_viewers = len(db['views'].distinct('user_id', {'video_id': int(video_id)}))
    
    # Get average watch duration
    views = list(db['views'].find({'video_id': int(video_id)}))
    avg_watch_duration = sum(v.get('watch_duration', 0) for v in views) / len(views) if views else 0
    avg_completion = sum(v.get('completion_percentage', 0) for v in views) / len(views) if views else 0
    
    # Device breakdown
    device_counts = {}
    for view in views:
        device = view.get('device_type', 'unknown')
        device_counts[device] = device_counts.get(device, 0) + 1
    
    return {
        "video_id": video_id,
        "total_views": total_views,
        "unique_viewers": unique_viewers,
        "average_watch_duration": avg_watch_duration,
        "average_completion_percentage": avg_completion,
        "device_breakdown": device_counts,
        "likes": video.get('likes', 0),
        "dislikes": video.get('dislikes', 0),
        "comments_count": video.get('comments_count', 0),
        "shares_count": video.get('shares_count', 0),
        "favorites_count": video.get('favorites_count', 0)
    }


def get_user_view_history(user_id, skip=0, limit=20):
    """Get user's view history"""
    views = list(db['views'].find({'user_id': user_id})
                .sort('started_at', -1)
                .skip(skip)
                .limit(limit))
    
    for view in views:
        view['id'] = str(view['_id'])
        view.pop('_id')
    return views
