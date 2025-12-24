from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.schemas.user.user_schemas import UserRegister, UserLogin, UserPrivate, UserUpdate
from app.services.user.user_services import register, login, get_user_by_id, update_user, delete_user
from app.core.security import get_current_user  # For authentication
from app.core.database import client
from datetime import datetime
import cloudinary.uploader
from bson.objectid import ObjectId



db = client['videohub']

router = APIRouter(
    prefix ='/users',
    tags= ['Users']
)

@router.post("/register")
def register_user(user_credentials: UserRegister):
    result = register(user_credentials)
    return result

@router.post("/login")
def login_user(user_credentials: UserLogin):
    result = login(user_credentials)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result

@router.post('/logout')
def logout_user(current_user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

# Profile Management Routes

@router.get('/me', response_model=UserPrivate)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    user = get_user_by_id(current_user['user_id'])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put('/me', response_model=UserPrivate)
def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    result = update_user(current_user['user_id'], user_update)
    return result


@router.delete('/me', status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(current_user: dict = Depends(get_current_user)):
    delete_user(current_user['user_id'])
    return None


@router.post('/me/avatar')
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload user avatar image"""
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        )
    
    # Validate file size (max 5MB)
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size too large. Maximum size is 5MB.")
    
    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_content,
            folder="videohub/avatars",
            resource_type="image",
            transformation=[
                {'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto', 'fetch_format': 'auto'}
            ]
        )
        
        avatar_url = upload_result.get('secure_url')
        
        # Update user avatar in database
        db['users'].update_one(
            {'_id': ObjectId(current_user['user_id'])},
            {
                '$set': {
                    'avatar_url': avatar_url,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")


@router.delete('/me/avatar')
def delete_avatar(current_user: dict = Depends(get_current_user)):
    """Remove user avatar"""
    from bson.objectid import ObjectId
    db['users'].update_one(
        {'_id': ObjectId(current_user['user_id'])},
        {
            '$unset': {'avatar_url': ''},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )
    return {"message": "Avatar removed successfully"}
