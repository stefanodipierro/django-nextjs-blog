from rest_framework import viewsets, generics, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from posts.models import Post
from categories.models import Category
from newsletter.models import Subscriber
from .serializers import (
    PostListSerializer, PostDetailSerializer,
    CategorySerializer, SubscriberSerializer,
    ActiveThemeSerializer
)
from themes.models import ExtendedTheme


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows posts to be viewed.
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categories__slug', 'tags__name', 'is_featured']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['published_at', 'title']
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = Post.objects.filter(status='published').prefetch_related('categories', 'tags')
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer


class FeaturedPostsAPIView(generics.ListAPIView):
    """
    API endpoint that returns featured posts.
    """
    serializer_class = PostListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Post.objects.filter(
            status='published',
            is_featured=True
        ).prefetch_related(
            'categories', 'tags'
        )


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows categories to be viewed.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class SubscriberCreateAPIView(generics.CreateAPIView):
    """
    API endpoint that allows new subscribers to sign up.
    """
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = [AllowAny]


# API endpoint to fetch the active theme and hero section data
@api_view(['GET'])
@permission_classes([AllowAny])
def active_theme(request):
    """Returns the active theme with hero image, box color, and navbar flag."""
    ext = ExtendedTheme.objects.select_related('theme').first()
    if not ext:
        # Return null if no extended theme is configured
        return Response(None)
    serializer = ActiveThemeSerializer(ext)
    return Response(serializer.data) 