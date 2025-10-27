#!/bin/bash

# Manual Deployment Script for AREA App
# Target: 46.101.186.62

echo "🚀 Starting manual deployment to 46.101.186.62"
echo "============================================="

# Configuration
REMOTE_HOST="46.101.186.62"
REMOTE_USER="root"
DEPLOY_DIR="/home/deploy/area-app"
BACKUP_DIR="/home/deploy/area-app-backup-$(date +%Y%m%d-%H%M%S)"

# Check if we have sshpass
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass is required but not installed"
    exit 1
fi

# Prompt for password if not provided
if [ -z "$SSH_PASSWORD" ]; then
    echo "Please enter SSH password for root@$REMOTE_HOST:"
    read -s SSH_PASSWORD
fi

echo ""
echo "📦 Step 1: Creating deployment archive..."
cd /home/ethan/G-DEV-500-MPL-5-1-area-2

# Create a temporary directory for deployment files
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy backend files (exclude development files)
echo "Copying backend files..."
rsync -av --exclude='vendor/' --exclude='node_modules/' --exclude='.git/' --exclude='storage/logs/' --exclude='storage/framework/cache/' --exclude='storage/framework/sessions/' --exclude='storage/framework/views/' --exclude='bootstrap/cache/' --exclude='database/database.sqlite' backend/ $TEMP_DIR/backend/

# Copy frontend build
echo "Copying frontend build..."
cp -r frontend/dist $TEMP_DIR/frontend-dist

# Create deployment archive
cd $TEMP_DIR
tar -czf deployment.tar.gz backend/ frontend-dist/
echo "✅ Deployment archive created"

echo ""
echo "🔄 Step 2: Uploading to remote server..."

# Upload deployment archive
sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no deployment.tar.gz $REMOTE_USER@$REMOTE_HOST:/tmp/

if [ $? -eq 0 ]; then
    echo "✅ Archive uploaded successfully"
else
    echo "❌ Failed to upload archive"
    exit 1
fi

echo ""
echo "🔧 Step 3: Deploying on remote server..."

# Deploy on remote server
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "
    set -e
    echo 'Starting deployment on remote server...'
    
    # Backup current deployment
    if [ -d '$DEPLOY_DIR' ]; then
        echo 'Backing up current deployment...'
        cp -r $DEPLOY_DIR $BACKUP_DIR
        echo 'Backup created at $BACKUP_DIR'
    fi
    
    # Create deployment directory
    mkdir -p $DEPLOY_DIR
    cd $DEPLOY_DIR
    
    # Extract new deployment
    echo 'Extracting new deployment...'
    tar -xzf /tmp/deployment.tar.gz
    
    # Setup backend
    echo 'Setting up backend...'
    cd backend
    
    # Create necessary directories first
    mkdir -p storage/app/public storage/framework/{cache,sessions,views} bootstrap/cache
    chmod -R 775 storage bootstrap/cache
    
    # Install PHP SQLite extension if needed
    if ! php -m | grep -q sqlite3; then
        echo 'Installing PHP SQLite extension...'
        apt update && apt install -y php-sqlite3
    fi
    
    # Install dependencies
    echo 'Installing PHP dependencies...'
    composer install --no-dev --optimize-autoloader --no-interaction
    
    # Setup environment
    echo 'Creating production environment file...'
    cat > .env << EOF
APP_NAME=AREA
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://46.101.186.62
FRONTEND_URL=http://46.101.186.62

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=$DEPLOY_DIR/backend/database/database.sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="\${APP_NAME}"

SANCTUM_STATEFUL_DOMAINS=46.101.186.62,localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=46.101.186.62
EOF
    
    php artisan key:generate --force
    echo 'Production environment configured'
    
    # Create database if it doesn't exist
    if [ ! -f database/database.sqlite ]; then
        echo 'Creating SQLite database...'
        touch database/database.sqlite
        chmod 664 database/database.sqlite
    fi
    
    # Create necessary directories
    mkdir -p storage/app/public storage/framework/{cache,sessions,views} bootstrap/cache
    
    # Set proper permissions
    chmod -R 775 storage bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache database/database.sqlite
    
    # Clear Laravel caches (ignore errors for missing tables)
    echo 'Clearing Laravel caches...'
    php artisan config:clear || echo 'Config clear failed (expected for fresh install)'
    php artisan route:clear || echo 'Route clear failed (expected for fresh install)'
    php artisan view:clear || echo 'View clear failed (expected for fresh install)'
    
    # Run migrations
    echo 'Running database migrations...'
    php artisan migrate --force
    
    # Now we can clear cache properly since tables exist
    php artisan cache:clear || echo 'Cache clear failed'
    
    # Seed database if needed
    echo 'Seeding database...'
    php artisan db:seed --force || echo 'Seeding failed or not needed'
    
    # Cache optimizations
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Deploy frontend
    echo 'Deploying frontend...'
    sudo rm -rf /var/www/html/*
    sudo cp -r ../frontend-dist/* /var/www/html/
    
    # Fix permissions
    sudo chown -R www-data:www-data /var/www/html/
    sudo chmod -R 755 /var/www/html/
    
    # Restart services
    echo 'Restarting services...'
    
    # Check if supervisor service exists and restart Laravel backend
    if command -v supervisorctl &> /dev/null; then
        supervisorctl restart laravel-backend || echo 'Supervisor not running or service not found'
    fi
    
    # Restart web server (try nginx first, then apache)
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        echo 'Nginx reloaded'
    elif systemctl is-active --quiet apache2; then
        systemctl reload apache2
        echo 'Apache reloaded'
    else
        echo 'No web server found to restart'
    fi
    
    # Cleanup
    rm -f /tmp/deployment.tar.gz
    
    echo 'Deployment completed successfully!'
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your application should be available at: http://46.101.186.62/"
    echo ""
    echo "📋 What was deployed:"
    echo "  - Backend: Laravel application with optimized autoloader"
    echo "  - Frontend: Production build with API URL http://46.101.186.62"
    echo "  - Database: SQLite with migrations and seeding"
    echo "  - Services: Web server and Laravel backend restarted"
    echo ""
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Cleanup local temp files
rm -rf $TEMP_DIR
echo "🧹 Local cleanup completed"
echo ""
echo "🎉 Manual deployment process finished!"