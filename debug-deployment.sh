#!/bin/bash

# Deployment Debug Script
# Run this script to check common deployment issues

echo "🔍 AREA Deployment Debug Script"
echo "================================"

# Check git status
echo "📋 Git Status:"
git status --porcelain
echo ""

# Check current branch and remotes
echo "🌿 Current Branch & Remotes:"
echo "Current branch: $(git branch --show-current)"
echo "Personal remote: $(git remote get-url personal)"
echo "Origin remote: $(git remote get-url origin)"
echo ""

# Check latest commits
echo "📝 Latest commits on personal-main:"
git log --oneline personal-main -5
echo ""

# Check if changes are pushed to personal remote
echo "🚀 Remote sync status:"
LOCAL_COMMIT=$(git rev-parse personal-main)
REMOTE_COMMIT=$(git rev-parse personal/personal-main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ Local and remote personal-main are in sync"
else
    echo "❌ Local changes not pushed to personal remote"
    echo "   Run: git push personal personal-main"
fi
echo ""

# Check CircleCI status (requires curl)
echo "🔄 Testing website status:"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://46.101.186.62/ || echo "Failed")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Website is responding (HTTP 200)"
else
    echo "❌ Website issue (HTTP $RESPONSE)"
fi
echo ""

# Check if build files exist
echo "📁 Frontend build files:"
if [ -d "frontend/dist" ]; then
    echo "✅ Frontend dist directory exists"
    if [ -d "frontend/dist/logo" ]; then
        echo "✅ Logo directory exists in dist"
        echo "   Logo files: $(ls frontend/dist/logo/ 2>/dev/null | wc -l) files"
    else
        echo "❌ Logo directory missing in dist"
    fi
else
    echo "❌ Frontend dist directory missing (run npm run build)"
fi
echo ""

# Check database seeder
echo "🌱 Database seeder configuration:"
if grep -q "ServicesSeeder" backend/database/seeders/DatabaseSeeder.php; then
    echo "✅ ServicesSeeder is included in DatabaseSeeder"
else
    echo "❌ ServicesSeeder not found in DatabaseSeeder"
fi
echo ""

echo "🎯 Deployment checklist:"
echo "1. ✅ Make changes to your code"
echo "2. ✅ Commit changes: git commit -m 'your message'"
echo "3. ✅ Push to personal remote: git push personal personal-main"
echo "4. ⏳ Wait for CircleCI deployment (~5-10 minutes)"
echo "5. 🌐 Check http://46.101.186.62/ for changes"
echo ""

echo "📊 Next steps if deployment fails:"
echo "- Check CircleCI dashboard: https://app.circleci.com/pipelines/github/EthanBranchereau/area-cicd-mirror"
echo "- SSH to server: ssh root@46.101.186.62"  
echo "- Check server logs: supervisorctl tail -f laravel-backend"
echo ""