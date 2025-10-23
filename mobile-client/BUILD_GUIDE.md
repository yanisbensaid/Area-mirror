# Mobile App Build Configuration

This mobile app supports both development and production builds with different features enabled.

## Build Types

### Development Build
- **Database Test Tab**: ✅ Visible
- **Debug Features**: ✅ Enabled
- **API Base URL**: Points to development server
- **Hot Reload**: ✅ Enabled

### Production Build  
- **Database Test Tab**: ❌ Hidden
- **Debug Features**: ❌ Disabled
- **API Base URL**: Points to production server
- **Optimized**: ✅ Minified and optimized

## Available Scripts

### Development
```bash
# Start development server
npm run start

# Start with tunnel (required for WSL)
npm run start:tunnel

# Start with dev client
npm run start:dev

# Start dev client with tunnel (WSL)
npm run start:dev:tunnel

# Android development
npm run android:dev

# Android development with tunnel (WSL)
npm run android:dev:tunnel

# iOS development  
npm run ios:dev

# iOS development with tunnel (WSL)
npm run ios:dev:tunnel
```

### Production
```bash
# Start production preview
npm run start:prod

# Start production with tunnel (WSL)
npm run start:prod:tunnel

# Android production
npm run android:prod

# Android production with tunnel (WSL)
npm run android:prod:tunnel

# iOS production
npm run ios:prod

# iOS production with tunnel (WSL)  
npm run ios:prod:tunnel

# Build production app
npm run build:prod
```

## WSL (Windows Subsystem for Linux) Support

When developing in WSL, you **must** use tunnel mode to connect your mobile device to the development server:

### Why Tunnel Mode is Required in WSL
- WSL runs in a virtual network that's not directly accessible from your mobile device
- Tunnel mode creates a secure connection through Expo's servers
- This allows your phone to connect to the development server running in WSL

### Recommended WSL Commands
```bash
# For daily development in WSL
npm run start:tunnel

# For Android testing in WSL  
npm run android:tunnel

# For iOS testing in WSL
npm run ios:tunnel
```

## Environment Detection

The app uses multiple methods to detect the environment:

1. `__DEV__` - React Native development flag
2. `Constants.expoConfig?.extra?.environment` - Expo config environment
3. `process.env.EXPO_PUBLIC_ENV` - Environment variable

## Configuration Files

- `app.json` - Development configuration (includes debug features)
- `app.production.json` - Production configuration (optimized for release)

## Features Conditional on Environment

### Database Test Tab
- **Location**: `app/(tabs)/_layout.tsx`
- **Condition**: Only shows when `isDevelopment === true`
- **Purpose**: Allows developers to test API connectivity and database queries

### Future Development-Only Features
To add more development-only features, use the same pattern:

```tsx
{isDevelopment && (
  // Your development-only component
)}
```

## Testing Builds

### Test Development Build
1. Run `npm run start:dev`
2. Verify Database Test tab is visible
3. Verify hot reload works

### Test Production Build  
1. Run `npm run start:prod`
2. Verify Database Test tab is hidden
3. Verify app is optimized and minified

## Publishing

When publishing to app stores, always use the production configuration:
```bash
npm run build:prod
```

This ensures the Database Test tab and other debug features are not included in the final app distributed to users.

## WSL Troubleshooting

### Common WSL Issues

**"Unable to connect to Metro" or blank QR code:**
- Make sure you're using tunnel mode: `npm run start:tunnel`
- Wait for "Tunnel connected" and "Tunnel ready" messages
- The tunnel URL should look like: `exp://xxx-xxx-anonymous-8081.exp.direct`

**Slow tunnel connection:**
- Tunnel mode can be slower than direct connection due to routing through Expo servers
- This is normal for WSL development

**Port conflicts:**
- If port 8081 is in use, stop other Metro bundlers: `pkill -f "expo start"`
- Or change the port: `expo start --tunnel --port 8082`

### Alternative: Use WSL2 with Port Forwarding
If tunnel mode is too slow, you can set up port forwarding:
```bash
# In Windows PowerShell (as Administrator)
netsh interface portproxy add v4tov4 listenport=8081 connectaddress=localhost connectport=8081
```
Then use regular `npm run start` instead of tunnel mode.