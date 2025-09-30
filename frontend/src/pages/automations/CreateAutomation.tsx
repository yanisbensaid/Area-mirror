import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
  auth_type: string;
  icon_url?: string;
}

interface Action {
  id: number;
  name: string;
  description: string;
  service_id: number;
}

interface Reaction {
  id: number;
  name: string;
  description: string;
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

export default function CreateAutomation() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { isAdmin } = useCurrentUser();
  
  const [services, setServices] = useState<Service[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingAutomations, setDeletingAutomations] = useState<{[key: number]: boolean}>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_service_id: serviceId || '',
    action_service_id: '',
    action_id: '',
    reaction_id: '',
    category: '',
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all services
        const servicesResponse = await fetch('http://localhost:8000/api/services');
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData.server.services || []);
        }

        // Fetch existing automations for the service if serviceId is provided
        if (serviceId) {
          const automationsResponse = await fetch(`http://localhost:8000/api/services/${serviceId}/automations`);
          if (automationsResponse.ok) {
            const automationsData = await automationsResponse.json();
            setAutomations(automationsData.server.automations || []);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  // Fetch actions when trigger service changes
  useEffect(() => {
    const fetchActions = async () => {
      if (formData.trigger_service_id) {
        try {
          const response = await fetch(`http://localhost:8000/api/services/${formData.trigger_service_id}/actions`);
          if (response.ok) {
            const data = await response.json();
            console.log('Actions response:', data);
            setActions(data.server?.actions || []);
          } else {
            console.log('No actions found or service not found');
            setActions([]);
          }
        } catch (error) {
          console.error('Error fetching actions:', error);
          setActions([]);
        }
      } else {
        setActions([]);
      }
    };

    fetchActions();
  }, [formData.trigger_service_id]);

  // Fetch reactions when action service changes
  useEffect(() => {
    const fetchReactions = async () => {
      if (formData.action_service_id) {
        try {
          const response = await fetch(`http://localhost:8000/api/services/${formData.action_service_id}/reactions`);
          if (response.ok) {
            const data = await response.json();
            console.log('Reactions response:', data);
            setReactions(data.server?.reactions || []);
          } else {
            console.log('No reactions found or service not found');
            setReactions([]);
          }
        } catch (error) {
          console.error('Error fetching reactions:', error);
          setReactions([]);
        }
      } else {
        setReactions([]);
      }
    };

    fetchReactions();
  }, [formData.action_service_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/automations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate(`/services/${formData.trigger_service_id}`);
      } else {
        const errorData = await response.json();
        console.error('Error creating automation:', errorData);
        alert('Error creating automation. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating automation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAutomation = async (automationId: number) => {
    const automation = automations.find(a => a.id === automationId);
    if (!automation) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the automation "${automation.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingAutomations(prev => ({ ...prev, [automationId]: true }));
      
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
      setDeletingAutomations(prev => ({ ...prev, [automationId]: false }));
    }
  };

  const getTriggerService = () => services.find(s => s.id.toString() === formData.trigger_service_id);
  const getActionService = () => services.find(s => s.id.toString() === formData.action_service_id);

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

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Create New Automation
          </h1>
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Connect two services to create a powerful automation workflow
          </p>
        </div>

        {/* Automation Preview */}
        {formData.trigger_service_id && formData.action_service_id && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Automation Preview</h3>
            <div className="flex items-center justify-center">
              {/* Trigger Service */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                  <img 
                    src={getTriggerService()?.icon_url || '/app_logo/default.png'} 
                    alt={getTriggerService()?.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/app_logo/default.png';
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 text-center font-medium">
                  {getTriggerService()?.name}
                </span>
              </div>

              {/* Arrow */}
              <div className="mx-8">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Action Service */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                  <img 
                    src={getActionService()?.icon_url || '/app_logo/default.png'} 
                    alt={getActionService()?.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/app_logo/default.png';
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 text-center font-medium">
                  {getActionService()?.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Existing Automations */}
        {serviceId && automations.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🔄 Existing Automations ({automations.length})
            </h3>
            <div className="space-y-4">
              {automations.map((automation) => (
                <div key={automation.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-1">{automation.name}</h4>
                      <p className="text-green-700 text-sm mb-3">{automation.description}</p>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAutomation(automation.id)}
                        disabled={deletingAutomations[automation.id]}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {deletingAutomations[automation.id] ? 'Deleting...' : 'Delete'}
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
                      <span className="text-xs text-green-700 text-center">{automation.action.name}</span>
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
                      <span className="text-xs text-green-700 text-center">{automation.reaction.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Automation Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Spotify to Telegram Notifications"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="Music">Music</option>
                  <option value="Communication">Communication</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this automation does..."
              />
            </div>

            {/* Service Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="trigger_service_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Service * (When this happens)
                </label>
                <select
                  id="trigger_service_id"
                  name="trigger_service_id"
                  value={formData.trigger_service_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select trigger service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="action_service_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Action Service * (Do this)
                </label>
                <select
                  id="action_service_id"
                  name="action_service_id"
                  value={formData.action_service_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select action service</option>
                  {services.filter(s => s.id.toString() !== formData.trigger_service_id).map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action and Reaction Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="action_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Trigger * 
                </label>
                <select
                  id="action_id"
                  name="action_id"
                  value={formData.action_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.trigger_service_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select trigger action</option>
                  {actions.map(action => (
                    <option key={action.id} value={action.id}>
                      {action.name}
                    </option>
                  ))}
                </select>
                {!formData.trigger_service_id && (
                  <p className="text-sm text-gray-500 mt-1">Select a trigger service first</p>
                )}
                {formData.trigger_service_id && actions.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">No actions available for this service</p>
                )}
                {formData.trigger_service_id && actions.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">{actions.length} actions available</p>
                )}
              </div>

              <div>
                <label htmlFor="reaction_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Action *
                </label>
                <select
                  id="reaction_id"
                  name="reaction_id"
                  value={formData.reaction_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.action_service_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select reaction</option>
                  {reactions.map(reaction => (
                    <option key={reaction.id} value={reaction.id}>
                      {reaction.name}
                    </option>
                  ))}
                </select>
                {!formData.action_service_id && (
                  <p className="text-sm text-gray-500 mt-1">Select an action service first</p>
                )}
                {formData.action_service_id && reactions.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">No reactions available for this service</p>
                )}
                {formData.action_service_id && reactions.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">{reactions.length} reactions available</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Automation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
