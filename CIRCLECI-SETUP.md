# CircleCI Deployment Setup

This repository uses CircleCI for continuous integration and deployment to your production server.

## 🚀 How It Works

1. **Trigger**: Any push to the `main` branch triggers the deployment pipeline
2. **CI Phase**: 
   - Backend tests (Laravel/PHP)
   - Frontend build (React/Vite)
3. **Deploy Phase**: Code is deployed to production server (46.101.186.62) via SSH
4. **Restart**: Laravel backend and Nginx are restarted automatically
5. **Health Check**: Automated verification that deployment was successful

## 📋 Setup Instructions

### 1. SSH Key Configuration

Your SSH private key is already configured in CircleCI with the fingerprint:
```
SHA256:bSe+ZtgIkA4V/VgHX9iS6m5a9ZJPaPT1Ltn/3oaAezQ
```

### 2. CircleCI Project Setup

1. Go to [CircleCI](https://circleci.com/)
2. Sign in with your GitHub account
3. Add your repository: `EpitechPGE3-2025/G-DEV-500-MPL-5-1-area-2`
4. CircleCI will automatically detect the `.circleci/config.yml` file

### 3. Test the Pipeline

1. Make a small change to your code
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "🚀 Test CircleCI deployment"
   git push origin main
   ```
3. Check the CircleCI dashboard to monitor deployment progress
4. Verify changes are live at http://46.101.186.62/

## 🔧 Deployment Pipeline

### Backend CI (`backend-ci`)
- ✅ Install PHP 8.4 and Composer dependencies
- ✅ Set up Laravel environment
- ✅ Run database migrations
- ✅ Execute backend tests

### Frontend CI (`frontend-ci`)
- ✅ Install Node.js 18 and npm dependencies
- ✅ Run ESLint checks
- ✅ Build production assets with correct API URL
- ✅ Persist build artifacts for deployment

### Production Deploy (`deploy-to-production`)
- ✅ Connect to production server via SSH
- ✅ Backup current deployment
- ✅ Pull latest code from GitHub
- ✅ Install/update backend dependencies
- ✅ Run Laravel setup commands (migrations, caching)
- ✅ Build frontend with production environment
- ✅ Restart services (Supervisor + Nginx)
- ✅ Run health checks

## 🎯 Production Environment

### Server Details
- **Host**: 46.101.186.62
- **User**: root
- **OS**: Ubuntu 25.04
- **Backend**: Laravel 11 + PHP 8.4 + Supervisor
- **Frontend**: React + Vite + Nginx
- **Database**: PostgreSQL

### Deployment Path
```
/home/deploy/area-app/
├── backend/          # Laravel application
├── frontend/         # React application  
│   └── dist/         # Built assets served by Nginx
└── .git/             # Git repository
```

## 🔍 Monitoring & Troubleshooting

### CircleCI Dashboard
Monitor your deployments at: https://app.circleci.com/pipelines/github/EpitechPGE3-2025/G-DEV-500-MPL-5-1-area-2

### Common Issues

**Pipeline fails at SSH connection:**
- Verify SSH key is properly configured in CircleCI
- Check that the public key is in `/root/.ssh/authorized_keys` on production server

**Backend deployment fails:**
- Check PHP/Composer versions match pipeline requirements
- Verify database connectivity and permissions

**Frontend build fails:**
- Check Node.js version compatibility
- Verify all npm dependencies are in package.json

**Services fail to restart:**
- SSH to server and check: `supervisorctl status laravel-backend`
- Check Nginx: `systemctl status nginx`

### Manual Commands

If deployment fails, you can run commands manually on the production server:

```bash
# SSH to production server
ssh root@46.101.186.62

# Check deployment status
cd /home/deploy/area-app
git status

# Restart services manually
supervisorctl restart laravel-backend
systemctl reload nginx

# Check logs
supervisorctl tail -f laravel-backend
tail -f /var/log/nginx/error.log
```

## 🆓 CircleCI Free Tier

CircleCI provides:
- **2,500 credits/month** for free accounts
- **Unlimited private repositories**
- **1 job at a time**

This is sufficient for most small to medium projects. Your current pipeline uses approximately:
- Backend CI: ~100-200 credits
- Frontend CI: ~100-200 credits  
- Deployment: ~50-100 credits
- **Total per deployment**: ~250-500 credits

With 2,500 free credits, you can run **5-10 deployments per month** for free.

## 🔒 Security

- SSH private key stored securely in CircleCI
- Deployment uses dedicated SSH key (not personal key)
- Only `main` branch triggers production deployment
- All secrets encrypted in CircleCI environment

## 📊 Pipeline Status

Check your pipeline status:
- **CircleCI**: https://app.circleci.com/pipelines/github/EpitechPGE3-2025/G-DEV-500-MPL-5-1-area-2
- **Production Site**: http://46.101.186.62/

Your AREA app will automatically deploy whenever you push to the main branch! 🎉