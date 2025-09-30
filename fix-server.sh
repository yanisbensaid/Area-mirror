#!/bin/bash

echo "=== AREA Application Server Fix Script ==="
echo "Run this script on your server via SSH"
echo

# Check current status
echo "1. Checking current service status..."
sudo systemctl status nginx --no-pager || echo "Nginx not installed/running"
sudo systemctl status php8.2-fpm --no-pager || echo "PHP-FPM not running"

echo -e "\n2. Checking what's listening on port 80..."
sudo netstat -tlnp | grep ':80' || echo "Nothing listening on port 80"

echo -e "\n3. Installing/Starting Nginx if needed..."
sudo apt-get update -qq
sudo apt-get install -y nginx

echo -e "\n4. Creating basic nginx configuration..."
sudo tee /etc/nginx/sites-available/area-app > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Serve frontend at root
    root /home/ubuntu/area-frontend;
    index index.html index.htm;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes to Laravel
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Laravel public assets
    location /laravel {
        alias /home/ubuntu/area-backend/public;
        try_files $uri $uri/ @laravel;
    }

    location @laravel {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        return 200 'Server is working!';
        add_header Content-Type text/plain;
    }
}
EOF

echo -e "\n5. Enabling the site..."
sudo ln -sf /etc/nginx/sites-available/area-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo -e "\n6. Testing nginx configuration..."
sudo nginx -t

echo -e "\n7. Creating test files if they don't exist..."
sudo mkdir -p /home/ubuntu/area-frontend
sudo mkdir -p /home/ubuntu/area-backend/public

# Create a simple frontend test page
if [ ! -f /home/ubuntu/area-frontend/index.html ]; then
    cat > /tmp/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AREA Application</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <h1>🚀 AREA Application</h1>
    <div class="status success">
        <strong>✅ Frontend Status:</strong> Deployed successfully!
    </div>
    <div class="status info">
        <strong>📡 Server:</strong> 144.24.201.112<br>
        <strong>⏰ Deployed:</strong> <span id="time"></span>
    </div>
    
    <h2>🔗 Available Endpoints:</h2>
    <ul>
        <li><a href="/health">/health</a> - Server health check</li>
        <li><a href="/api">/api</a> - Laravel API (if running)</li>
        <li><a href="/laravel">/laravel</a> - Laravel public files</li>
    </ul>

    <h2>🔧 Debug Information:</h2>
    <button onclick="testAPI()">Test API Connection</button>
    <div id="api-result"></div>

    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
        
        function testAPI() {
            fetch('/api')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('api-result').innerHTML = 
                        '<div class="status success">API Response: ' + data + '</div>';
                })
                .catch(error => {
                    document.getElementById('api-result').innerHTML = 
                        '<div class="status info">API not available: ' + error + '</div>';
                });
        }
    </script>
</body>
</html>
EOF
    sudo cp /tmp/index.html /home/ubuntu/area-frontend/index.html
fi

# Create a simple Laravel test page
if [ ! -f /home/ubuntu/area-backend/public/index.php ]; then
    echo "<?php echo '<h1>Laravel Backend</h1><p>Time: ' . date('Y-m-d H:i:s') . '</p>'; ?>" | sudo tee /home/ubuntu/area-backend/public/test.php > /dev/null
fi

echo -e "\n8. Setting proper permissions..."
sudo chown -R www-data:www-data /home/ubuntu/area-frontend
sudo chown -R www-data:www-data /home/ubuntu/area-backend
sudo chmod -R 755 /home/ubuntu/area-frontend
sudo chmod -R 755 /home/ubuntu/area-backend

echo -e "\n9. Checking firewall settings..."
sudo ufw status
echo "Opening ports if ufw is active..."
sudo ufw allow 80
sudo ufw allow 443

echo -e "\n10. Checking for blocking iptables rules..."
if sudo iptables -L INPUT | grep -q "REJECT.*icmp-host-prohibited"; then
    echo "Found blocking iptables rule, attempting to fix..."
    sudo iptables -D INPUT -j REJECT --reject-with icmp-host-prohibited 2>/dev/null || echo "Rule removal failed"
    sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
    sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
fi

echo -e "\n11. Starting services..."
sudo systemctl enable nginx
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager

echo -e "\n12. Testing local connectivity..."
sleep 2
curl -I http://localhost || echo "Local test failed"
curl -s http://localhost/health || echo "Health check failed"

echo -e "\n13. Final status check..."
echo "Services running:"
sudo systemctl is-active nginx
sudo netstat -tlnp | grep ':80'

echo -e "\n=== Setup Complete! ==="
echo "Your server should now be accessible at: http://144.24.201.112"
echo "Health check: http://144.24.201.112/health"
echo ""
echo "If Laravel backend is needed, start it with:"
echo "cd /home/ubuntu/area-backend && nohup php artisan serve --host=127.0.0.1 --port=8000 > laravel.log 2>&1 &"