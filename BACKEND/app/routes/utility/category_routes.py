from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.utility.category_schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.utility.category_services import (
    create_category, get_all_categories, get_category_by_id, 
    get_category_by_slug, update_category, delete_category
)
from app.core.security import get_admin_user, get_current_user
from typing import List

router = APIRouter(
    prefix='/categories',
    tags=['Categories']
)


@router.post('/', response_model=CategoryResponse)
def create_new_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_admin_user)
):
    """Create a new category (admin only)"""
    return create_category(category_data)


@router.get('/', response_model=List[CategoryResponse])
def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(False)
):
    """Get all categories"""
    return get_all_categories(skip, limit, active_only)


@router.get('/{category_id}', response_model=CategoryResponse)
def get_category(category_id: str):
    """Get category by ID"""
    category = get_category_by_id(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get('/slug/{slug}', response_model=CategoryResponse)
def get_category_slug(slug: str):
    """Get category by slug"""
    category = get_category_by_slug(slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put('/{category_id}', response_model=CategoryResponse)
def update_existing_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: dict = Depends(get_admin_user)
):
    """Update a category (admin only)"""
    return update_category(category_id, category_data)


@router.delete('/{category_id}')
def delete_existing_category(
    category_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Delete a category (admin only)"""
    if delete_category(category_id):
        return {"message": "Category deleted successfully"}
    raise HTTPException(status_code=404, detail="Category not found")
