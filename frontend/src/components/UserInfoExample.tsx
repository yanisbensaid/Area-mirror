import { useCurrentUser } from '../hooks/useCurrentUser';

// Example component showing different ways to use current user
export default function UserInfoExample() {
  const { user, loading, error, refetch, isLoggedIn, isAdmin } = useCurrentUser();

  if (loading) {
    return <div>Loading user...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isLoggedIn) {
    return <div>Please log in to view this content.</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">User Information</h3>

      {/* Basic user info */}
      <div className="space-y-2">
        <p><strong>Name:</strong> {user!.name}</p>
        <p><strong>Email:</strong> {user!.email}</p>
        <p><strong>Role:</strong> {user!.role}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Member Since:</strong> {new Date(user!.created_at).toLocaleDateString()}</p>
      </div>

      {/* Admin-only content */}
      {isAdmin && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
          <p className="text-purple-800">🔑 Admin-only content visible here!</p>
        </div>
      )}

      {/* Refresh button */}
      <button 
        onClick={refetch}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh User Data
      </button>
    </div>
  );
}

// Example: Protecting a route component
export function ProtectedComponent() {
  const { isLoggedIn, isAdmin } = useCurrentUser();

  if (!isLoggedIn) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the admin area!</p>
    </div>
  );
}

// Example: Simple user greeting
export function UserGreeting() {
  const { user, isLoggedIn } = useCurrentUser();

  if (!isLoggedIn) return null;

  return (
    <div className="text-sm text-gray-600">
      Hello, {user!.name}! 👋
    </div>
  );
}
