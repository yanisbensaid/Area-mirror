import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // Important for Sanctum authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to include CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token for authentication
    if (!config.url?.includes('/sanctum/csrf-cookie')) {
      await getCsrfToken();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

// Get CSRF token
const getCsrfToken = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
};

// API methods
export const apiService = {
  // Test API connection
  test: () => api.get('/api/test'),
  
  // User authentication
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/login', credentials),
  
  logout: () => api.post('/api/logout'),
  
  register: (userData: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/api/register', userData),
  
  // Get authenticated user
  getUser: () => api.get('/api/user'),
};

export default api;
