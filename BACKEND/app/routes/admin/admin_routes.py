from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from app.core.security import get_admin_user, get_current_user
from app.core.database import client
from app.core.cloudinary_config import delete_from_cloudinary, extract_public_id_from_url
from app.services.utility.category_services import update_category_video_count
from app.services.utility.tag_services import update_tag_video_count
from bson import ObjectId
from datetime import datetime

router = APIRouter(
    prefix='/admin',
    tags=['Admin']
)

db = client['videohub']

@router.get('/verify')
def verify_admin(current_user: dict = Depends(get_admin_user)):
    """Verify if the current user is an admin"""
    return {
        "message": "Admin access verified",
        "user_id": current_user['user_id'],
        "email": current_user['email'],
        "is_admin": True
    }

@router.get('/stats')
def get_platform_stats(current_user: dict = Depends(get_admin_user)):
    """Get platform statistics (admin only)"""
    total_users = db['users'].count_documents({})
    total_videos = db['videos'].count_documents({})
    admin_count = db['users'].count_documents({'role': 'admin'})
    
    return {
        "total_users": total_users,
        "total_videos": total_videos,
        "admin_count": admin_count,
        "requested_by": current_user['email']
    }

@router.get('/users')
def list_all_users(current_user: dict = Depends(get_admin_user), skip: int = 0, limit: int = 50):
    """List all users (admin only)"""
    users = list(db['users'].find({}, {'hashed_password': 0}).skip(skip).limit(limit))
    
    # Convert ObjectId to string and add subscription info
    for user in users:
        user['_id'] = str(user['_id'])
        
        # Check subscription status
        user_id_str = str(user['_id'])
        subscription = db['time_subscriptions'].find_one({'user_id': user_id_str})
        if subscription:
            from datetime import datetime
            expires_at = subscription.get('expires_at')
            user['has_active_subscription'] = expires_at and expires_at > datetime.utcnow()
            user['subscription_expires_at'] = expires_at.isoformat() if expires_at else None
        else:
            user['has_active_subscription'] = False
            user['subscription_expires_at'] = None
    
    return {
        "users": users,
        "count": len(users),
        "skip": skip,
        "limit": limit
    }

@router.get('/users/{user_id}')
def get_user_details(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Get detailed user information (admin only)"""
    try:
        # Get user info
        user = db['users'].find_one({'_id': ObjectId(user_id)}, {'hashed_password': 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user['_id'] = str(user['_id'])
        
        # Get user's video count
        video_count = db['videos'].count_documents({'user_id': user_id})
        
        # Get user's subscription status
        subscription = db['subscriptions'].find_one({'user_id': user_id})
        
        # Get watch history count
        watch_history_count = db['watch_history'].count_documents({'user_id': user_id})
        
        # Get recent watch history (last 10)
        watch_history = list(db['watch_history'].find({'user_id': user_id})
                           .sort('last_watched_at', -1)
                           .limit(10))
        
        for history in watch_history:
            history['_id'] = str(history['_id'])
            # Get video details for each watch history
            video = db['videos'].find_one({'_id': ObjectId(history['video_id'])})
            if video:
                history['video_title'] = video.get('title', 'Unknown')
                history['video_thumbnail'] = video.get('thumbnail_url', '')
        
        return {
            "user": user,
            "stats": {
                "video_count": video_count,
                "watch_history_count": watch_history_count,
                "has_subscription": subscription is not None
            },
            "recent_watch_history": watch_history
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/users/{user_id}/ban')
def ban_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Ban a user (admin only)"""
    try:
        result = db['users'].update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_banned': True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User banned successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/users/{user_id}/unban')
def unban_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Unban a user (admin only)"""
    try:
        result = db['users'].update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_banned': False}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User unbanned successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/users/{user_id}/promote')
def promote_to_admin(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Promote a user to admin (admin only)"""
    try:
        result = db['users'].update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': 'admin'}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User promoted to admin successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/users/{user_id}/demote')
