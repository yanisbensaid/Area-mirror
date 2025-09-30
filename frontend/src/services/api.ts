// @ts-nocheck - Disable TypeScript checking for this file to avoid axios type issues
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': '1.0.0',
  },
});

api.interceptors.request.use(
  async (config) => {
    if (!config.url?.includes('/sanctum/csrf-cookie')) {
      await getCsrfToken();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Authorization error will be handled by the auth service
    }
    return Promise.reject(error);
  }
);

const getCsrfToken = async (): Promise<void> => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  } catch (error: unknown) {
    console.error('Failed to get CSRF token:', error);
  }
};

export const apiService = {
  test: () => api.get('/api/test'),

  login: (credentials: { email: string; password: string }) =>
    api.post('/api/login', credentials),

  logout: () => api.post('/api/logout'),

  register: (userData: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/api/register', userData),

  getUser: () => api.get('/api/user'),

  telegram: {
    sendMessage: (data: { chat_id: string; text: string }, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return api.post('/api/test/telegram/send', data, { headers });
    },
  },
};

export default api;
