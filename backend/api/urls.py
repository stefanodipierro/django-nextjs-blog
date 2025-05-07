from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet, CategoryViewSet,
    FeaturedPostsAPIView, SubscriberCreateAPIView,
    active_theme
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'categories', CategoryViewSet, basename='category')

# API patterns without the v1/ prefix (it's already added in the main urls.py)
urlpatterns = [
    path('posts/', include(router.urls)),
    path('categories/', include(router.urls)),
    path('featured-posts/', FeaturedPostsAPIView.as_view(), name='featured-posts'),
    path('subscribe/', SubscriberCreateAPIView.as_view(), name='newsletter-subscribe'),
    path('theme/', active_theme, name='active-theme'),
] 