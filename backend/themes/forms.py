from django import forms
from django.utils.translation import gettext_lazy as _
from admin_interface.models import Theme
from .models import ExtendedTheme
from colorfield.fields import ColorField
from colorfield.widgets import ColorWidget

# ThemeForm removed - we will not be using a custom form for Theme 