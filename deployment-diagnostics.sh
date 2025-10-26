#!/bin/bash

echo "🔍 COMPREHENSIVE DEPLOYMENT DIAGNOSTICS"
echo "======================================="
echo ""

# 1. Check git status and recent commits
echo "📋 1. GIT STATUS & RECENT COMMITS"
echo "Current branch: $(git branch --show-current)"
echo "Latest local commit: $(git log --oneline -1)"
echo "Latest remote commit: $(git log --oneline personal/personal-main -1 2>/dev/null || echo 'Cannot fetch remote')"
echo ""

# 2. Check CircleCI configuration
echo "📋 2. CIRCLECI CONFIGURATION"
if [ -f ".circleci/config.yml" ]; then
    echo "✅ CircleCI config exists"
    echo "Branch filter: $(grep -A2 -B2 'personal-main' .circleci/config.yml | head -5)"
else
    echo "❌ No CircleCI config found"
fi
echo ""

# 3. Test current deployment
echo "📋 3. CURRENT DEPLOYMENT STATUS"
echo "🌐 Frontend status:"
FRONTEND_RESPONSE=$(curl -s -I http://46.101.186.62/ | head -1)
echo "   Response: $FRONTEND_RESPONSE"

LAST_MODIFIED=$(curl -s -I http://46.101.186.62/ | grep "Last-Modified" | cut -d' ' -f2-)
echo "   Last Modified: $LAST_MODIFIED"

# Check if it's a Laravel app or static files
MAIN_PAGE=$(curl -s http://46.101.186.62/)
if echo "$MAIN_PAGE" | grep -q "vite.svg"; then
    echo "   ✅ Frontend: React/Vite app detected"
    JS_FILE=$(echo "$MAIN_PAGE" | grep -o 'assets/index-[^"]*\.js' | head -1)
    echo "   JS Bundle: $JS_FILE"
else
    echo "   ❌ Frontend: Unexpected content type"
fi

echo ""
echo "🔧 Backend status:"
API_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" http://46.101.186.62/api/services)
HTTP_CODE=$(echo "$API_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
echo "   API Response Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Backend: API responding correctly"
    SERVICES_COUNT=$(echo "$API_RESPONSE" | grep -o '"id":[0-9]' | wc -l)
    ACTIVE_COUNT=$(echo "$API_RESPONSE" | grep -o '"status":"active"' | wc -l)
    echo "   Services: $SERVICES_COUNT total, $ACTIVE_COUNT active"
else
    echo "   ❌ Backend: API not responding correctly"
fi

echo ""
echo "📋 4. DEPLOYMENT PIPELINE ANALYSIS"

# Check if personal remote is configured correctly
PERSONAL_REMOTE=$(git remote get-url personal 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Personal remote configured: $PERSONAL_REMOTE"
else
    echo "❌ Personal remote not configured"
fi

# Check CircleCI project
echo ""
echo "📋 5. POTENTIAL ISSUES"
echo ""

# Issue 1: Check if we're pushing to the right branch/remote
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse personal/personal-main 2>/dev/null)

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    echo "✅ Local and remote are in sync"
else
    echo "❌ Local and remote are NOT in sync"
    echo "   Local:  $LOCAL_HASH"
    echo "   Remote: $REMOTE_HASH"
fi

# Issue 2: Check deployment timing
echo ""
LAST_COMMIT_TIME=$(git log -1 --format="%ct")
CURRENT_TIME=$(date +%s)
TIME_DIFF=$((CURRENT_TIME - LAST_COMMIT_TIME))

echo "⏰ Time since last commit: ${TIME_DIFF}s ($(($TIME_DIFF / 60)) minutes)"

if [ $TIME_DIFF -lt 1800 ]; then  # 30 minutes
    echo "✅ Recent commit - deployment should be running or complete"
else
    echo "❌ Old commit - may need to trigger new deployment"
fi

echo ""
echo "📋 6. NEXT STEPS RECOMMENDATION"
echo ""

# Determine what's wrong and suggest fixes
if [ "$ACTIVE_COUNT" -gt 0 ] && [ "$HTTP_CODE" = "200" ]; then
    echo "🔧 Backend deployment: ✅ WORKING"
    echo "   - Services are active in API"
    echo "   - Database seeding worked"
else
    echo "🔧 Backend deployment: ❌ FAILED"
    echo "   - Check server logs: ssh root@46.101.186.62 'supervisorctl tail laravel-backend'"
fi

# Check if frontend is updating
EXPECTED_NEWER_MODIFIED="Sun, 26 Oct 2025 17:0"  # Should be after 17:00
if echo "$LAST_MODIFIED" | grep -q "$EXPECTED_NEWER_MODIFIED"; then
    echo "🔧 Frontend deployment: ✅ WORKING"
else
    echo "🔧 Frontend deployment: ❌ FAILED"
    echo "   - Frontend hasn't been rebuilt"
    echo "   - Check CircleCI build logs"
    echo "   - Verify file copying in deployment script"
fi

echo ""
echo "🛠️  DEBUGGING COMMANDS:"
echo ""
echo "1. Check CircleCI pipeline status:"
echo "   Visit: https://app.circleci.com/pipelines/github/EthanBranchereau/area-cicd-mirror"
echo ""
echo "2. SSH to server and check deployment:"
echo "   ssh root@46.101.186.62"
echo "   cd /home/deploy/area-app"
echo "   git log --oneline -5"
echo "   ls -la frontend/dist/"
echo "   supervisorctl status"
echo ""
echo "3. Force new deployment:"
echo "   git commit --amend -m 'Force deployment trigger'"
echo "   git push personal personal-main --force"
echo ""