#!/bin/bash

# Frontend deployment script
echo "🚀 Deploying corrected frontend to production server..."

SERVER_IP="46.101.186.62"
SERVER_USER="root"
SERVER_PASSWORD="F7zK8mN4qP9xR2wE"

echo "📦 Creating frontend archive..."
cd frontend
tar -czf ../frontend-dist.tar.gz -C dist .
cd ..

echo "📤 Uploading to server..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no frontend-dist.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "🔄 Extracting on server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'DEPLOY_EOF'
    cd /var/www/html
    rm -rf *
    cd /tmp
    tar -xzf frontend-dist.tar.gz -C /var/www/html/
    rm frontend-dist.tar.gz
    chown -R www-data:www-data /var/www/html
    systemctl reload apache2
DEPLOY_EOF

echo "✅ Frontend deployment completed!"

# Clean up local archive
rm -f frontend-dist.tar.gz
