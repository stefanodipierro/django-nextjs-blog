#!/bin/bash

# =============================================================================
# FILE TRANSFER SCRIPT TO VPS
# Transfers all necessary files from local to production VPS
# =============================================================================

VPS_IP="217.65.144.19"
VPS_USER="root"
LOCAL_PROJECT_DIR="$(pwd)"
REMOTE_DIR="/opt/blog-production"

echo "==============================================="
echo "    TRANSFERRING FILES TO PRODUCTION VPS"
echo "==============================================="
echo "VPS: $VPS_IP"
echo "Remote Dir: $REMOTE_DIR"
echo "==============================================="

# Create remote directory
echo "Creating remote directory..."
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# Transfer project files (excluding unnecessary directories)
echo "Transferring project files..."
rsync -avz --progress \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='__pycache__/' \
  --exclude='*.pyc' \
  --exclude='.env.dev' \
  --exclude='.env.dev.backup' \
  --exclude='production-deploy/' \
  --exclude='memory-bank/' \
  --exclude='.cursor/' \
  $LOCAL_PROJECT_DIR/ $VPS_USER@$VPS_IP:$REMOTE_DIR/

# Transfer production configuration files
echo "Transferring production configuration..."
scp production-deploy/docker-compose.prod.yml $VPS_USER@$VPS_IP:$REMOTE_DIR/docker-compose.prod.yml
scp production-deploy/frontend/Dockerfile.prod $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/Dockerfile.prod

# Transfer and make executable the deployment script
echo "Transferring deployment script..."
scp production-deploy/deploy.sh $VPS_USER@$VPS_IP:$REMOTE_DIR/deploy.sh
ssh $VPS_USER@$VPS_IP "chmod +x $REMOTE_DIR/deploy.sh"

# Update Next.js config for production
echo "Updating Next.js configuration for production..."
ssh $VPS_USER@$VPS_IP "cat > $REMOTE_DIR/frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'django',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '217.65.144.19',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
}

module.exports = nextConfig
EOF"

# Update backend requirements for production
echo "Updating backend requirements..."
ssh $VPS_USER@$VPS_IP "cat >> $REMOTE_DIR/backend/requirements.txt << 'EOF'

# Production dependencies
gunicorn==21.2.0
EOF"

echo ""
echo "==============================================="
echo "    FILE TRANSFER COMPLETED!"
echo "==============================================="
echo ""
echo "Next steps:"
echo "1. SSH into your VPS: ssh root@$VPS_IP"
echo "2. Go to project directory: cd $REMOTE_DIR"
echo "3. Run deployment script: ./deploy.sh"
echo ""
echo "The deployment script will:"
echo "- Configure the production environment"
echo "- Build and start all Docker containers"
echo "- Set up Nginx reverse proxy"
echo "- Create Django superuser"
echo "- Configure automated backups"
echo ""
echo "After deployment, your blog will be available at:"
echo "🌐 Website: http://$VPS_IP"
echo "🔧 Admin: http://$VPS_IP/admin"
echo "" 