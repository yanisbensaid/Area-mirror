/**
 * Services index file
 * Exports all services for easy importing
 */

export { default as apiService } from './api';
export { default as oauthService } from './oauth';

// Export types
export type { User, ApiResponse, LoginCredentials, RegisterCredentials, AuthResponse, ServiceConfig, Automation } from './api';