import { useAuth } from '../contexts/AuthContext';
import type { CurrentUser, UseCurrentUserReturn } from '../contexts/AuthContext';

// Legacy hook that wraps the new auth context for backward compatibility
export const useCurrentUser = (): UseCurrentUserReturn => {
  const auth = useAuth();
  
  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    refetch: auth.refetch,
    isLoggedIn: auth.isLoggedIn,
    isAdmin: auth.isAdmin,
  };
};

export default useCurrentUser;
export type { CurrentUser, UseCurrentUserReturn };
