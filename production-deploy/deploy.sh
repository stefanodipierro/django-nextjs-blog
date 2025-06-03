#!/bin/bash

# =============================================================================
# DJANGO BLOG PRODUCTION DEPLOYMENT SCRIPT
# For VPS: 217.65.144.19 (Ubuntu 24.04 with Docker)
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="217.65.144.19"
PROJECT_NAME="blog-production"
REPO_URL="https://github.com/yourusername/blog.git"  # Update this with your actual repo
APP_DIR="/opt/$PROJECT_NAME"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "================================================================="
echo "           DJANGO BLOG PRODUCTION DEPLOYMENT"
echo "================================================================="
echo -e "VPS IP: ${GREEN}$VPS_IP${BLUE}"
echo -e "Project: ${GREEN}$PROJECT_NAME${BLUE}"
echo "================================================================="
echo -e "${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

log_info "Starting production deployment..."

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log_info "Installing required packages..."
apt install -y curl wget git htop nano ufw

# Verify Docker installation
log_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_info "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

log_success "Docker and Docker Compose are ready"

# Configure firewall
log_info "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log_success "Firewall configured"

# Create application directory
log_info "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
    log_info "Updating existing repository..."
    git pull origin main
else
    log_info "Cloning repository..."
    # For now, copy files from current deployment
    log_warning "Repository URL not set. Please manually copy your project files to $APP_DIR"
    log_info "You can do this by running: scp -r /path/to/your/blog/* root@$VPS_IP:$APP_DIR/"
fi

# Generate production environment file
log_info "Generating production environment file..."
cat > .env.prod << EOF
# Django Configuration
DEBUG=False
SECRET_KEY=$(openssl rand -base64 32)
DJANGO_ALLOWED_HOSTS=$VPS_IP localhost 127.0.0.1 django

# Database Configuration
POSTGRES_DB=blog_prod_db
POSTGRES_USER=blog_prod_user
POSTGRES_PASSWORD=$(openssl rand -base64 16)
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE=postgres

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

# Celery Configuration
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://$VPS_IP:3000,http://$VPS_IP

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://$VPS_IP/api/v1
NEXT_PUBLIC_INTERNAL_API_URL=http://django:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://$VPS_IP

# Default OpenGraph fallback image URL
NEXT_PUBLIC_DEFAULT_OG_IMAGE=http://$VPS_IP/static/images/default-og.jpg

# Production Settings
ENVIRONMENT=production
EOF

log_success "Production environment file created"

# Copy Docker production configuration
log_info "Setting up Docker production configuration..."
cp docker-compose.prod.yml docker-compose.yml

# Create nginx directory and configuration
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
upstream django_backend {
    server django:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 100M;

    # Serve static files
    location /static/ {
        alias /app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Serve media files
    location /media/ {
        alias /app/mediafiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API endpoints
    location /api/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin media
    location /admin/media/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js frontend (default)
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for Next.js hot reload (dev mode)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

log_success "Nginx configuration created"

# Stop any existing containers
log_info "Stopping any existing containers..."
docker-compose down || true

# Build and start production containers
log_info "Building and starting production containers..."
docker-compose up --build -d

# Wait for services to be ready
log_info "Waiting for services to start..."
sleep 30

# Run Django migrations and create superuser
log_info "Running Django migrations..."
docker-compose exec -T django python manage.py migrate

log_info "Collecting static files..."
docker-compose exec -T django python manage.py collectstatic --noinput

log_info "Creating Django superuser..."
docker-compose exec -T django python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'production123!')
    print('Superuser created: admin / production123!')
else:
    print('Superuser already exists')
EOF

# Set up log rotation
log_info "Setting up log rotation..."
cat > /etc/logrotate.d/blog-production << EOF
/opt/$PROJECT_NAME/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# Create backup script
mkdir -p scripts
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/blog"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump -U blog_prod_user blog_prod_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup media files
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz -C /opt/blog-production mediafiles/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x scripts/backup.sh

# Create update script
cat > scripts/update.sh << 'EOF'
#!/bin/bash
cd /opt/blog-production

echo "Pulling latest changes..."
git pull origin main

echo "Rebuilding containers..."
docker-compose down
docker-compose up --build -d

echo "Running migrations..."
docker-compose exec -T django python manage.py migrate

echo "Collecting static files..."
docker-compose exec -T django python manage.py collectstatic --noinput

echo "Update completed!"
EOF

chmod +x scripts/update.sh

# Setup daily backup cron job
log_info "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/$PROJECT_NAME/scripts/backup.sh") | crontab -

# Final status check
log_info "Checking service status..."
docker-compose ps

echo -e "${GREEN}"
echo "================================================================="
echo "           DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "================================================================="
echo -e "${NC}"
echo -e "🌐 Website: ${GREEN}http://$VPS_IP${NC}"
echo -e "🔧 Admin: ${GREEN}http://$VPS_IP/admin${NC}"
echo -e "👤 Admin User: ${YELLOW}admin${NC}"
echo -e "🔑 Admin Pass: ${YELLOW}production123!${NC}"
echo -e "📁 Project Dir: ${BLUE}$APP_DIR${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test the website: http://$VPS_IP"
echo "2. Login to admin: http://$VPS_IP/admin"
echo "3. Create your first blog post"
echo "4. Configure SSL if needed (future step)"
echo ""
echo -e "${GREEN}Useful Commands:${NC}"
echo "- View logs: docker-compose logs -f"
echo "- Restart: docker-compose restart"
echo "- Update: ./scripts/update.sh"
echo "- Backup: ./scripts/backup.sh"
echo ""
log_success "Deployment script completed!" 