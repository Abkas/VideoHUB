from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime
from app.core.cloudinary_config import delete_from_cloudinary, extract_public_id_from_url

db = client['videohub']


def create_video(video_data, user_id):
    """Create a new video"""
    video_dict = video_data.dict()
    video_dict['uploader_id'] = user_id
    video_dict['status'] = 'processing'
    video_dict['views'] = 0
    video_dict['likes'] = 0
    video_dict['dislikes'] = 0
    video_dict['comments_count'] = 0
    video_dict['shares_count'] = 0
    video_dict['favorites_count'] = 0
    video_dict['created_at'] = datetime.now()
    video_dict['published_at'] = None
    
    result = db['videos'].insert_one(video_dict)
    return str(result.inserted_id)


def get_video_by_id(video_id):
    """Get video by ID"""
    video = db['videos'].find_one({'_id': ObjectId(video_id)})
    if video:
        video['id'] = str(video['_id'])
        video.pop('_id')
        # Add uploader info
        uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])}) if video.get('uploader_id') else None
        if uploader:
            video['uploader_username'] = uploader.get('username')
            video['uploader_display_name'] = uploader.get('display_name')
            video['uploader_profile_picture'] = uploader.get('profile_picture')
            video['uploader_followers_count'] = uploader.get('followers_count', 0)
    return video


def get_all_videos(skip=0, limit=20, search=None, category=None, tags=None, sort_by='created_at'):
    """Get all videos with filters"""
    query = {'status': 'published'}
    
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    if category:
        query['categories'] = category
    
    if tags:
        tag_list = tags.split(',')
        query['tags'] = {'$in': tag_list}
    
    videos = list(db['videos'].find(query)
                 .sort(sort_by, -1)
                 .skip(skip)
                 .limit(limit))
    for video in videos:
        video['id'] = str(video['_id'])
        video.pop('_id')
        uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])}) if video.get('uploader_id') else None
        if uploader:
            video['uploader_username'] = uploader.get('username')
            video['uploader_display_name'] = uploader.get('display_name')
            video['uploader_profile_picture'] = uploader.get('profile_picture')
            video['uploader_followers_count'] = uploader.get('followers_count', 0)
    return videos


def get_trending_videos(limit=20):
    """Get trending videos (sorted by views in last 7 days)"""
    # For now, just sort by views
    videos = list(db['videos'].find({'status': 'published'})
                 .sort('views', -1)
                 .limit(limit))
    
    for video in videos:
        video['id'] = str(video['_id'])
        video.pop('_id')
        uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])}) if video.get('uploader_id') else None
        if uploader:
            video['uploader_username'] = uploader.get('username')
            video['uploader_display_name'] = uploader.get('display_name')
            video['uploader_profile_picture'] = uploader.get('profile_picture')
            video['uploader_followers_count'] = uploader.get('followers_count', 0)
    return videos


def get_featured_videos(limit=20):
    """Get featured videos"""
    videos = list(db['videos'].find({
        'status': 'published',
        'is_featured': True
    })
    .sort('created_at', -1)
    .limit(limit))
    
    for video in videos:
        video['id'] = str(video['_id'])
        video.pop('_id')
        uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])}) if video.get('uploader_id') else None
        if uploader:
            video['uploader_username'] = uploader.get('username')
            video['uploader_display_name'] = uploader.get('display_name')
            video['uploader_profile_picture'] = uploader.get('profile_picture')
            video['uploader_followers_count'] = uploader.get('followers_count', 0)
    return videos


def get_videos_by_user(user_id, skip=0, limit=20):
    """Get videos by user"""
    videos = list(db['videos'].find({'uploader_id': user_id})
                 .sort('created_at', -1)
                 .skip(skip)
                 .limit(limit))
    
    for video in videos:
        video['id'] = str(video['_id'])
        video.pop('_id')
    return videos


def update_video(video_id, update_data, user):
    """Update video (by uploader or admin)"""
    video = get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    is_admin = user.get('is_admin', False)
    if video.get('uploader_id') != user['user_id'] and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    update_dict = update_data.dict(exclude_unset=True)
    db['videos'].update_one(
        {'_id': ObjectId(video_id)},
        {'$set': update_dict}
    )
    return get_video_by_id(video_id)


def delete_video(video_id, user_id, is_admin=False):
    """Delete video (by uploader or admin)"""
    video = get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.get('uploader_id') != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Delete video file from Cloudinary if it exists
    if video.get('video_url'):
        video_public_id = extract_public_id_from_url(video['video_url'])
        if video_public_id:
            try:
                delete_from_cloudinary(video_public_id, resource_type="video")
            except Exception as e:
                # Log but don't fail the deletion if Cloudinary delete fails
                print(f"Warning: Failed to delete video from Cloudinary: {str(e)}")
    
    # Delete thumbnail from Cloudinary if it exists
    if video.get('thumbnail_url'):
        thumbnail_public_id = extract_public_id_from_url(video['thumbnail_url'])
        if thumbnail_public_id:
            try:
                delete_from_cloudinary(thumbnail_public_id, resource_type="image")
            except Exception as e:
                # Log but don't fail the deletion if Cloudinary delete fails
                print(f"Warning: Failed to delete thumbnail from Cloudinary: {str(e)}")
    
    result = db['videos'].delete_one({'_id': ObjectId(video_id)})
    return result.deleted_count > 0


