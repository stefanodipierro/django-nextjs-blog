import os
from django.http import FileResponse
from django.conf import settings

class WebPMiddleware:
    """
    If the request is for an image and the browser supports WebP,
    serve the .webp version if it exists.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        if path.startswith('/media/') and path.lower().endswith(('.jpg', '.jpeg', '.png')):
            accept = request.META.get('HTTP_ACCEPT', '')
            if 'image/webp' in accept:
                webp_path = os.path.splitext(path)[0] + '.webp'
                full_webp_path = os.path.join(settings.MEDIA_ROOT, webp_path.replace('/media/', ''))
                if os.path.exists(full_webp_path):
                    return FileResponse(open(full_webp_path, 'rb'), content_type='image/webp')
        return self.get_response(request) 