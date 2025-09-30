#!/bin/bash

echo "=== Server Connectivity Debug Script ==="
echo "Testing server: 144.24.201.112"
echo

# Test basic connectivity
echo "1. Testing ping..."
ping -c 3 144.24.201.112

echo -e "\n2. Testing HTTP port 80..."
timeout 10 nc -zv 144.24.201.112 80

echo -e "\n3. Testing HTTPS port 443..."
timeout 10 nc -zv 144.24.201.112 443

echo -e "\n4. Testing SSH port 22..."
timeout 10 nc -zv 144.24.201.112 22

echo -e "\n5. Testing common alternate ports..."
for port in 8080 3000 8000; do
    echo "Testing port $port..."
    timeout 5 nc -zv 144.24.201.112 $port
done

echo -e "\n=== If you have SSH access, run this on the server ==="
cat << 'EOF'
# Check if nginx is running
sudo systemctl status nginx

# Check if ports are listening
sudo netstat -tlnp | grep ':80'

# Check firewall status
sudo ufw status
sudo iptables -L

# Check nginx error logs
sudo tail -20 /var/log/nginx/error.log

# Test local connections
curl -I http://localhost
curl -I http://127.0.0.1

# Check if Laravel is deployed
ls -la /home/ubuntu/area-backend/public/
ls -la /home/ubuntu/area-frontend/
EOF