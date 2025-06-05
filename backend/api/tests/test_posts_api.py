from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from django.test import TestCase

from posts.models import Post
from categories.models import Category


class PostsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Test Category')
        self.post = Post.objects.create(
            title='Published Post',
            content='Content',
            status='published',
            published_at=timezone.now(),
        )
        self.post.categories.add(self.category)
        Post.objects.create(
            title='Draft Post',
            content='Draft',
            status='draft',
            published_at=timezone.now(),
        )

    def test_post_list_returns_published_posts(self):
        url = '/api/v1/posts/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['slug'], self.post.slug)

    def test_post_detail_returns_single_post(self):
        url = f'/api/v1/posts/{self.post.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['slug'], self.post.slug)
