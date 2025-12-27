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


def delete_from_cloudinary(public_id, resource_type="auto"):
    """Delete a file from Cloudinary by public_id"""
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result
    except Exception as e:
        raise Exception(f"Failed to delete from Cloudinary: {str(e)}")


def extract_public_id_from_url(url):
    """Extract public_id from Cloudinary URL"""
    try:
        # Cloudinary URLs typically look like:
        # https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
        # or https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
        
        if not url or 'cloudinary' not in url:
            return None
            
        # Split by '/' and find the public_id (usually the last part before extension)
        parts = url.split('/')
        
        # Find the 'upload' part and everything after it until the file extension
        try:
            upload_index = parts.index('upload')
            # Everything after 'upload' until the last part (which has the extension)
            path_parts = parts[upload_index + 1:]  # Skip 'upload'
            
            # Remove version if it starts with 'v' followed by numbers
            if path_parts and path_parts[0].startswith('v') and path_parts[0][1:].isdigit():
                path_parts = path_parts[1:]  # Remove version
            
            if path_parts:
                # Join all remaining parts and remove extension
                full_path = '/'.join(path_parts)
                public_id = full_path.split('.')[0]  # Remove extension
                return public_id
                
        except ValueError:
            # 'upload' not found, try alternative approach
            pass
            
        # Fallback: get the last part before extension
        filename = parts[-1]  # Get the last part
        public_id_with_ext = filename.split('.')[0]  # Remove extension
        
        return public_id_with_ext
    except:
        return None
