from rest_framework import serializers
from posts.models import Post
from categories.models import Category
from newsletter.models import Subscriber
from taggit.serializers import TagListSerializerField


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class PostListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagListSerializerField()
    reading_time = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'published_at', 'categories', 'tags', 'reading_time', 'is_featured'
        ]


class PostDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagListSerializerField()
    reading_time = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'created_at', 'updated_at', 'published_at', 'categories', 
            'tags', 'reading_time', 'is_featured'
        ]


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'name']
        extra_kwargs = {
            'id': {'read_only': True},
        } 