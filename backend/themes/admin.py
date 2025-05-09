from django.contrib import admin
from .models import ExtendedTheme
from django.utils.translation import gettext_lazy as _


@admin.register(ExtendedTheme)
class ExtendedThemeAdmin(admin.ModelAdmin):
    """Dedicated admin page for the ExtendedTheme model."""
    list_display = ('theme_name', 'hero_image', 'hero_box_color', 'show_navbar')
    fields = ('theme', 'hero_image', 'hero_image_alt', 'hero_box_color', 'show_navbar')
    search_fields = ('theme__name',)
    list_select_related = ('theme',)
    
    def theme_name(self, obj):
        return obj.theme.name if obj.theme else "Unknown Theme"
    theme_name.short_description = _("Theme") 