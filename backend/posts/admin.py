from django.contrib import admin
from .models import Post
from markdownx.admin import MarkdownxModelAdmin


@admin.register(Post)
class PostAdmin(MarkdownxModelAdmin):
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