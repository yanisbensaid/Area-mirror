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

# Start with dev client
npm run start:dev

# Android development
npm run android:dev

# iOS development  
npm run ios:dev
```

### Production
```bash
# Start production preview
npm run start:prod

# Android production
npm run android:prod

# iOS production
npm run ios:prod

# Build production app
npm run build:prod
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