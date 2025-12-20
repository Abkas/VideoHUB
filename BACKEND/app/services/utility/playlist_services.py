from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['beads_db']


def create_playlist(playlist_data, user_id):
    """Create a new playlist"""
    playlist_dict = playlist_data.dict()
    playlist_dict['user_id'] = user_id
    playlist_dict['video_ids'] = []
    playlist_dict['video_count'] = 0
    playlist_dict['views'] = 0
    playlist_dict['likes'] = 0
    playlist_dict['shares'] = 0
    playlist_dict['created_at'] = datetime.now()
    playlist_dict['updated_at'] = datetime.now()
    
    result = db['playlists'].insert_one(playlist_dict)
    return str(result.inserted_id)


def get_playlist_by_id(playlist_id):
    """Get playlist by ID"""
    playlist = db['playlists'].find_one({'_id': ObjectId(playlist_id)})
    if playlist:
        playlist['id'] = str(playlist['_id'])
        playlist.pop('_id')
    return playlist


def get_all_playlists(skip=0, limit=20):
    """Get all public playlists"""
    playlists = list(db['playlists'].find({'privacy': 'public'})
                    .sort('created_at', -1)
                    .skip(skip)
                    .limit(limit))
    for playlist in playlists:
        playlist['id'] = str(playlist['_id'])
        playlist.pop('_id')
    return playlists


def get_user_playlists(user_id, skip=0, limit=20, include_private=False):
    """Get user's playlists"""
    query = {'user_id': user_id}
    if not include_private:
        query['privacy'] = 'public'
    
    playlists = list(db['playlists'].find(query)
                    .sort('created_at', -1)
                    .skip(skip)
                    .limit(limit))
    for playlist in playlists:
        playlist['id'] = str(playlist['_id'])
        playlist.pop('_id')
    return playlists


def update_playlist(playlist_id, update_data, user_id):
    """Update playlist"""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = update_data.dict(exclude_unset=True)
    update_dict['updated_at'] = datetime.now()
    
    result = db['playlists'].update_one(
        {'_id': ObjectId(playlist_id)},
        {'$set': update_dict}
    )
    return get_playlist_by_id(playlist_id)


def delete_playlist(playlist_id, user_id):
    """Delete playlist"""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['playlists'].delete_one({'_id': ObjectId(playlist_id)})
    return result.deleted_count > 0


def add_video_to_playlist(playlist_id, video_id, user_id):
    """Add video to playlist"""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    video_ids = playlist.get('video_ids', [])
    if video_id in video_ids:
        raise HTTPException(status_code=400, detail="Video already in playlist")
    
    result = db['playlists'].update_one(
        {'_id': ObjectId(playlist_id)},
        {
            '$push': {'video_ids': video_id},
            '$inc': {'video_count': 1},
            '$set': {'updated_at': datetime.now()}
        }
    )
    return result.modified_count > 0


def remove_video_from_playlist(playlist_id, video_id, user_id):
    """Remove video from playlist"""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.get('user_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db['playlists'].update_one(
        {'_id': ObjectId(playlist_id)},
        {
            '$pull': {'video_ids': video_id},
            '$inc': {'video_count': -1},
            '$set': {'updated_at': datetime.now()}
        }
    )
    return result.modified_count > 0
