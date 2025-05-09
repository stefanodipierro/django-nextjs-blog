from django.contrib import admin
from django.utils import timezone
from .models import Post
from django_summernote.admin import SummernoteModelAdmin


@admin.register(Post)
class PostAdmin(SummernoteModelAdmin):
    summernote_fields = ('content',)
    
    def scheduling_status(self, obj):
        if obj.status == 'published':
            return "Published"
        elif obj.status == 'draft' and obj.published_at and obj.published_at > timezone.now():
            return f"Scheduled for {obj.published_at.strftime('%Y-%m-%d %H:%M')}"
        return "Draft"
    
    scheduling_status.short_description = "Status"
    
    list_display = (
        'title',
        'slug',
        'scheduling_status',  # Use our custom method instead of 'status'
        'is_featured',
        'published_at',
    )
    list_filter = ('status', 'is_featured', 'published_at', 'categories')
    search_fields = ('title', 'slug', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'published_at'
    ordering = ('-published_at',)
    filter_horizontal = ('categories',)
    
    actions = ['schedule_selected_posts']
    
    def schedule_selected_posts(self, request, queryset):
        """Schedule posts to be published at their published_at time"""
        updated = 0
        already_scheduled = 0
        now = timezone.now()
        
        for post in queryset:
            # Skip posts that are already published or have a published_at date in the past
            if post.status == 'published' or not post.published_at or post.published_at <= now:
                already_scheduled += 1
                continue
            
            # Ensure the post remains a draft so it can be published by Celery later
            if post.status != 'draft':
                post.status = 'draft'
                post.save()
                updated += 1
        
        if updated:
            message = f"{updated} posts have been scheduled for future publication."
            if already_scheduled:
                message += f" {already_scheduled} posts were skipped (already published or past date)."
            self.message_user(request, message)
        else:
            self.message_user(request, "No posts were scheduled. Posts must have a future publication date.")
    
    schedule_selected_posts.short_description = "Schedule selected posts for future publication"
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'excerpt', 'content')
        }),
        ('Images', {
            'fields': ('featured_image', 'side_image_1', 'side_image_2'),
        }),
        ('Publication', {
            'fields': ('status', 'is_featured', 'published_at', 'categories', 'tags'),
            'description': 'Set publication date in the future and status as "Draft" for scheduled publishing.'
        }),
    ) 