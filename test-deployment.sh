#!/bin/bash

echo "🔍 AREA API Verification Script"
echo "==============================="
echo ""

# Test API endpoint
echo "📡 Testing API endpoint..."
API_RESPONSE=$(curl -s http://46.101.186.62/api/services)

if [ $? -eq 0 ]; then
    echo "✅ API is responding"
    
    # Count total services
    TOTAL_SERVICES=$(echo "$API_RESPONSE" | grep -o '"id":[0-9]' | wc -l)
    echo "📊 Total services in API: $TOTAL_SERVICES"
    
    # Count active services
    ACTIVE_SERVICES=$(echo "$API_RESPONSE" | grep -o '"status":"active"' | wc -l)
    echo "🟢 Active services: $ACTIVE_SERVICES"
    
    # Count inactive services  
    INACTIVE_SERVICES=$(echo "$API_RESPONSE" | grep -o '"status":"inactive"' | wc -l)
    echo "🔴 Inactive services: $INACTIVE_SERVICES"
    
    echo ""
    if [ "$ACTIVE_SERVICES" -gt 0 ]; then
        echo "✅ Services should now appear on the website!"
    else
        echo "❌ All services still inactive - deployment may not have completed"
        echo "   Wait 5-10 minutes and run this script again"
    fi
else
    echo "❌ API not responding"
fi

echo ""
echo "🖼️ Testing logo files..."
LOGO_TEST=$(curl -s -I http://46.101.186.62/logo/Facebook.png | head -1)
if echo "$LOGO_TEST" | grep -q "200 OK"; then
    echo "✅ Logo files are being served correctly"
else
    echo "❌ Logo files not found - check deployment logs"
fi

echo ""
echo "⏰ Testing deployment timestamp..."
MAIN_PAGE=$(curl -s http://46.101.186.62/)
LAST_MODIFIED=$(curl -s -I http://46.101.186.62/ | grep "Last-Modified" | cut -d' ' -f2-)
echo "📅 Last deployment: $LAST_MODIFIED"

echo ""
echo "🎯 Next steps:"
echo "1. Wait for CircleCI deployment to complete (~5-10 minutes)"
echo "2. Refresh your browser at http://46.101.186.62/"
echo "3. Check that services appear in the 'Available Services' section"
echo "4. Verify deployment timestamp shows in the bottom bar"
echo ""
echo "📊 Monitor deployment: https://app.circleci.com/pipelines/github/EthanBranchereau/area-cicd-mirror"