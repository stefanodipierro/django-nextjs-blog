from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from markdownx.models import MarkdownxField
from taggit.managers import TaggableManager


class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    content = MarkdownxField()
    excerpt = models.TextField(blank=True)
    featured_image = models.ImageField(upload_to='posts/%Y/%m/%d/', blank=True, null=True)
    side_image_1 = models.ImageField(upload_to='posts/side_images/', blank=True, null=True, 
                                    help_text="Optional image to float left of content on large screens.")
    side_image_2 = models.ImageField(upload_to='posts/side_images/', blank=True, null=True,
                                    help_text="Optional image to float right of content on large screens.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    
    # Relationships
    categories = models.ManyToManyField('categories.Category', related_name='posts')
    tags = TaggableManager()
    
    class Meta:
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status']),
            models.Index(fields=['is_featured']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return f"/posts/{self.slug}/"
    
    @property
    def reading_time(self):
        """Estimate reading time in minutes."""
        words_per_minute = 200
        word_count = len(self.content.split())
        reading_time = round(word_count / words_per_minute)
        return max(1, reading_time)  # Minimum 1 minute 