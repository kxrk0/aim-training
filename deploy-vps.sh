#!/bin/bash
# ===============================================
# AIM TRAINER PRO - VPS DEPLOYMENT SCRIPT
# ===============================================

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/aim-trainer"
LOG_DIR="/var/log/aim-trainer"
REPO_URL="https://github.com/swaffX/aim-training.git" # Bu URL'yi güncelleyin
BRANCH="main"
PM2_APP_NAME="aim-trainer-pro"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  AIM TRAINER PRO - VPS DEPLOYMENT${NC}"
echo -e "${BLUE}===============================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (sudo ./deploy-vps.sh)"
    exit 1
fi

# Create necessary directories
print_status "Creating directories..."
mkdir -p $PROJECT_DIR
mkdir -p $LOG_DIR
chown -R www-data:www-data $LOG_DIR

# Clone or update repository
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    print_status "Cloning repository..."
    rm -rf $PROJECT_DIR/*
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
    git checkout $BRANCH
fi

# Check if .env file exists
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    print_warning ".env file not found! Creating from .env.example..."
    cp $PROJECT_DIR/server/.env.example $PROJECT_DIR/server/.env
    print_warning "Please edit $PROJECT_DIR/server/.env with your actual values!"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install --production

# Build server
print_status "Building server..."
cd server
npm run build
cd ..

# Stop existing PM2 process (if running)
print_status "Stopping existing PM2 process..."
pm2 stop $PM2_APP_NAME 2>/dev/null || true
pm2 delete $PM2_APP_NAME 2>/dev/null || true

# Start with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup systemd -u www-data --hp /var/www

# Check application status
sleep 5
if pm2 describe $PM2_APP_NAME > /dev/null; then
    print_status "Application started successfully!"
    pm2 status
else
    print_error "Failed to start application!"
    exit 1
fi

# Test health endpoint
print_status "Testing health endpoint..."
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    print_status "Health check passed!"
else
    print_warning "Health check failed. Check logs: pm2 logs $PM2_APP_NAME"
fi

echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "${BLUE}Application URL:${NC} https://aim.liorabelleleather.com"
echo -e "${BLUE}Health Check:${NC} https://aim.liorabelleleather.com/health"
echo -e "${BLUE}PM2 Status:${NC} pm2 status"
echo -e "${BLUE}PM2 Logs:${NC} pm2 logs $PM2_APP_NAME"
echo -e "${BLUE}PM2 Monitor:${NC} pm2 monit" 