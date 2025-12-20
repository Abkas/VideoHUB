from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

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


def update_video(video_id, update_data, user_id):
    """Update video"""
    video = get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.get('uploader_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = update_data.dict(exclude_unset=True)
    
    result = db['videos'].update_one(
        {'_id': ObjectId(video_id)},
        {'$set': update_dict}
    )
    return get_video_by_id(video_id)


def delete_video(video_id, user_id):
    """Delete video"""
    video = get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.get('uploader_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['videos'].delete_one({'_id': ObjectId(video_id)})
    return result.deleted_count > 0


def increment_video_view(video_id):
    """Increment video view count"""
    result = db['videos'].update_one(
        {'_id': ObjectId(video_id)},
        {'$inc': {'views': 1}}
    )
    return result.modified_count > 0
