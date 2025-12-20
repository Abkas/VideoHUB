from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_admin_user, get_current_user
from app.core.database import client

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
    
    # Convert ObjectId to string
    for user in users:
        user['_id'] = str(user['_id'])
    
    return {
        "users": users,
        "count": len(users),
        "skip": skip,
        "limit": limit
    }
