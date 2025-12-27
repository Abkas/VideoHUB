from fastapi import HTTPException
from app.core.database import client
from app.core.security import hash_password, verify_password, create_access_token
from bson.objectid import ObjectId
from datetime import datetime
from app.model.user.user_model import User
from app.core.cloudinary_config import delete_from_cloudinary, extract_public_id_from_url



db = client['videohub']


def register(user_data):
    # Convert Pydantic model to dict and hash password
    user_dict = user_data.dict()
    user_dict['hashed_password'] = hash_password(user_data.password)
    user_dict.pop('password')  # Remove plain password field
    # Always set created_at to now, ignore frontend value
    user_dict['created_at'] = datetime.now()
    user_obj = User(**user_dict)
    user_doc = user_obj.dict(by_alias=True)
    user_doc.pop('_id', None)  # Remove _id if it exists
    user_doc.pop('id', None)  # Remove id field (MongoDB uses _id)
    result = db['users'].insert_one(user_doc)
    return str(result.inserted_id)

def login(user_data):
    email = user_data.email if hasattr(user_data, 'email') else user_data['email']
    password = user_data.password if hasattr(user_data, 'password') else user_data['password']
    user = db['users'].find_one({'email': email})
    if user and verify_password(password, user['hashed_password']):
        # Check if user is admin based on role field
        is_admin = user.get("role", "user") == "admin"
        token_data = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "is_admin": is_admin
        }
        access_token = create_access_token(token_data)
        return {'access_token': access_token, 'user': token_data}
    return None

def get_user_by_id(user_id):
    user = db['users'].find_one({'_id': ObjectId(user_id)})
    if user:
        user['id'] = str(user['_id'])  
        user.pop('_id')
        user.pop('hashed_password', None)  # Remove password from response
    return user

def update_user(user_id, update_data):
    existing_user = get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    result = db['users'].update_one(
        {'_id': ObjectId(user_id)},
        {'$set': update_data.dict(exclude_unset=True)}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="No changes applied")

    return get_user_by_id(user_id)

def delete_user(user_id):
    # Get user to check for avatar and cover image
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        return False

    # Delete avatar from Cloudinary if it exists
    if user.get('profile_picture'):
        avatar_public_id = extract_public_id_from_url(user['profile_picture'])
        if avatar_public_id:
            try:
                delete_from_cloudinary(avatar_public_id, resource_type="image")
            except Exception as e:
                # Log but don't fail the deletion if Cloudinary delete fails
                print(f"Warning: Failed to delete user avatar from Cloudinary: {str(e)}")

    # Delete cover image from Cloudinary if it exists
    if user.get('cover_image'):
        cover_public_id = extract_public_id_from_url(user['cover_image'])
        if cover_public_id:
            try:
                delete_from_cloudinary(cover_public_id, resource_type="image")
            except Exception as e:
                # Log but don't fail the deletion if Cloudinary delete fails
                print(f"Warning: Failed to delete user cover image from Cloudinary: {str(e)}")

    # Delete user from database
    result = db["users"].delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0