def demote_from_admin(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Demote an admin to regular user (admin only)"""
    try:
        result = db['users'].update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': 'user'}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User demoted to regular user successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/users/{user_id}/subscriptions')
def get_user_subscriptions(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Get user subscription details and history (admin only)"""
    try:
        from app.services.admin.subscription_services import get_all_subscriptions
        from app.services.user.subscription_services import get_subscription_status
        
        # Get current subscription status
        current_status = get_subscription_status(user_id)
        
        # Get subscription history for this user
        from app.core.database import client
        db = client['videohub']
        history_records = list(db['subscription_history'].find({'user_id': user_id})
                              .sort('created_at', -1))
        
        # Format history records
        subscription_history = []
        for record in history_records:
            record['id'] = str(record['_id'])
            record.pop('_id', None)
            # Add computed fields
            record['is_active'] = record.get('expires_at', datetime.utcnow()) > datetime.utcnow()
            subscription_history.append(record)
        
        return {
            "current_status": current_status,
            "subscription_history": subscription_history
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/users/{user_id}/subscription')
def update_user_subscription(
    user_id: str,
    subscription_data: dict,
    current_user: dict = Depends(get_admin_user)
):
    """Update user subscription expiry time (admin only)"""
    try:
        from datetime import datetime
        
        expires_at_str = subscription_data.get('expires_at')
        if not expires_at_str:
            raise HTTPException(status_code=400, detail="expires_at is required")
        
        try:
            expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        except:
            raise HTTPException(status_code=400, detail="Invalid expires_at format")
        
        # Update the subscription
        result = db['time_subscriptions'].update_one(
            {'user_id': user_id},
            {
                '$set': {
                    'expires_at': expires_at,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User subscription not found")
        
        return {"message": "Subscription updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/users/{user_id}')
def get_user_details(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Get detailed user information (admin only)"""
    try:
        user = db['users'].find_one({'_id': ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user['_id'] = str(user['_id'])
        user.pop('hashed_password', None)  # Remove password
        
        # Get user statistics
        video_count = db['videos'].count_documents({'uploader_id': user_id})
        watch_history_count = db['watch_history'].count_documents({'user_id': int(user_id) if user_id.isdigit() else user_id})
        
        # Check subscription status
        subscription = db['time_subscriptions'].find_one({'user_id': user_id})
        has_subscription = False
        if subscription:
            from datetime import datetime
            expires_at = subscription.get('expires_at')
            if expires_at and expires_at > datetime.utcnow():
                has_subscription = True
        
        stats = {
            'video_count': video_count,
            'watch_history_count': watch_history_count,
            'has_subscription': has_subscription
        }
        
        # Get recent watch history
        recent_watch_history = list(db['watch_history'].find({'user_id': int(user_id) if user_id.isdigit() else user_id})
                                   .sort('watched_at', -1)
                                   .limit(10))
        
        for history in recent_watch_history:
            history['_id'] = str(history['_id'])
            # Get video title
            video = db['videos'].find_one({'_id': ObjectId(history['video_id'])})
            if video:
                history['video_title'] = video.get('title', 'Unknown Video')
            else:
                history['video_title'] = 'Video not found'
        
        return {
            'user': user,
            'stats': stats,
            'recent_watch_history': recent_watch_history
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/users/{user_id}/subscriptions')
def get_user_subscriptions(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Get user's subscription history and current status (admin only)"""
    try:
        from app.services.admin.subscription_services import get_all_subscriptions
        from app.services.user.subscription_services import get_subscription_status
        
        # Get current subscription status
        status_data = get_subscription_status(user_id)
        
        # Get subscription history (filter for this user)
        all_subs = get_all_subscriptions(0, 100)  # Get more to filter
        user_subscriptions = [sub for sub in all_subs['subscriptions'] if sub.get('user_id') == user_id]
        
        return {
            'current_status': status_data,
            'subscription_history': user_subscriptions
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/videos')
def list_all_videos(
    current_user: dict = Depends(get_admin_user),
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    search: str = None,
    category: str = None
):
    """List all videos with filters (admin only)"""
    try:
        query = {}
        
        if status:
            query['status'] = status
        
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]
        
        if category:
            query['categories'] = category
        
        videos = list(db['videos'].find(query)
                     .sort('created_at', -1)
                     .skip(skip)
                     .limit(limit))
        
        for video in videos:
            video['_id'] = str(video['_id'])
            # Get uploader info
            if video.get('uploader_id'):
                uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])})
                if uploader:
                    video['uploader_name'] = uploader.get('display_name', 'Unknown')
        
        return {
            "videos": videos,
            "count": len(videos),
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post('/videos')
def create_admin_video(
    video_data: dict,
    current_user: dict = Depends(get_admin_user)
):
    """Create a new video as admin"""
    try:
        video_dict = video_data.copy()
        video_dict['uploader_id'] = current_user['user_id']
        video_dict['status'] = video_dict.get('status', 'published')
        video_dict['views'] = 0
        video_dict['likes'] = 0
        video_dict['dislikes'] = 0
        video_dict['comments_count'] = 0
        video_dict['shares_count'] = 0
        video_dict['favorites_count'] = 0
        video_dict['created_at'] = datetime.now()
        video_dict['published_at'] = datetime.now() if video_dict['status'] == 'published' else None
        
        result = db['videos'].insert_one(video_dict)
        
        # Update category video counts
        if video_dict.get('categories'):
            for category_slug in video_dict['categories']:
                update_category_video_count(category_slug, 1)
        
        # Update tag video counts
        if video_dict.get('tags'):
            for tag_slug in video_dict['tags']:
                update_tag_video_count(tag_slug, 1)
        
        return {"message": "Video created successfully", "video_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/videos/{video_id}')
def update_admin_video(
    video_id: str,
    update_data: dict,
    current_user: dict = Depends(get_admin_user)
):
    """Update any video (admin only)"""
    try:
        # Get the old video to track category/tag changes
        old_video = db['videos'].find_one({'_id': ObjectId(video_id)})
        if not old_video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Remove fields that shouldn't be updated
        forbidden_fields = ['_id', 'created_at', 'uploader_id', 'views', 'likes']
        for field in forbidden_fields:
            update_data.pop(field, None)
        
        # Add updated_at timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # Update categories count if changed
        old_categories = set(old_video.get('categories', []))
        new_categories = set(update_data.get('categories', []))
        
        # Decrement count for removed categories
        for category_slug in old_categories - new_categories:
            update_category_video_count(category_slug, -1)
        
        # Increment count for added categories
        for category_slug in new_categories - old_categories:
            update_category_video_count(category_slug, 1)
        
        # Update tags count if changed
        old_tags = set(old_video.get('tags', []))
        new_tags = set(update_data.get('tags', []))
        
        # Decrement count for removed tags
        for tag_slug in old_tags - new_tags:
            update_tag_video_count(tag_slug, -1)
        
        # Increment count for added tags
        for tag_slug in new_tags - old_tags:
            update_tag_video_count(tag_slug, 1)
        
        result = db['videos'].update_one(
            {'_id': ObjectId(video_id)},
            {'$set': update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Video not found")
        return {"message": "Video updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete('/videos/{video_id}')
def delete_admin_video(
    video_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Delete any video (admin only)"""
    try:
        # Get the video first to get its URLs and categories/tags
        video = db['videos'].find_one({'_id': ObjectId(video_id)})
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
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
        
        # Delete the video from database
        result = db['videos'].delete_one({'_id': ObjectId(video_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Decrement category video counts
        if video.get('categories'):
            for category_slug in video['categories']:
                update_category_video_count(category_slug, -1)
        
        # Decrement tag video counts
        if video.get('tags'):
            for tag_slug in video['tags']:
                update_tag_video_count(tag_slug, -1)
        
        return {"message": "Video deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/videos/{video_id}/metadata')
def update_video_metadata(
    video_id: str,
    metadata: dict,
    current_user: dict = Depends(get_admin_user)
):
    """Update video metadata (duration, format, etc.)"""
    try:
        from app.services.video.video_services import update_video_metadata as update_metadata_service
        success = update_metadata_service(video_id, metadata)
        if not success:
            raise HTTPException(status_code=404, detail="Video not found or no updates made")
        return {"message": "Video metadata updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/videos/{video_id}/details')
def get_video_full_details(
    video_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Get full video details with all statistics (admin only)"""
    try:
        video = db['videos'].find_one({'_id': ObjectId(video_id)})
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        video['_id'] = str(video['_id'])
        
        # Get uploader info
        if video.get('uploader_id'):
            uploader = db['users'].find_one({'_id': ObjectId(video['uploader_id'])})
            if uploader:
                video['uploader_name'] = uploader.get('display_name', 'Unknown')
                video['uploader_email'] = uploader.get('email', '')
            else:
                video['uploader_email'] = 'Uploader not found'
        else:
            video['uploader_email'] = 'No uploader ID'
        comments_count = db['comments'].count_documents({'video_id': video_id})
        video['comments_count'] = comments_count
        
        # Get likes/dislikes count
        likes_count = db['likes'].count_documents({'video_id': video_id, 'like_type': 'like'})
        dislikes_count = db['likes'].count_documents({'video_id': video_id, 'like_type': 'dislike'})
        video['likes'] = likes_count
        video['dislikes'] = dislikes_count
        
        return video
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post('/sync-video-counts')
def sync_video_counts(current_user: dict = Depends(get_admin_user)):
    """Recalculate and sync video counts for all categories and tags (admin only)"""
    try:
        # Reset all category video counts to 0
        db['categories'].update_many({}, {'$set': {'video_count': 0}})
        
        # Reset all tag video counts to 0
        db['tags'].update_many({}, {'$set': {'video_count': 0}})
        
        # Get all videos
        videos = db['videos'].find({})
        
        categories_count = {}
        tags_count = {}
        
        # Count videos for each category and tag
        for video in videos:
            # Count categories
            if video.get('categories'):
                for category_slug in video['categories']:
                    categories_count[category_slug] = categories_count.get(category_slug, 0) + 1
            
            # Count tags
            if video.get('tags'):
                for tag_slug in video['tags']:
                    tags_count[tag_slug] = tags_count.get(tag_slug, 0) + 1
        
        # Update category counts
        for category_slug, count in categories_count.items():
            db['categories'].update_one(
                {'slug': category_slug},
                {'$set': {'video_count': count}}
            )
        
        # Update tag counts
        for tag_slug, count in tags_count.items():
            db['tags'].update_one(
                {'slug': tag_slug},
                {'$set': {'video_count': count}}
            )
        
        return {
            "message": "Video counts synchronized successfully",
            "categories_updated": len(categories_count),
            "tags_updated": len(tags_count)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/users/{user_id}/subscription')
def update_user_subscription(
    user_id: str,
    subscription_data: dict,
    current_user: dict = Depends(get_admin_user)
):
    """Update user subscription expiry time (admin only)"""
    try:
        from datetime import datetime
        
        expires_at_str = subscription_data.get('expires_at')
        if not expires_at_str:
            raise HTTPException(status_code=400, detail="expires_at is required")
        
        try:
            expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        except:
            raise HTTPException(status_code=400, detail="Invalid expires_at format")
        
        # Update the subscription
        result = db['time_subscriptions'].update_one(
            {'user_id': user_id},
            {
                '$set': {
                    'expires_at': expires_at,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User subscription not found")
        
        return {"message": "Subscription updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
