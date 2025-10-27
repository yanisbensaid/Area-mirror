// API Configuration
// This file provides centralized API URL configuration
// - Development: Uses localhost:8000 (default)
// - Production: Uses VITE_API_URL environment variable set by CircleCI

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  API_URL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'
} as const;

// Helper function to get API URL with endpoint
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = API_CONFIG.API_URL;
  return endpoint ? `${baseUrl}/${endpoint.replace(/^\//, '')}` : baseUrl;
};

// Helper function to get base URL
export const getBaseUrl = () => API_CONFIG.BASE_URL;