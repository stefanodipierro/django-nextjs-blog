from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet, CategoryViewSet,
    FeaturedPostsAPIView, SubscriberCreateAPIView
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    path('featured-posts/', FeaturedPostsAPIView.as_view(), name='featured-posts'),
    path('subscribe/', SubscriberCreateAPIView.as_view(), name='subscribe'),
] 