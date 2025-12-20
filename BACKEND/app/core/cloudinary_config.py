import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_to_cloudinary(file, resource_type="auto", folder="videohub"):
    """Upload a file to Cloudinary and return metadata"""
    try:
        result = cloudinary.uploader.upload(
            file,
            resource_type=resource_type,
            folder=folder
        )
        
        # Return URL and metadata
        metadata = {
            'secure_url': result['secure_url'],
            'url': result.get('url'),
            'format': result.get('format'),
            'resource_type': result.get('resource_type'),
            'width': result.get('width'),
            'height': result.get('height'),
            'duration': result.get('duration'),  # Video duration in seconds
            'bit_rate': result.get('bit_rate'),
            'bytes': result.get('bytes'),
            'public_id': result.get('public_id')
        }
        
        return metadata
    except Exception as e:
        raise Exception(f"Failed to upload to Cloudinary: {str(e)}")
