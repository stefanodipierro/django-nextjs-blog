from django.db.models.signals import post_save
from django.dispatch import receiver
from admin_interface.models import Theme
from .models import ExtendedTheme

 
@receiver(post_save, sender=Theme)
def create_extended_theme(sender, instance, created, **kwargs):
    """Auto-create ExtendedTheme record when a new Theme is created."""
    if created:
        ExtendedTheme.objects.create(theme=instance) 