from fastapi import HTTPException
from app.core.database import client
from bson.objectid import ObjectId
from datetime import datetime

db = client['videohub']


def create_category(category_data):
    """Create a new category"""
    category_dict = category_data.dict()
    
    # Check if slug already exists
    existing = db['categories'].find_one({'slug': category_dict['slug']})
    if existing:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    category_dict['created_at'] = datetime.now()
    category_dict['updated_at'] = datetime.now()
    category_dict['video_count'] = 0
    category_dict['is_active'] = category_dict.get('is_active', True)
    
    result = db['categories'].insert_one(category_dict)
    
    category = db['categories'].find_one({'_id': result.inserted_id})
    category['id'] = str(category['_id'])
    category.pop('_id')
    return category


def get_all_categories(skip=0, limit=100, active_only=False):
    """Get all categories"""
    query = {'is_active': True} if active_only else {}
    categories = list(db['categories'].find(query).sort('display_order', 1).skip(skip).limit(limit))
    
    for category in categories:
        category['id'] = str(category['_id'])
        category.pop('_id')
    
    return categories


def get_category_by_id(category_id):
    """Get category by ID"""
    category = db['categories'].find_one({'_id': ObjectId(category_id)})
    if category:
        category['id'] = str(category['_id'])
        category.pop('_id')
    return category


def get_category_by_slug(slug):
    """Get category by slug"""
    category = db['categories'].find_one({'slug': slug})
    if category:
        category['id'] = str(category['_id'])
        category.pop('_id')
    return category


def update_category(category_id, update_data):
    """Update a category"""
    update_dict = update_data.dict(exclude_unset=True)
    
    if 'slug' in update_dict:
        # Check if new slug already exists
        existing = db['categories'].find_one({
            'slug': update_dict['slug'],
            '_id': {'$ne': ObjectId(category_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    update_dict['updated_at'] = datetime.now()
    
    result = db['categories'].update_one(
        {'_id': ObjectId(category_id)},
        {'$set': update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return get_category_by_id(category_id)


def delete_category(category_id):
    """Delete a category"""
    result = db['categories'].delete_one({'_id': ObjectId(category_id)})
    return result.deleted_count > 0


def update_category_video_count(category_slug, increment=1):
    """Update video count for a category"""
    db['categories'].update_one(
        {'slug': category_slug},
        {'$inc': {'video_count': increment}}
    )
