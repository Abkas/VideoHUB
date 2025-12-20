from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['beads_db']


def create_like(like_data, user_id):
    """Create or update a like/dislike"""
    # Check if like already exists
    existing_like = db['likes'].find_one({
        'user_id': user_id,
        'video_id': like_data.video_id
    })
    
    if existing_like:
        # Update existing like
        old_type = existing_like.get('like_type')
        
        # If same type, remove it (toggle off)
        if old_type == like_data.like_type:
            db['likes'].delete_one({'_id': existing_like['_id']})
            
            # Decrement count
            if old_type == 'like':
                db['videos'].update_one(
                    {'_id': ObjectId(str(like_data.video_id))},
                    {'$inc': {'likes': -1}}
                )
            else:
                db['videos'].update_one(
                    {'_id': ObjectId(str(like_data.video_id))},
                    {'$inc': {'dislikes': -1}}
                )
            return {"action": "removed", "like_type": old_type}
        else:
            # Change from like to dislike or vice versa
            db['likes'].update_one(
                {'_id': existing_like['_id']},
                {'$set': {'like_type': like_data.like_type}}
            )
            
            # Update counts
            if like_data.like_type == 'like':
                db['videos'].update_one(
                    {'_id': ObjectId(str(like_data.video_id))},
                    {'$inc': {'likes': 1, 'dislikes': -1}}
                )
            else:
                db['videos'].update_one(
                    {'_id': ObjectId(str(like_data.video_id))},
                    {'$inc': {'likes': -1, 'dislikes': 1}}
                )
            return {"action": "updated", "like_type": like_data.like_type}
    else:
        # Create new like
        like_dict = like_data.dict()
        like_dict['user_id'] = user_id
        like_dict['created_at'] = datetime.now()
        
        result = db['likes'].insert_one(like_dict)
        
        # Increment count
        if like_data.like_type == 'like':
            db['videos'].update_one(
                {'_id': ObjectId(str(like_data.video_id))},
                {'$inc': {'likes': 1}}
            )
        else:
            db['videos'].update_one(
                {'_id': ObjectId(str(like_data.video_id))},
                {'$inc': {'dislikes': 1}}
            )
        
        return {"action": "created", "like_type": like_data.like_type, "id": str(result.inserted_id)}


def remove_like(video_id, user_id):
    """Remove like/dislike from video"""
    like = db['likes'].find_one({
        'user_id': user_id,
        'video_id': video_id
    })
    
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    
    like_type = like.get('like_type')
    
    # Remove like
    result = db['likes'].delete_one({'_id': like['_id']})
    
    # Decrement count
    if like_type == 'like':
        db['videos'].update_one(
            {'_id': ObjectId(str(video_id))},
            {'$inc': {'likes': -1}}
        )
    else:
        db['videos'].update_one(
            {'_id': ObjectId(str(video_id))},
            {'$inc': {'dislikes': -1}}
        )
    
    return result.deleted_count > 0


def get_video_likes(video_id, skip=0, limit=100):
    """Get all likes for a video"""
    likes = list(db['likes'].find({'video_id': video_id})
                .sort('created_at', -1)
                .skip(skip)
                .limit(limit))
    
    for like in likes:
        like['id'] = str(like['_id'])
        like.pop('_id')
    return likes


def get_user_liked_videos(user_id, skip=0, limit=20):
    """Get videos liked by user"""
    likes = list(db['likes'].find({
        'user_id': user_id,
        'like_type': 'like'
    })
    .sort('created_at', -1)
    .skip(skip)
    .limit(limit))
    
    video_ids = [like.get('video_id') for like in likes]
    return video_ids


def get_like_status(video_id, user_id):
    """Check if user liked/disliked video"""
    like = db['likes'].find_one({
        'user_id': user_id,
        'video_id': video_id
    })
    
    if like:
        return {
            "liked": like.get('like_type') == 'like',
            "disliked": like.get('like_type') == 'dislike',
            "like_type": like.get('like_type')
        }
    
    return {"liked": False, "disliked": False, "like_type": None}
