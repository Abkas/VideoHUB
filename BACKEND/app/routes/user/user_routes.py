from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.schemas.user.user_schemas import UserPublic
from app.schemas.user.user_schemas import UserRegister, UserLogin, UserPrivate, UserUpdate
from app.services.user.user_services import register, login, get_user_by_id, update_user, delete_user
from app.core.security import get_current_user  # For authentication
from app.core.database import client
from datetime import datetime
import cloudinary.uploader
from bson.objectid import ObjectId
from app.core.cloudinary_config import delete_from_cloudinary, extract_public_id_from_url



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

        profile_picture = upload_result.get('secure_url')

        # Update user avatar in database
        db['users'].update_one(
            {'_id': ObjectId(current_user['user_id'])},
            {
                '$set': {
                    'profile_picture': profile_picture,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return {
            "message": "Avatar uploaded successfully",
            "profile_picture": profile_picture
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")


@router.delete('/me/avatar')
def delete_avatar(current_user: dict = Depends(get_current_user)):
    """Remove user avatar"""
    # Get current user to check if they have an avatar
    user = db['users'].find_one({'_id': ObjectId(current_user['user_id'])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete avatar from Cloudinary if it exists
    if user.get('profile_picture'):
        avatar_url = user['profile_picture']
        print(f"Attempting to delete avatar from Cloudinary: {avatar_url}")

        avatar_public_id = extract_public_id_from_url(avatar_url)
        print(f"Extracted public_id: {avatar_public_id}")

        if avatar_public_id:
            try:
                result = delete_from_cloudinary(avatar_public_id, resource_type="image")
                print(f"Cloudinary deletion result: {result}")
            except Exception as e:
                # Log but don't fail the deletion if Cloudinary delete fails
                print(f"Warning: Failed to delete avatar from Cloudinary: {str(e)}")
                # For debugging, let's raise the error to see what happens
                raise HTTPException(status_code=500, detail=f"Failed to delete from Cloudinary: {str(e)}")
        else:
            print(f"Warning: Could not extract public_id from URL: {avatar_url}")

    # Remove avatar from database
    db['users'].update_one(
        {'_id': ObjectId(current_user['user_id'])},
        {
            '$unset': {'profile_picture': ''},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )
    return {"message": "Avatar removed successfully"}

@router.get('/{user_id}', response_model=UserPublic)
def get_user_public_profile(user_id: str):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Only return public fields
    return user