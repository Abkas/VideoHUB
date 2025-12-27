import re
from typing import Optional


def create_slug(text: str) -> str:
    """
    Create a URL-friendly slug from text.

    Args:
        text: The text to convert to a slug

    Returns:
        A URL-friendly slug string

    Examples:
        "Action Movies" -> "action-movies"
        "Sci-Fi & Fantasy!" -> "sci-fi-fantasy"
        "  Multiple   Spaces  " -> "multiple-spaces"
        "Café & Restaurant" -> "cafe-restaurant"
    """
    if not text:
        return ""

    # Convert to lowercase
    slug = text.lower()

    # Replace spaces and underscores with hyphens
    slug = re.sub(r'[\s_]+', '-', slug)

    # Remove special characters, keeping only letters, numbers, and hyphens
    slug = re.sub(r'[^\w\-]', '', slug)

    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)

    # Remove leading/trailing hyphens
    slug = slug.strip('-')

    return slug


def generate_unique_slug(base_slug: str, collection_name: str, db_client, exclude_id: Optional[str] = None) -> str:
    """
    Generate a unique slug by appending a number if the base slug already exists.

    Args:
        base_slug: The base slug to make unique
        collection_name: The MongoDB collection name ('categories' or 'tags')
        db_client: The database client
        exclude_id: Optional ID to exclude from uniqueness check (for updates)

    Returns:
        A unique slug

    Examples:
        If "action-movies" exists, returns "action-movies-2"
        If "action-movies-2" exists, returns "action-movies-3"
    """
    original_slug = base_slug
    counter = 1

    while True:
        # Check if slug exists
        query = {'slug': base_slug}
        if exclude_id:
            from bson.objectid import ObjectId
            query['_id'] = {'$ne': ObjectId(exclude_id)}

        existing = db_client[collection_name].find_one(query)

        if not existing:
            return base_slug

        # Try next number
        counter += 1
        base_slug = f"{original_slug}-{counter}"


def validate_slug(slug: str) -> tuple[bool, list[str]]:
    """
    Validate a slug and return validation result with error messages.

    Args:
        slug: The slug to validate

    Returns:
        Tuple of (is_valid: bool, errors: list[str])
    """
    errors = []

    if not slug:
        errors.append("Slug cannot be empty")
        return False, errors

    # Must contain only lowercase letters, numbers, and hyphens
    if not re.match(r'^[a-z0-9\-]+$', slug):
        errors.append("Slug must contain only lowercase letters, numbers, and hyphens")

    # Cannot start or end with hyphens
    if slug.startswith('-'):
        errors.append("Slug cannot start with a hyphen")
    if slug.endswith('-'):
        errors.append("Slug cannot end with a hyphen")

    # Cannot have consecutive hyphens
    if '--' in slug:
        errors.append("Slug cannot contain consecutive hyphens")

    # Length constraints
    if len(slug) < 1:
        errors.append("Slug must be at least 1 character long")
    if len(slug) > 100:
        errors.append("Slug cannot be longer than 100 characters")

    return len(errors) == 0, errors


def clean_slug_input(text: str) -> str:
    """
    Clean user input text to create a valid slug.

    Args:
        text: Raw text input from user

    Returns:
        Cleaned slug string
    """
    return create_slug(text.strip())


def slugify(text: str) -> str:
    """
    Alias for create_slug for backward compatibility.

    Args:
        text: The text to convert to a slug

    Returns:
        A URL-friendly slug string
    """
    return create_slug(text)