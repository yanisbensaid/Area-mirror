# AREA Mobile App Configuration

This document explains how the mobile app has been configured to use your new backend and database settings.

## Configuration Changes Made

### 1. Backend API URL Updated
- **Old URL**: `http://46.101.186.62/api`
- **New URL**: `https://api.syncreviews.eu/api`

### 2. Database Configuration Added
- **Database URL**: `http://146.190.20.45:8000/project/acs0ckc4wgwosco4w88sk08o/environment/fs08gk44wosck0cgs8sowkco/database/css4kgswogwk8c0occosc8ks`
- **Username**: `postgres`
- **Password**: *(to be entered manually when needed)*

## Files Modified

### 1. Configuration System
- `constants/config.ts` - Main configuration file
- `constants/database.ts` - Database utilities
- `constants/index.ts` - Exports all constants
- `services/api.ts` - Updated to use new configuration

### 2. App Configuration
- `app.json` - Development configuration
- `app.production.json` - Production configuration
- `.env.example` - Environment template

### 3. Utilities
- `utils/configTest.ts` - Configuration testing utility

## How to Use

### Testing Configuration
To test if the configuration is working properly:

```javascript
import ConfigTest from './utils/configTest';

// Display current configuration
ConfigTest.displayConfig();

// Run all tests
ConfigTest.runAllTests();
```

### Using the API Service
The API service automatically uses the new configuration:

```javascript
import apiService from './services/api';

// All API calls now use https://api.syncreviews.eu/api
const response = await apiService.login({ email, password });
```

### Environment Variables
You can override configuration using environment variables in `.env.local`:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.syncreviews.eu/api
EXPO_PUBLIC_DATABASE_URL=http://146.190.20.45:8000/project/...
EXPO_PUBLIC_DATABASE_USERNAME=postgres
EXPO_PUBLIC_ENVIRONMENT=production
```

## Important Security Notes

1. **Database Password**: The database password is intentionally not stored in the configuration files for security reasons. It should be entered manually when needed.

2. **Direct Database Access**: Direct database connections from mobile apps are not recommended for production. The mobile app should primarily communicate with your backend API, which then handles database operations securely.

3. **Environment Variables**: Sensitive configuration should be stored in environment variables or secure storage, not in the code.

## Testing the Configuration

1. **Start the development server**:
   ```bash
   cd mobile-client
   npm start
   ```

2. **Test API connectivity**:
   The app will automatically attempt to connect to the new API endpoint when making requests.

3. **Verify in logs**:
   Check the console logs to ensure the configuration is loaded correctly.

## Troubleshooting

### API Connection Issues
- Verify the API URL is accessible: `https://api.syncreviews.eu/api`
- Check CORS settings on the backend
- Ensure the mobile device/emulator can reach the API

### Configuration Not Loading
- Check that `expo-constants` is properly installed
- Verify the `extra` section in `app.json` contains the correct values
- Clear Metro bundler cache: `expo start --clear`

### Database Connection Issues
- Remember that direct database connections from mobile apps are not typical
- Use the backend API for data operations instead
- The database configuration is mainly for reference

## Next Steps

1. Test the mobile app with the new API endpoint
2. Verify all authentication flows work correctly
3. Test data synchronization between mobile and backend
4. Consider implementing offline capabilities with local storage

For any issues, check the configuration test utility and console logs for debugging information.