from admin_interface.models import Theme
from django.db import models
from colorfield.fields import ColorField


class ExtendedTheme(models.Model):
    """
    Extends the built-in Theme model to add hero section fields.
    """
    theme = models.OneToOneField(Theme, on_delete=models.CASCADE, related_name='extended')
    hero_image = models.ImageField(upload_to='hero_images/', blank=True, null=True)
    hero_image_alt = models.CharField(max_length=255, blank=True)
    hero_box_color = ColorField(default='#FFFFFF', blank=True)
    show_navbar = models.BooleanField(default=True, help_text='Toggle display of category navbar on homepage') 