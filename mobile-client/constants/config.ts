/**
 * Configuration constants for the mobile app
 */

import Constants from 'expo-constants';

// Get configuration from app.json extra section or use defaults
const getExtraConfig = () => {
  return Constants.expoConfig?.extra ?? {};
};

export const Config = {
  // API Configuration
  API_BASE_URL: getExtraConfig().apiUrl || 'https://api.syncreviews.eu/api',
  
  // Database Configuration
  DATABASE: {
    URL: getExtraConfig().databaseUrl || 'http://146.190.20.45:8000/project/acs0ckc4wgwosco4w88sk08o/environment/fs08gk44wosck0cgs8sowkco/database/css4kgswogwk8c0occosc8ks',
    USERNAME: getExtraConfig().databaseUsername || 'postgres',
    // Password should be entered manually where necessary
  },
  
  // Environment
  ENVIRONMENT: getExtraConfig().environment || 'development',
  
  // App Configuration
  APP: {
    NAME: 'AREA Mobile',
    VERSION: '1.0.0',
    TIMEOUT: 10000, // 10 seconds
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    PREFERENCES: 'user_preferences',
  },
} as const;

export default Config;