import os
import sys
import django

# Configure Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

User = get_user_model()

# Superuser credentials
USERNAME = 'admin'
EMAIL = 'admin@example.com'
PASSWORD = 'adminpassword123'

def create_superuser():
    try:
        superuser = User.objects.create_superuser(
            username=USERNAME,
            email=EMAIL,
            password=PASSWORD
        )
        print(f"Superuser '{USERNAME}' created successfully!")
        print(f"Email: {EMAIL}")
        print(f"Password: {PASSWORD}")
    except IntegrityError:
        user = User.objects.get(username=USERNAME)
        if not user.is_superuser:
            user.is_superuser = True
            user.is_staff = True
            user.set_password(PASSWORD)
            user.save()
            print(f"User '{USERNAME}' already exists. Updated to superuser with new password.")
        else:
            print(f"Superuser '{USERNAME}' already exists.")

if __name__ == "__main__":
    create_superuser() 