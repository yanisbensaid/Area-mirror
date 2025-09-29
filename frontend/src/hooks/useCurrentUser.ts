import { useState, useEffect } from 'react';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_admin: boolean;
  role_assigned_at: string | null;
  created_at: string;
}

export interface UseCurrentUserReturn {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          throw new Error('Authentication token is invalid');
        }
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchCurrentUser,
    isLoggedIn: user !== null,
    isAdmin: user?.is_admin ?? false,
  };
};

export default useCurrentUser;
