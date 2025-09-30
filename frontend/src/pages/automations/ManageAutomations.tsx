import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';

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

interface Reaction {
  id: number;
  name: string;
  description: string;
  action_type: string;
  service_id: number;
}

interface Automation {
  id: number;
  name: string;
  description: string;
  action_id: number;
  reaction_id: number;
  is_active: boolean;
  action: Action;
  reaction: Reaction;
  trigger_service: Service;
  action_service: Service;
}

export default function ManageAutomations() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { isAdmin } = useCurrentUser();
  
  const [service, setService] = useState<Service | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState<{[key: string]: boolean}>({});

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

        // Fetch reactions
        const reactionsResponse = await fetch(`http://localhost:8000/api/services/${serviceId}/reactions`);
        if (reactionsResponse.ok) {
          const reactionsData = await reactionsResponse.json();
          setReactions(reactionsData.server.reactions || []);
        }

        // Fetch automations
        const automationsResponse = await fetch(`http://localhost:8000/api/services/${serviceId}/automations`);
        if (automationsResponse.ok) {
          const automationsData = await automationsResponse.json();
          setAutomations(automationsData.server.automations || []);
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
      setDeletingItems(prev => ({ ...prev, [`action-${actionId}`]: true }));
      
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
        // Also remove automations that used this action
        setAutomations(prev => prev.filter(auto => auto.action_id !== actionId));
      } else {
        alert('Failed to delete action');
      }
    } catch (error) {
      console.error('Error deleting action:', error);
      alert('Failed to delete action');
    } finally {
      setDeletingItems(prev => ({ ...prev, [`action-${actionId}`]: false }));
    }
  };

  const handleDeleteReaction = async (reactionId: number) => {
    const reaction = reactions.find(r => r.id === reactionId);
    if (!reaction) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the reaction "${reaction.name}"? This will also delete any automations using this reaction.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingItems(prev => ({ ...prev, [`reaction-${reactionId}`]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/services/${serviceId}/reactions/${reactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setReactions(prev => prev.filter(r => r.id !== reactionId));
        // Also remove automations that used this reaction
        setAutomations(prev => prev.filter(auto => auto.reaction_id !== reactionId));
      } else {
        alert('Failed to delete reaction');
      }
    } catch (error) {
      console.error('Error deleting reaction:', error);
      alert('Failed to delete reaction');
    } finally {
      setDeletingItems(prev => ({ ...prev, [`reaction-${reactionId}`]: false }));
    }
  };

  const handleDeleteAutomation = async (automationId: number) => {
    const automation = automations.find(a => a.id === automationId);
    if (!automation) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the automation "${automation.name}"?`
    );

    if (!confirmDelete) return;

    try {
      setDeletingItems(prev => ({ ...prev, [`automation-${automationId}`]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/automations/${automationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAutomations(prev => prev.filter(a => a.id !== automationId));
      } else {
        alert('Failed to delete automation');
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
      alert('Failed to delete automation');
    } finally {
      setDeletingItems(prev => ({ ...prev, [`automation-${automationId}`]: false }));
    }
  };

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-8">
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
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center">
            <p className="text-red-600">Service not found</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-8">
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
              />
            </div>
            <div>
              <h1
                className="text-3xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Manage {service.name}
              </h1>
              <p
                className="text-lg text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Delete or modify actions, reactions, and automations
              </p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actions.map((action) => (
                <div key={action.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">{action.name}</h3>
                      <p className="text-sm text-blue-700 mb-2">{action.description}</p>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        {action.trigger_type || 'Custom'}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteAction(action.id)}
                        disabled={deletingItems[`action-${action.id}`]}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {deletingItems[`action-${action.id}`] ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-600 text-center py-8">No actions found. Add one to get started!</p>
          )}
        </div>

        {/* Reactions Section */}
        <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-purple-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              🟣 Reactions ({reactions.length})
            </h2>
            {isAdmin && (
              <button
                onClick={() => navigate(`/addReactions/${serviceId}`)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                + Add Reaction
              </button>
            )}
          </div>

          {reactions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reactions.map((reaction) => (
                <div key={reaction.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 mb-1">{reaction.name}</h3>
                      <p className="text-sm text-purple-700 mb-2">{reaction.description}</p>
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                        {reaction.action_type || 'Custom'}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteReaction(reaction.id)}
                        disabled={deletingItems[`reaction-${reaction.id}`]}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {deletingItems[`reaction-${reaction.id}`] ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-purple-600 text-center py-8">No reactions found. Add one to get started!</p>
          )}
        </div>

        {/* Automations Section */}
        <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-green-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              🔄 Automations ({automations.length})
            </h2>
            {isAdmin && (
              <button
                onClick={() => navigate(`/createAutomation/${serviceId}`)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
              >
                + Create Automation
              </button>
            )}
          </div>

          {automations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automations.map((automation) => (
                <div key={automation.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">{automation.name}</h3>
                      <p className="text-sm text-green-700 mb-3">{automation.description}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteAutomation(automation.id)}
                        disabled={deletingItems[`automation-${automation.id}`]}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {deletingItems[`automation-${automation.id}`] ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  
                  {/* Automation Flow */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-lg bg-white border border-green-300 flex items-center justify-center mb-1">
                        <img
                          src={automation.trigger_service.icon_url || '/app_logo/default.png'}
                          alt={automation.trigger_service.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/app_logo/default.png';
                          }}
                        />
                      </div>
                      <span className="text-xs text-green-700">{automation.action.name}</span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center mx-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-lg bg-white border border-green-300 flex items-center justify-center mb-1">
                        <img
                          src={automation.action_service.icon_url || '/app_logo/default.png'}
                          alt={automation.action_service.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/app_logo/default.png';
                          }}
                        />
                      </div>
                      <span className="text-xs text-green-700">{automation.reaction.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 text-center py-8">No automations found. Create one to get started!</p>
          )}
        </div>
      </div>
    </main>
  );
}
