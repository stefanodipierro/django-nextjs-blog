from rest_framework import serializers
from posts.models import Post
from categories.models import Category
from newsletter.models import Subscriber
from taggit.serializers import TagListSerializerField
from utils.image_utils import generate_blur_placeholder


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class PostListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagListSerializerField()
    reading_time = serializers.IntegerField(read_only=True)
    blur_data_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'published_at', 'categories', 'tags', 'reading_time', 'is_featured',
            'blur_data_url'
        ]
    
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
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'side_image_1', 'side_image_2', 'side_image_1_blur', 'side_image_2_blur',
            'created_at', 'updated_at', 'published_at', 'categories', 
            'tags', 'reading_time', 'is_featured', 'blur_data_url'
        ]
    
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