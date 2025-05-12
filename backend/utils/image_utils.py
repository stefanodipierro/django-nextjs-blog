import base64
import io
from PIL import Image
from django.core.files.storage import default_storage
from urllib.parse import urljoin
from django.conf import settings
import os

def generate_blur_placeholder(image_url, size=(10, 10)):
    """
    Generate a base64 encoded blur placeholder for an image URL.
    If the image cannot be processed, returns a fallback SVG.
    
    Args:
        image_url (str): The URL or path of the image
        size (tuple): The size to resize the image to for the placeholder
        
    Returns:
        str: A base64 encoded data URL for the image
    """
    # Default fallback placeholder (10x10 grey SVG)
    fallback = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PC9zdmc+'
    
    if not image_url:
        return fallback
    
    try:
        # Handle both relative paths and full URLs
        if image_url.startswith('http'):
            # For external URLs, we'd need to download the image first
            # This is left as a future improvement - return fallback for now
            return fallback
        
        # Handle relative paths from storage
        image_path = image_url
        if image_url.startswith('/'):
            image_path = image_url[1:]  # Remove leading slash
            
        # Open the image from storage
        if not default_storage.exists(image_path):
            return fallback
            
        with default_storage.open(image_path, 'rb') as f:
            img = Image.open(f)
            img.thumbnail(size)
            
            # Convert to RGB if needed (handles PNGs with transparency)
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as JPEG with low quality
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=20, optimize=True)
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f'data:image/jpeg;base64,{img_str}'
    except Exception as e:
        print(f"Error generating placeholder for {image_url}: {e}")
        return fallback 

def generate_webp(image_field):
    """
    Given a Django ImageField, generate a .webp version in the same directory.
    Returns the path to the .webp file.
    """
    if not image_field:
        return None
    original_path = image_field.path
    webp_path = os.path.splitext(original_path)[0] + '.webp'
    if os.path.exists(webp_path):
        return webp_path
    try:
        img = Image.open(original_path)
        img.save(webp_path, 'webp', quality=85)
        return webp_path
    except Exception as e:
        print(f'Error generating webp: {e}')
        return None 