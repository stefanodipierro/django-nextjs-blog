# =============================================================================
# POWERSHELL SCRIPT FOR WINDOWS - FILE TRANSFER TO VPS
# Transfers all necessary files from local Windows to production VPS
# =============================================================================

$VPS_IP = "217.65.144.19"
$VPS_USER = "root"
$LOCAL_PROJECT_DIR = Get-Location
$REMOTE_DIR = "/opt/blog-production"

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "    TRANSFERRING FILES TO PRODUCTION VPS" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "VPS: $VPS_IP" -ForegroundColor Green
Write-Host "Remote Dir: $REMOTE_DIR" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Blue

# Check if SCP is available
if (!(Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: SCP not found. Please install OpenSSH client for Windows or use WSL." -ForegroundColor Red
    Write-Host "You can install it via: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating remote directory..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# Create temporary directory for files to transfer
$TempDir = "temp-transfer"
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

Write-Host "Preparing files for transfer..." -ForegroundColor Yellow

# Copy project files excluding unnecessary directories
$ExcludeDirs = @(".git", "node_modules", ".next", "__pycache__", "production-deploy", "memory-bank", ".cursor")
$ExcludeFiles = @("*.pyc", ".env.dev", ".env.dev.backup")

# Copy backend
robocopy "backend" "$TempDir/backend" /E /XD $ExcludeDirs /XF $ExcludeFiles | Out-Null

# Copy frontend
robocopy "frontend" "$TempDir/frontend" /E /XD $ExcludeDirs /XF $ExcludeFiles | Out-Null

# Copy root files
Copy-Item "docker-compose.yml" "$TempDir/" -ErrorAction SilentlyContinue
Copy-Item "README.md" "$TempDir/" -ErrorAction SilentlyContinue
Copy-Item ".gitignore" "$TempDir/" -ErrorAction SilentlyContinue
Copy-Item "package.json" "$TempDir/" -ErrorAction SilentlyContinue

Write-Host "Transferring project files..." -ForegroundColor Yellow
scp -r "$TempDir/*" "${VPS_USER}@${VPS_IP}:$REMOTE_DIR/"

Write-Host "Transferring production configuration files..." -ForegroundColor Yellow
scp "production-deploy/docker-compose.prod.yml" "${VPS_USER}@${VPS_IP}:$REMOTE_DIR/docker-compose.prod.yml"
scp "production-deploy/frontend/Dockerfile.prod" "${VPS_USER}@${VPS_IP}:$REMOTE_DIR/frontend/Dockerfile.prod"
scp "production-deploy/deploy.sh" "${VPS_USER}@${VPS_IP}:$REMOTE_DIR/deploy.sh"

Write-Host "Making deployment script executable..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "chmod +x $REMOTE_DIR/deploy.sh"

Write-Host "Updating Next.js configuration for production..." -ForegroundColor Yellow
$NextConfigContent = @"
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
"@

$NextConfigContent | ssh $VPS_USER@$VPS_IP "cat > $REMOTE_DIR/frontend/next.config.js"

Write-Host "Updating backend requirements..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "echo '' >> $REMOTE_DIR/backend/requirements.txt"
ssh $VPS_USER@$VPS_IP "echo '# Production dependencies' >> $REMOTE_DIR/backend/requirements.txt"
ssh $VPS_USER@$VPS_IP "echo 'gunicorn==21.2.0' >> $REMOTE_DIR/backend/requirements.txt"

# Cleanup
Remove-Item -Recurse -Force $TempDir

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "    FILE TRANSFER COMPLETED!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. SSH into your VPS: ssh root@$VPS_IP" -ForegroundColor White
Write-Host "2. Go to project directory: cd $REMOTE_DIR" -ForegroundColor White
Write-Host "3. Run deployment script: ./deploy.sh" -ForegroundColor White
Write-Host ""
Write-Host "The deployment script will:" -ForegroundColor Yellow
Write-Host "- Configure the production environment" -ForegroundColor White
Write-Host "- Build and start all Docker containers" -ForegroundColor White
Write-Host "- Set up Nginx reverse proxy" -ForegroundColor White
Write-Host "- Create Django superuser" -ForegroundColor White
Write-Host "- Configure automated backups" -ForegroundColor White
Write-Host ""
Write-Host "After deployment, your blog will be available at:" -ForegroundColor Yellow
Write-Host "🌐 Website: http://$VPS_IP" -ForegroundColor Green
Write-Host "🔧 Admin: http://$VPS_IP/admin" -ForegroundColor Green
Write-Host "" 