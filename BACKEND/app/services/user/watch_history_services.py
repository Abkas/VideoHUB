from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['beads_db']


def get_user_watch_history(user_id, skip=0, limit=20):
    """Get user's watch history"""
    history = list(db['watch_history'].find({'user_id': user_id})
                  .sort('last_watched_at', -1)
                  .skip(skip)
                  .limit(limit))
    for item in history:
        item['id'] = str(item['_id'])
        item.pop('_id')
    return history


def update_watch_progress(video_id, user_id, watch_data):
    """Update or create watch progress for a video"""
    watch_dict = watch_data.dict()
    watch_dict['user_id'] = user_id
    watch_dict['video_id'] = video_id
    watch_dict['last_watched_at'] = datetime.now()
    
    # Check if watch history exists
    existing = db['watch_history'].find_one({
        'user_id': user_id,
        'video_id': video_id
    })
    
    if existing:
        # Update existing record
        result = db['watch_history'].update_one(
            {'_id': existing['_id']},
            {'$set': watch_dict}
        )
        return result.modified_count > 0
    else:
        # Create new record
        watch_dict['created_at'] = datetime.now()
        result = db['watch_history'].insert_one(watch_dict)
        return str(result.inserted_id)


def get_watch_progress(video_id, user_id):
    """Get watch progress for a specific video"""
    progress = db['watch_history'].find_one({
        'user_id': user_id,
        'video_id': video_id
    })
    if progress:
        progress['id'] = str(progress['_id'])
        progress.pop('_id')
    return progress


def remove_from_history(video_id, user_id):
    """Remove a video from watch history"""
    result = db['watch_history'].delete_one({
        'user_id': user_id,
        'video_id': video_id
    })
    return result.deleted_count > 0


def clear_watch_history(user_id):
    """Clear entire watch history for a user"""
    result = db['watch_history'].delete_many({'user_id': user_id})
    return result.deleted_count
