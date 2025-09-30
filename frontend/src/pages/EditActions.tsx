import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface Service {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
}

interface Action {
  id: number;
  name: string;
  description: string;
  trigger_type: string;
  service_id: number;
}

export default function EditActions() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { isAdmin } = useCurrentUser();
  
  const [service, setService] = useState<Service | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      
      try {
        setLoading(true);
        
        // Fetch service details
        const serviceResponse = await fetch(`http://localhost:8000/api/services/${serviceId}`);
        if (serviceResponse.ok) {
          const serviceData = await serviceResponse.json();
          setService(serviceData.server.service);
        }

        // Fetch actions
        const actionsResponse = await fetch(`http://localhost:8000/api/services/${serviceId}/actions`);
        if (actionsResponse.ok) {
          const actionsData = await actionsResponse.json();
          setActions(actionsData.server.actions || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  const handleDeleteAction = async (actionId: number) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the action "${action.name}"? This will also delete any automations using this action.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingItems(prev => ({ ...prev, [actionId]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/services/${serviceId}/actions/${actionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setActions(prev => prev.filter(a => a.id !== actionId));
      } else {
        alert('Failed to delete action');
      }
    } catch (error) {
      console.error('Error deleting action:', error);
      alert('Failed to delete action');
    } finally {
      setDeletingItems(prev => ({ ...prev, [actionId]: false }));
    }
  };

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <p className="text-red-600">Service not found</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/services/${serviceId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {service.name}
          </Link>

          <div className="flex items-center space-x-6 mb-8">
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src={service.icon_url || '/app_logo/default.png'}
                alt={`${service.name} logo`}
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/app_logo/default.png';
                }}
              />
            </div>
            <div>
              <h1
                className="text-3xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Edit Actions for {service.name}
              </h1>
              <p
                className="text-lg text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Manage and delete actions that can trigger automations
              </p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-blue-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              🔵 Actions ({actions.length})
            </h2>
            {isAdmin && (
              <button
                onClick={() => navigate(`/addActions/${serviceId}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                + Add Action
              </button>
            )}
          </div>

          {actions.length > 0 ? (
            <div className="space-y-4">
              {actions.map((action) => (
                <div key={action.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">{action.name}</h3>
                      <p className="text-blue-700 mb-3">{action.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full">
                          Trigger: {action.trigger_type || 'Custom'}
                        </span>
                        <span className="text-sm text-blue-600">
                          Service ID: {action.service_id}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteAction(action.id)}
                        disabled={deletingItems[action.id]}
                        className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {deletingItems[action.id] ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </div>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔵</div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No Actions Found</h3>
              <p className="text-blue-600 mb-6">This service doesn't have any actions yet.</p>
              {isAdmin && (
                <button
                  onClick={() => navigate(`/addActions/${serviceId}`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Create Your First Action
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>About Actions:</strong> Actions are triggers that can start automations. When you delete an action, 
                any automations that depend on it will also be removed. Make sure to review your automations before deleting actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
