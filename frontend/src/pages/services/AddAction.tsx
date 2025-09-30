import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Service {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
}

export default function AddAction() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: '',
    trigger_config: {}
  });

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/services/${serviceId}`);
        if (response.ok) {
          const data = await response.json();
          setService(data.server.service);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/services/${serviceId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate(`/services/${serviceId}`);
      } else {
        const errorData = await response.json();
        console.error('Error creating action:', errorData);
        alert('Error creating action. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating action. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-8">
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
        <div className="max-w-2xl mx-auto py-8">
          <div className="text-center">
            <p className="text-red-600">Service not found</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={service.icon_url || '/app_logo/default.png'} 
              alt={service.name}
              className="w-16 h-16 object-contain mr-4"
              onError={(e) => {
                e.currentTarget.src = '/app_logo/default.png';
              }}
            />
            <div>
              <h1 
                className="text-3xl font-semibold text-gray-900"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Add Action to {service.name}
              </h1>
            </div>
          </div>
          <p 
            className="text-lg text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Create a trigger action that other services can respond to
          </p>
        </div>

        {/* Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>What's an Action?</strong> An action is something that happens in {service.name} that can trigger automations in other services. 
                For example: "New email received", "Song liked", "Stream started".
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Action Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New Email Received, Song Liked, Stream Started"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe when this action should be triggered..."
              />
            </div>

            <div>
              <label htmlFor="trigger_type" className="block text-sm font-medium text-gray-700 mb-2">
                Trigger Type
              </label>
              <select
                id="trigger_type"
                name="trigger_type"
                value={formData.trigger_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a trigger type</option>
                <option value="new_item">New Item Created</option>
                <option value="updated_item">Item Updated</option>
                <option value="deleted_item">Item Deleted</option>
                <option value="user_action">User Action</option>
                <option value="scheduled">Scheduled Event</option>
                <option value="webhook">Webhook Received</option>
                <option value="custom">Custom Trigger</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(`/services/${serviceId}`)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Action'}
              </button>
            </div>
          </form>
        </div>

        {/* Next Steps */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Next:</strong> After creating this action, you'll be able to use it in automations. You can then create reactions in other services and connect them together!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
