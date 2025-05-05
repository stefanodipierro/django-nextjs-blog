from django import template
from posts.models import Post
from categories.models import Category
from newsletter.models import Subscriber
# Assuming you have a Media model, import it. If not, remove the relevant lines.
# from media.models import Media 

register = template.Library()

@register.simple_tag
def get_post_count():
    """Returns the total count of published posts."""
    return Post.objects.filter(status='published').count()

@register.simple_tag
def get_category_count():
    """Returns the total count of categories."""
    return Category.objects.count()

@register.simple_tag
def get_subscriber_count():
    """Returns the total count of active subscribers."""
    return Subscriber.objects.filter(is_active=True).count()

@register.simple_tag
def get_draft_post_count():
    """Returns the total count of draft posts."""
    return Post.objects.filter(status='draft').count()

# @register.simple_tag
# def get_media_count():
#     """Returns the total count of media files."""
#     try:
#         from media.models import Media
#         return Media.objects.count()
#     except ImportError:
#         return 0 