from django.core.management.base import BaseCommand
from admin_interface.models import Theme

class Command(BaseCommand):
    help = 'Setup default admin interface theme'

    def handle(self, *args, **kwargs):
        # Check if default theme exists
        if Theme.objects.filter(name='Blog Admin Theme').exists():
            self.stdout.write(self.style.SUCCESS('Admin theme already exists'))
            return
        
        # Create custom theme
        theme = Theme.objects.create(
            name='Blog Admin Theme',
            active=True,
            title='Blog Admin',
            title_color='#FFFFFF',
            title_visible=True,
            logo_visible=True,
            
            # Header
            css_header_background_color='#1E293B',
            css_header_text_color='#FFFFFF',
            css_header_link_color='#FFFFFF',
            css_header_link_hover_color='#CCCCCC',
            
            # Modules
            css_module_background_color='#FFFFFF',
            css_module_text_color='#222222',
            css_module_link_color='#2563EB',
            css_module_link_hover_color='#1E40AF',
            css_module_rounded_corners=True,
            
            # Generic Links
            css_generic_link_color='#2563EB',
            css_generic_link_hover_color='#1E40AF',
            
            # Save Buttons
            css_save_button_background_color='#2563EB',
            css_save_button_background_hover_color='#1E40AF',
            css_save_button_text_color='#FFFFFF',
            
            # Delete Buttons
            css_delete_button_background_color='#DC2626',
            css_delete_button_background_hover_color='#B91C1C',
            css_delete_button_text_color='#FFFFFF',
            
            # List Filter
            list_filter_dropdown=True,
            list_filter_sticky=True,
            
            # Related Modal
            related_modal_active=True,
            related_modal_background_color='#000000',
            related_modal_background_opacity=0.8,
            related_modal_rounded_corners=True,
            related_modal_close_button_visible=True,
            
            # Form Layout
            form_submit_sticky=True,
            form_pagination_sticky=True,
            
            # Navigation
            foldable_apps=True,
            show_fieldsets_as_tabs=True,
            show_inlines_as_tabs=True,
            collapsible_stacked_inlines=True,
            collapsible_tabular_inlines=True,
            
            # Improve UX
            recent_actions_visible=True,
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created admin theme: {theme.name}')) 