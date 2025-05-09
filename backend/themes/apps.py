from django.apps import AppConfig


class ThemesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'themes'
    def ready(self):
        # Ensure signals are registered
        import themes.signals 