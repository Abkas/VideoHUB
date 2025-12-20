from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['videohub']


def create_tag(tag_data):
    """Create a new tag"""
    tag_dict = tag_data.dict()
    
    # Check if slug already exists
    existing = db['tags'].find_one({'slug': tag_dict['slug']})
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this slug already exists")
    
    tag_dict['created_at'] = datetime.now()
    tag_dict['video_count'] = 0
    tag_dict['is_active'] = tag_dict.get('is_active', True)
    
    result = db['tags'].insert_one(tag_dict)
    
    tag = db['tags'].find_one({'_id': result.inserted_id})
    tag['id'] = str(tag['_id'])
    tag.pop('_id')
    return tag


def get_all_tags(skip=0, limit=100, active_only=False):
    """Get all tags"""
    query = {'is_active': True} if active_only else {}
    tags = list(db['tags'].find(query).sort('name', 1).skip(skip).limit(limit))
    
    for tag in tags:
        tag['id'] = str(tag['_id'])
        tag.pop('_id')
    
    return tags


def get_tag_by_id(tag_id):
    """Get tag by ID"""
    tag = db['tags'].find_one({'_id': ObjectId(tag_id)})
    if tag:
        tag['id'] = str(tag['_id'])
        tag.pop('_id')
    return tag


def get_tag_by_slug(slug):
    """Get tag by slug"""
    tag = db['tags'].find_one({'slug': slug})
    if tag:
        tag['id'] = str(tag['_id'])
        tag.pop('_id')
    return tag


def update_tag(tag_id, update_data):
    """Update a tag"""
    update_dict = update_data.dict(exclude_unset=True)
    
    if 'slug' in update_dict:
        # Check if new slug already exists
        existing = db['tags'].find_one({
            'slug': update_dict['slug'],
            '_id': {'$ne': ObjectId(tag_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Tag with this slug already exists")
    
    result = db['tags'].update_one(
        {'_id': ObjectId(tag_id)},
        {'$set': update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    return get_tag_by_id(tag_id)


def delete_tag(tag_id):
    """Delete a tag"""
    result = db['tags'].delete_one({'_id': ObjectId(tag_id)})
    return result.deleted_count > 0


def update_tag_video_count(tag_slug, increment=1):
    """Update video count for a tag"""
    db['tags'].update_one(
        {'slug': tag_slug},
        {'$inc': {'video_count': increment}}
    )


def get_or_create_tag(tag_name):
    """Get existing tag or create new one"""
    slug = tag_name.lower().replace(' ', '-')
    
    tag = db['tags'].find_one({'slug': slug})
    if tag:
        tag['id'] = str(tag['_id'])
        tag.pop('_id')
        return tag
    
    # Create new tag
    tag_dict = {
        'name': tag_name,
        'slug': slug,
        'video_count': 0,
        'is_active': True,
        'created_at': datetime.now()
    }
    
    result = db['tags'].insert_one(tag_dict)
    tag = db['tags'].find_one({'_id': result.inserted_id})
    tag['id'] = str(tag['_id'])
    tag.pop('_id')
    return tag
