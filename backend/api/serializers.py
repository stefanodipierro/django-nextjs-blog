from rest_framework import serializers
from posts.models import Post
from categories.models import Category
from newsletter.models import Subscriber
from taggit.serializers import TagListSerializerField
from utils.image_utils import generate_blur_placeholder
from themes.models import ExtendedTheme
import re


def is_external_url(url):
    """
    Detect if a URL is an external URL (like Picsum or Unsplash)
    """
    if not url:
        return False
    
    # Check if it's a standard URL that's not from this application
    if url.startswith(('http://', 'https://')) and not url.startswith('http://django:8000') and not url.startswith('http://localhost:8000'):
        return True
    
    # If it's a media URL containing an encoded external URL like /media/https%3A/picsum.photos/...
    external_url_pattern = r'/media/(https?(%3A|:).+)'
    match = re.search(external_url_pattern, url)
    if match:
        return True
    
    return False


def get_direct_url(url):
    """
    Extract and decode direct URL from potentially encoded or encapsulated URLs
    """
    if not url:
        return url
    
    # If already a direct external URL
    if is_external_url(url) and not '/media/' in url:
        return url
    
    # Try to extract external URL from media path
    external_url_pattern = r'/media/(https?(%3A|:).+)'
    match = re.search(external_url_pattern, url)
    if match:
        # Extract and properly decode the external URL
        encoded_url = match.group(1)
        # First replace %3A with : for protocol
        decoded_url = encoded_url.replace('%3A', ':').replace('%2F', '/')
        
        # Handle more complex encoding if needed
        if '%' in decoded_url:
            try:
                from urllib.parse import unquote
                decoded_url = unquote(decoded_url)
            except:
                pass
        
        # Fix the common issue with https:/picsum.photos -> https://picsum.photos
        if 'https:/picsum' in decoded_url:
            decoded_url = decoded_url.replace('https:/picsum', 'https://picsum')
        if 'http:/picsum' in decoded_url:
            decoded_url = decoded_url.replace('http:/picsum', 'http://picsum')
            
        return decoded_url
    
    return url


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class PostListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagListSerializerField()
    reading_time = serializers.IntegerField(read_only=True)
    blur_data_url = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'published_at', 'categories', 'tags', 'reading_time', 'is_featured',
            'blur_data_url'
        ]
    
    def get_featured_image(self, obj):
        """Return direct URL for external images, or standard URL for internal images"""
        if not obj.featured_image:
            return None
            
        url = obj.featured_image.url
        if is_external_url(url):
            return get_direct_url(url)
        return url
    
    def get_blur_data_url(self, obj):
        """Generate a blur data URL for the featured image"""
        if not obj.featured_image:
            return None
        return generate_blur_placeholder(obj.featured_image.url)


class PostDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagListSerializerField()
    reading_time = serializers.IntegerField(read_only=True)
    blur_data_url = serializers.SerializerMethodField()
    side_image_1_blur = serializers.SerializerMethodField()
    side_image_2_blur = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()
    side_image_1 = serializers.SerializerMethodField()
    side_image_2 = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'side_image_1', 'side_image_2', 'side_image_1_blur', 'side_image_2_blur',
            'created_at', 'updated_at', 'published_at', 'categories', 
            'tags', 'reading_time', 'is_featured', 'blur_data_url'
        ]
    
    def get_featured_image(self, obj):
        """Return direct URL for external images, or standard URL for internal images"""
        if not obj.featured_image:
            return None
            
        url = obj.featured_image.url
        if is_external_url(url):
            return get_direct_url(url)
        return url
    
    def get_side_image_1(self, obj):
        """Return direct URL for external images, or standard URL for internal images"""
        if not obj.side_image_1:
            return None
            
        url = obj.side_image_1.url
        if is_external_url(url):
            return get_direct_url(url)
        return url
    
    def get_side_image_2(self, obj):
        """Return direct URL for external images, or standard URL for internal images"""
        if not obj.side_image_2:
            return None
            
        url = obj.side_image_2.url
        if is_external_url(url):
            return get_direct_url(url)
        return url
    
    def get_blur_data_url(self, obj):
        """Generate a blur data URL for the featured image"""
        if not obj.featured_image:
            return None
        return generate_blur_placeholder(obj.featured_image.url)
    
    def get_side_image_1_blur(self, obj):
        """Generate a blur data URL for side image 1"""
        if not obj.side_image_1:
            return None
        return generate_blur_placeholder(obj.side_image_1.url)
    
    def get_side_image_2_blur(self, obj):
        """Generate a blur data URL for side image 2"""
        if not obj.side_image_2:
            return None
        return generate_blur_placeholder(obj.side_image_2.url)


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'name']
        extra_kwargs = {
            'id': {'read_only': True},
        }


# Serializer for the active theme with hero section data
class ActiveThemeSerializer(serializers.ModelSerializer):
    # Use the related Theme's id and name
    id = serializers.IntegerField(source='theme.id')
    theme_name = serializers.CharField(source='theme.name')
    hero_image = serializers.SerializerMethodField()

    class Meta:
        model = ExtendedTheme
        fields = ['id', 'theme_name', 'hero_image', 'hero_image_alt', 'hero_box_color', 'show_navbar']
        
    def get_hero_image(self, obj):
        """Return direct URL for external images, or standard URL for internal images"""
        if not obj.hero_image:
            return None
            
        url = obj.hero_image.url
        if is_external_url(url):
            return get_direct_url(url)
        return url 