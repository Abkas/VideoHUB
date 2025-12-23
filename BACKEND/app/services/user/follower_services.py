from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime
from fastapi import HTTPException

db = client['videohub']


def follow_user(follower_id: int, following_id: int):
    """Follow a user"""
    # Check if user is trying to follow themselves
    if follower_id == following_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if already following
    existing = db['followers'].find_one({
        'follower_id': follower_id,
        'following_id': following_id,
        'status': 'active'
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    # Create follow relationship
    follow_doc = {
        'follower_id': follower_id,
        'following_id': following_id,
        'status': 'active',
        'notify_on_upload': True,
        'notify_on_live': True,
        'followed_at': datetime.now()
    }
    
    result = db['followers'].insert_one(follow_doc)
    
    # Update follower and following counts
    db['users'].update_one(
        {'user_id': follower_id},
        {'$inc': {'following_count': 1}}
    )
    db['users'].update_one(
        {'user_id': following_id},
        {'$inc': {'followers_count': 1}}
    )
    
    return str(result.inserted_id)


def unfollow_user(follower_id: int, following_id: int):
    """Unfollow a user"""
    result = db['followers'].delete_one({
        'follower_id': follower_id,
        'following_id': following_id,
        'status': 'active'
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    
    # Update follower and following counts
    db['users'].update_one(
        {'user_id': follower_id},
        {'$inc': {'following_count': -1}}
    )
    db['users'].update_one(
        {'user_id': following_id},
        {'$inc': {'followers_count': -1}}
    )
    
    return True


def get_followers(user_id: int, skip: int = 0, limit: int = 1000):
    """Get users who follow a specific user"""
    followers = list(db['followers'].find({
        'following_id': user_id,
        'status': 'active'
    }).skip(skip).limit(limit))
    
    # Populate follower user details
    for follower in followers:
        follower['id'] = str(follower['_id'])
        follower.pop('_id')
        
        # Get follower user details
        user = db['users'].find_one({'user_id': follower['follower_id']})
        if user:
            follower['follower_username'] = user.get('username')
            follower['follower_display_name'] = user.get('display_name')
            follower['follower_email'] = user.get('email')
    
    return followers


def get_following(user_id: int, skip: int = 0, limit: int = 1000):
    """Get users that a specific user follows"""
    following = list(db['followers'].find({
        'follower_id': user_id,
        'status': 'active'
    }).skip(skip).limit(limit))
    
    # Populate following user details
    for follow in following:
        follow['id'] = str(follow['_id'])
        follow.pop('_id')
        
        # Get following user details
        user = db['users'].find_one({'user_id': follow['following_id']})
        if user:
            follow['following_username'] = user.get('username')
            follow['following_display_name'] = user.get('display_name')
            follow['following_email'] = user.get('email')
    
    return following


def is_following(follower_id: int, following_id: int):
    """Check if a user follows another user"""
    follow = db['followers'].find_one({
        'follower_id': follower_id,
        'following_id': following_id,
        'status': 'active'
    })
    return follow is not None


def get_follower_count(user_id: int):
    """Get count of followers for a user"""
    count = db['followers'].count_documents({
        'following_id': user_id,
        'status': 'active'
    })
    return count


def get_following_count(user_id: int):
    """Get count of users a user is following"""
    count = db['followers'].count_documents({
        'follower_id': user_id,
        'status': 'active'
    })
    return count


def update_follow_settings(follower_id: int, following_id: int, update_data: dict):
    """Update follow notification settings"""
    result = db['followers'].update_one(
        {
            'follower_id': follower_id,
            'following_id': following_id,
            'status': 'active'
        },
        {'$set': update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    
    return True
