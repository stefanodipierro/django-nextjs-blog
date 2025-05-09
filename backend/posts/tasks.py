from celery import shared_task
from django.utils import timezone
import logging

from .models import Post

logger = logging.getLogger(__name__)


@shared_task
def publish_scheduled_posts():
    """
    Check for posts with published_at <= now and status='draft'.
    Automatically publish them when their scheduled time is reached.
    """
    now = timezone.now()
    scheduled_posts = Post.objects.filter(
        status='draft',
        published_at__lte=now
    )
    
    count = scheduled_posts.count()
    if count:
        # Get list of posts before update for logging
        posts_to_publish = list(scheduled_posts.values('id', 'title'))
        
        # Update status to published
        scheduled_posts.update(status='published')
        
        # Log each published post
        for post in posts_to_publish:
            logger.info(f"Automatically published post: {post['title']} (ID: {post['id']})")
    
    return f"Published {count} scheduled posts" 