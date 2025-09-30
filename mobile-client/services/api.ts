// API Service for AREA Mobile App
// This mirrors the functionality from your web frontend API service

const API_BASE_URL = __DEV__ ? 'http://localhost:8000/api' : 'http://144.24.201.112/api';

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
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.makeRequest('/auth/logout', {
      method: 'POST',
    });
    
    if (result.success) {
      this.clearToken();
    }
    
    return result;
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/user/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Services endpoints
  async getServices(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/services');
  }

  async getService(serviceName: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/services/${serviceName}`);
  }

  // Automations endpoints
  async getAutomations(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/automations');
  }

  async createAutomation(automation: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/automations', {
      method: 'POST',
      body: JSON.stringify(automation),
    });
  }

  async updateAutomation(id: number, automation: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/automations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(automation),
    });
  }

  async deleteAutomation(id: number): Promise<ApiResponse> {
    return this.makeRequest(`/automations/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
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