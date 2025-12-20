from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.utility.tag_schemas import TagCreate, TagUpdate, TagResponse
from app.services.utility.tag_services import (
    create_tag, get_all_tags, get_tag_by_id, 
    get_tag_by_slug, update_tag, delete_tag
)
from app.core.security import get_admin_user, get_current_user
from typing import List

router = APIRouter(
    prefix='/tags',
    tags=['Tags']
)


@router.post('/', response_model=TagResponse)
def create_new_tag(
    tag_data: TagCreate,
    current_user: dict = Depends(get_admin_user)
):
    """Create a new tag (admin only)"""
    return create_tag(tag_data)


@router.get('/', response_model=List[TagResponse])
def list_tags(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(False)
):
    """Get all tags"""
    return get_all_tags(skip, limit, active_only)


@router.get('/{tag_id}', response_model=TagResponse)
def get_tag(tag_id: str):
    """Get tag by ID"""
    tag = get_tag_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.get('/slug/{slug}', response_model=TagResponse)
def get_tag_slug(slug: str):
    """Get tag by slug"""
    tag = get_tag_by_slug(slug)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.put('/{tag_id}', response_model=TagResponse)
def update_existing_tag(
    tag_id: str,
    tag_data: TagUpdate,
    current_user: dict = Depends(get_admin_user)
):
    """Update a tag (admin only)"""
    return update_tag(tag_id, tag_data)


@router.delete('/{tag_id}')
def delete_existing_tag(
    tag_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Delete a tag (admin only)"""
    if delete_tag(tag_id):
        return {"message": "Tag deleted successfully"}
    raise HTTPException(status_code=404, detail="Tag not found")
