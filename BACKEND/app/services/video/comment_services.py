from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['videohub']


def create_comment(comment_data, user_id):
    """Create a new comment"""
    comment_dict = comment_data.dict()
    comment_dict['user_id'] = user_id
    comment_dict['likes_count'] = 0
    comment_dict['dislikes_count'] = 0
    comment_dict['replies_count'] = 0
    comment_dict['is_edited'] = False
    comment_dict['is_pinned'] = False
    comment_dict['created_at'] = datetime.now()
    
    result = db['comments'].insert_one(comment_dict)
    
    # Increment video comment count
    db['videos'].update_one(
        {'_id': ObjectId(str(comment_data.video_id))},
        {'$inc': {'comments_count': 1}}
    )
    
    return str(result.inserted_id)


def get_comment_by_id(comment_id):
    """Get comment by ID"""
    comment = db['comments'].find_one({'_id': ObjectId(comment_id)})
    if comment:
        comment['id'] = str(comment['_id'])
        comment.pop('_id')
    return comment


def get_video_comments(video_id, skip=0, limit=50):
    """Get all comments for a video"""
    comments = list(db['comments'].find({
        'video_id': video_id,
        'parent_comment_id': None  # Only top-level comments
    })
    .sort('created_at', -1)
    .skip(skip)
    .limit(limit))
    
    for comment in comments:
        comment['id'] = str(comment['_id'])
        comment.pop('_id')
    return comments


def get_comment_replies(comment_id, skip=0, limit=50):
    """Get replies to a comment"""
    replies = list(db['comments'].find({'parent_comment_id': int(comment_id)})
                  .sort('created_at', 1)
                  .skip(skip)
                  .limit(limit))
    
    for reply in replies:
        reply['id'] = str(reply['_id'])
        reply.pop('_id')
    return replies


def update_comment(comment_id, update_data, user_id):
    """Update comment"""
    comment = get_comment_by_id(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['comments'].update_one(
        {'_id': ObjectId(comment_id)},
        {
            '$set': {
                'text': update_data.text,
                'is_edited': True,
                'edited_at': datetime.now()
            }
        }
    )
    return get_comment_by_id(comment_id)


def delete_comment(comment_id, user_id):
    """Delete comment"""
    comment = get_comment_by_id(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Decrement video comment count
    db['videos'].update_one(
        {'_id': ObjectId(str(comment.get('video_id')))},
        {'$inc': {'comments_count': -1}}
    )
    
    result = db['comments'].delete_one({'_id': ObjectId(comment_id)})
    return result.deleted_count > 0


def pin_comment(comment_id, video_owner_id):
    """Pin a comment (video owner only)"""
    comment = get_comment_by_id(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user owns the video
    video = db['videos'].find_one({'_id': ObjectId(str(comment.get('video_id')))})
    if not video or video.get('uploader_id') != video_owner_id:
        raise HTTPException(status_code=403, detail="Only video owner can pin comments")
    
    result = db['comments'].update_one(
        {'_id': ObjectId(comment_id)},
        {'$set': {'is_pinned': True}}
    )
    return result.modified_count > 0


def unpin_comment(comment_id, video_owner_id):
    """Unpin a comment (video owner only)"""
    comment = get_comment_by_id(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user owns the video
    video = db['videos'].find_one({'_id': ObjectId(str(comment.get('video_id')))})
    if not video or video.get('uploader_id') != video_owner_id:
        raise HTTPException(status_code=403, detail="Only video owner can unpin comments")
    
    result = db['comments'].update_one(
        {'_id': ObjectId(comment_id)},
        {'$set': {'is_pinned': False}}
    )
    return result.modified_count > 0
