// API Service for AREA Mobile App
// This mirrors the functionality from your web frontend API service

const API_BASE_URL = __DEV__ ? 'http://172.19.144.68:8000/api' : 'http://144.24.201.112/api';

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

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
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
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.makeRequest('/logout', {
      method: 'POST',
    });
    
    if (result.success) {
      this.clearToken();
    }
    
    return result;
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/me');
  }

  async getUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/user');
  }

  // Services endpoints
  async getServices(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/services');
  }

  async getService(serviceName: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/services/${serviceName}`);
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
};