def update_video_metadata(video_id, metadata):
    """Update video metadata (duration, format, etc.)"""
    update_data = {}
    
    if 'duration' in metadata and metadata['duration']:
        update_data['duration'] = metadata['duration']
    if 'format' in metadata and metadata['format']:
        update_data['format'] = metadata['format']
    if 'width' in metadata and metadata['width']:
        update_data['width'] = metadata['width']
    if 'height' in metadata and metadata['height']:
        update_data['height'] = metadata['height']
    
    if update_data:
        result = db['videos'].update_one(
            {'_id': ObjectId(video_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    return False


def increment_video_view(video_id):
    """Increment video view count"""
    result = db['videos'].update_one(
        {'_id': ObjectId(video_id)},
        {'$inc': {'views': 1}}
    )
    return result.modified_count > 0


def get_hot_videos(limit=20):
    """Get hot videos (high engagement - likes, comments, shares)"""
    # Calculate engagement score: likes + comments*2 + shares*3
    videos = list(db['videos'].aggregate([
        {'$match': {'status': 'published'}},
        {'$addFields': {
            'engagement_score': {
                '$add': [
                    {'$ifNull': ['$likes', 0]},
                    {'$multiply': [{'$ifNull': ['$comments_count', 0]}, 2]},
                    {'$multiply': [{'$ifNull': ['$shares_count', 0]}, 3]}
                ]
            }
        }},
        {'$sort': {'engagement_score': -1}},
        {'$limit': limit}
    ]))
    
    for video in videos:
        video['id'] = str(video['_id'])
        video.pop('_id')
        uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])}) if video.get('uploader_id') else None
        if uploader:
            video['uploader_username'] = uploader.get('username')
            video['uploader_display_name'] = uploader.get('display_name')
            video['uploader_profile_picture'] = uploader.get('profile_picture')
            video['uploader_followers_count'] = uploader.get('followers_count', 0)
    return videos


def get_videos_from_following(user_id, limit=20):
    """Get videos from users that current user follows"""
    # Get list of following user IDs
    following = list(db['followers'].find(
        {'follower_id': user_id, 'status': 'active'},
        {'following_id': 1}
    ))
    following_ids = [f['following_id'] for f in following]
    
    if not following_ids:
        return []
    
    # Get videos from those users
    videos = list(db['videos'].find({
        'uploader_id': {'$in': following_ids},
        'status': 'published'
    })
    .sort('created_at', -1)
    .limit(limit))
    
    for video in videos:
        video['id'] = str(video['_id'])
        video.pop('_id')
        uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])}) if video.get('uploader_id') else None
        if uploader:
            video['uploader_username'] = uploader.get('username')
            video['uploader_display_name'] = uploader.get('display_name')
            video['uploader_profile_picture'] = uploader.get('profile_picture')
            video['uploader_followers_count'] = uploader.get('followers_count', 0)
    return videos


def get_recommended_videos(user_id=None, limit=20):
    """Get recommended videos based on user's watch history and preferences"""
    if not user_id:
        # Return featured or trending videos for non-authenticated users
        return get_trending_videos(limit)
    
    # Get user's watch history to find categories/tags they like
    watch_history = list(db['watch_history'].find(
        {'user_id': user_id}
    ).sort('watched_at', -1).limit(50))
    
    if not watch_history:
        return get_trending_videos(limit)
    
    # Get video IDs from history
    watched_video_ids = [ObjectId(wh['video_id']) for wh in watch_history]
    
    # Get categories and tags from watched videos
    watched_videos = list(db['videos'].find(
        {'_id': {'$in': watched_video_ids}},
        {'categories': 1, 'tags': 1}
    ))
    
    # Collect all categories and tags
    categories = set()
    tags = set()
    for video in watched_videos:
        if 'categories' in video:
            if isinstance(video['categories'], list):
                categories.update(video['categories'])
            else:
                categories.add(video['categories'])
        if 'tags' in video:
            tags.update(video.get('tags', []))
    
    # Find similar videos (not already watched)
    query = {
        'status': 'published',
        '_id': {'$nin': watched_video_ids}
    }
    
    if categories or tags:
        query['$or'] = []
        if categories:
            query['$or'].append({'categories': {'$in': list(categories)}})
        if tags:
            query['$or'].append({'tags': {'$in': list(tags)}})
    
    # Prioritize by views and recency
    videos = list(db['videos'].find(query)
                 .sort([('views', -1), ('created_at', -1)])
                 .limit(limit))
    
    for video in videos:
        video['id'] = str(video['_id'])
        video.pop('_id')
    
    return videos
