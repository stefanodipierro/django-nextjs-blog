from django.contrib import admin
from .models import Post
from django_summernote.admin import SummernoteModelAdmin


@admin.register(Post)
class PostAdmin(SummernoteModelAdmin):
    summernote_fields = ('content',)
    list_display = (
        'title',
        'slug',
        'status',
        'is_featured',
        'published_at',
    )
    list_filter = ('status', 'is_featured', 'published_at', 'categories')
    search_fields = ('title', 'slug', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'published_at'
    ordering = ('-published_at',)
    filter_horizontal = ('categories',)
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'excerpt', 'content')
        }),
        ('Images', {
            'fields': ('featured_image', 'side_image_1', 'side_image_2'),
            'classes': ('collapse',),
        }),
        ('Publication', {
            'fields': ('status', 'is_featured', 'published_at', 'categories', 'tags')
        }),
    ) 