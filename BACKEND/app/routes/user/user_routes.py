from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user.user_schemas import UserRegister, UserLogin, UserPrivate, UserUpdate
from app.services.user.user_services import register, login, get_user_by_id, update_user, delete_user
from app.core.security import get_current_user  # For authentication
from datetime import datetime

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