#!/bin/bash

# CI/CD Setup Script for GitHub Actions
# This script helps you set up the required secrets and SSH keys for automatic deployment

echo "🚀 Setting up CI/CD for AREA app deployment"
echo "============================================="

# Check if we're on the VM or local machine
if [[ $(hostname) == "mio-super-machine" ]]; then
    echo "📍 Detected you're on the production VM"
    
    # Generate SSH key for deployment (if it doesn't exist)
    SSH_KEY_PATH="/root/.ssh/github_deploy_key"
    
    if [ ! -f "$SSH_KEY_PATH" ]; then
        echo "🔐 Generating SSH key for GitHub Actions deployment..."
        ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "github-actions-deploy"
        echo "✅ SSH key generated at $SSH_KEY_PATH"
    else
        echo "🔐 SSH key already exists at $SSH_KEY_PATH"
    fi
    
    # Add the public key to authorized_keys
    cat "${SSH_KEY_PATH}.pub" >> /root/.ssh/authorized_keys
    
    echo ""
    echo "📋 COPY THE FOLLOWING INFORMATION TO YOUR GITHUB REPOSITORY SECRETS:"
    echo "======================================================================"
    echo ""
    echo "1. Go to your GitHub repository: https://github.com/EpitechPGE3-2025/G-DEV-500-MPL-5-1-area-2"
    echo "2. Navigate to Settings > Secrets and variables > Actions"
    echo "3. Add the following repository secrets:"
    echo ""
    echo "SECRET NAME: HOST"
    echo "VALUE: 46.101.186.62"
    echo ""
    echo "SECRET NAME: USERNAME" 
    echo "VALUE: root"
    echo ""
    echo "SECRET NAME: PORT"
    echo "VALUE: 22"
    echo ""
    echo "SECRET NAME: SSH_PRIVATE_KEY"
    echo "VALUE (copy everything below, including the header and footer):"
    echo "--------------------------------------------------------"
    cat "$SSH_KEY_PATH"
    echo "--------------------------------------------------------"
    echo ""
    echo "🔧 Additional server setup..."
    
    # Ensure the deploy directory has correct permissions
    chown -R deploy:deploy /home/deploy 2>/dev/null || true
    
    # Make sure git is installed
    if ! command -v git &> /dev/null; then
        echo "📦 Installing git..."
        apt update && apt install -y git
    fi
    
    echo "✅ Server setup complete!"
    
else
    echo "📍 Detected you're on your local machine"
    echo ""
    echo "🔧 To complete the CI/CD setup:"
    echo "1. Run this script on your production VM (46.101.186.62)"
    echo "2. SSH to your server: ssh root@46.101.186.62"
    echo "3. Run: curl -sSL https://raw.githubusercontent.com/your-repo/setup-ci.sh | bash"
    echo "   OR copy this script to your server and run it there"
fi

echo ""
echo "📚 TESTING YOUR CI/CD:"
echo "======================"
echo "1. After adding the secrets to GitHub, make a small change to your code"
echo "2. Commit and push to the main branch:"
echo "   git add ."
echo "   git commit -m 'Test CI/CD deployment'"
echo "   git push origin main"
echo "3. Check the Actions tab in your GitHub repository to see the deployment progress"
echo "4. Verify your changes are live at: http://46.101.186.62/"
echo ""
echo "🎉 CI/CD setup complete! Your app will now auto-deploy on every push to main."