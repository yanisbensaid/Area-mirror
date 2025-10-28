// API Service for AREA Mobile App
// This mirrors the functionality from your web frontend API service

import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../constants/config';

const API_BASE_URL = Config.API_BASE_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name?: string;
  confirmPassword: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  auth_url?: string;
  is_connected?: boolean;
}

interface AutomationTrigger {
  service: string;
  action: string;
  config?: Record<string, any>;
}

interface AutomationAction {
  service: string;
  action: string;
  config?: Record<string, any>;
}

interface Automation {
  id?: number;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private initialized: boolean = false;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.initializeToken();
  }

  // Initialize token from AsyncStorage
  private async initializeToken() {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        this.token = storedToken;
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
    } finally {
      this.initialized = true;
    }
  }

  // Wait for initialization to complete
  private async waitForInitialization() {
    let attempts = 0;
    while (!this.initialized && attempts < 100) { // Max 1 second wait
      await new Promise(resolve => setTimeout(resolve, 10));
      attempts++;
    }
    if (!this.initialized) {
      console.warn('API service initialization timeout');
    }
  }

  // Set authentication token
  async setToken(token: string) {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  // Clear authentication token
  async clearToken() {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error clearing token from storage:', error);
    }
  }

  // Get stored user data
  async getStoredUser(): Promise<User | null> {
    await this.waitForInitialization();
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Store user data
  async storeUser(user: User) {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    await this.waitForInitialization();
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  }

  // Get headers with auth token if available
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Config.APP.TIMEOUT);
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      };

      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timed out. Please check your internet connection.',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const result = await this.makeRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (result.success && result.data) {
      await this.setToken(result.data.token);
      await this.storeUser(result.data.user);
    }
    
    return result;
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    const result = await this.makeRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (result.success && result.data) {
      await this.setToken(result.data.token);
      await this.storeUser(result.data.user);
    }
    
    return result;
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.makeRequest('/logout', {
      method: 'POST',
    });
    
    // Clear tokens regardless of API response
    await this.clearToken();
    
    return result;
  }

  // OAuth endpoints
  async getGoogleOAuthUrl(): Promise<ApiResponse<{ url: string }>> {
    return this.makeRequest<{ url: string }>('/oauth/google', {
      method: 'GET',
    });
  }

  async getGitHubOAuthUrl(): Promise<ApiResponse<{ url: string }>> {
    return this.makeRequest<{ url: string }>('/oauth/github', {
      method: 'GET',
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/me');
  }

  async getUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/user');
  }

  // Services endpoints
  async getServices(): Promise<ApiResponse<ServiceConfig[]>> {
    const result = await this.makeRequest<any>('/services');
    
    // Handle the specific response format from the backend
    // Backend returns: { client: {...}, server: { current_time: ..., services: [...] } }
    if (result.success && result.data?.server?.services) {
      return {
        success: true,
        data: result.data.server.services.map((service: any) => ({
          id: service.id.toString(),
          name: service.name,
          description: service.description,
          logo: service.icon_url || `https://logo.clearbit.com/${service.name.toLowerCase()}.com`,
          color: this.getServiceColor(service.name),
          auth_url: service.auth_url,
          is_connected: service.status === 'active',
        }))
      };
    }
    
    return result;
  }

  // Helper method to get service colors
  private getServiceColor(serviceName: string): string {
    const colors: Record<string, string> = {
      'Facebook': '#1877F2',
      'Twitter': '#1DA1F2', 
      'Instagram': '#E4405F',
      'LinkedIn': '#0A66C2',
      'GitHub': '#181717',
      'Spotify': '#1DB954',
      'YouTube': '#FF0000',
      'Pinterest': '#BD081C',
      'Discord': '#5865F2',
      'Telegram': '#0088CC',
      'Twitch': '#9146FF',
      'Steam': '#00ADEE',
      'Mail': '#EA4335',
    };
    return colors[serviceName] || '#6B7280';
  }

  async getService(serviceName: string): Promise<ApiResponse<ServiceConfig>> {
    return this.makeRequest<ServiceConfig>(`/services/${serviceName}`);
  }

  // Automation endpoints
  async getAutomations(): Promise<ApiResponse<Automation[]>> {
    return this.makeRequest<Automation[]>('/automations');
  }

  async createAutomation(automation: Omit<Automation, 'id'>): Promise<ApiResponse<Automation>> {
    return this.makeRequest<Automation>('/automations', {
      method: 'POST',
      body: JSON.stringify(automation),
    });
  }

  async updateAutomation(id: number, automation: Partial<Automation>): Promise<ApiResponse<Automation>> {
    return this.makeRequest<Automation>(`/automations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(automation),
    });
  }

  async deleteAutomation(id: number): Promise<ApiResponse> {
    return this.makeRequest(`/automations/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleAutomation(id: number, enabled: boolean): Promise<ApiResponse<Automation>> {
    return this.makeRequest<Automation>(`/automations/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  // Test endpoint
  async test(): Promise<ApiResponse> {
    return this.makeRequest('/test');
  }

  // Echo endpoint for testing
  async echo(message: string): Promise<ApiResponse> {
    return this.makeRequest('/echo', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Protected route test
  async getProtected(): Promise<ApiResponse> {
    return this.makeRequest('/protected');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type {
  ApiResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  AuthResponse,
  ServiceConfig,
  AutomationTrigger,
  AutomationAction,
  Automation,
};