import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface ServiceFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  auth_type: string;
  icon_url: string;
}

interface DatabaseService {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  auth_type: string;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function EditService() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { isAdmin } = useCurrentUser();
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    status: 'active',
    auth_type: 'OAuth2',
    icon_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing service data
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setError('Service ID not provided');
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        const response = await fetch(`http://localhost:8000/api/services/${serviceId}`);

        if (!response.ok) {
          throw new Error(`Service not found: ${response.status}`);
        }

        const data = await response.json();
        const service: DatabaseService = data.server.service;

        // Populate form with existing data
        setFormData({
          name: service.name,
          description: service.description || '',
          status: service.status,
          auth_type: service.auth_type,
          icon_url: service.icon_url || ''
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setIsFetching(false);
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
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:8000/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 422) {
          const errors = data.errors;
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        } else {
          throw new Error(data.message || 'Failed to update service');
        }
      }

      setSuccess('Service updated successfully!');

      // Redirect to service detail page after success
      setTimeout(() => {
        navigate(`/services/${serviceId}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceId) {
      setError('Service ID not provided');
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${formData.name}"? This action cannot be undone and will also delete all associated actions and reactions.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:8000/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to delete service' }));
        throw new Error(data.message || 'Failed to delete service');
      }

      setSuccess('Service deleted successfully!');

      // Redirect to services page after success
      setTimeout(() => {
        navigate('/services');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isFetching) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-12">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading service...
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (error && !formData.name) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to={`/service/${serviceId}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back to Service
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto py-12">
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
            Back to Service
          </Link>

          <h1
            className="text-4xl font-semibold text-gray-900 mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Edit Service
          </h1>
          <p
            className="text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Update your service information and settings
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter service name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter service description"
                rows={4}
              />
            </div>

            {/* Status */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Auth Type */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Authentication Type *
              </label>
              <select
                name="auth_type"
                value={formData.auth_type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="OAuth2">OAuth2</option>
                <option value="API Key">API Key</option>
                <option value="Basic Auth">Basic Auth</option>
                <option value="none">None</option>
              </select>
            </div>

            {/* Icon URL */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Icon URL
              </label>
              <input
                type="url"
                name="icon_url"
                value={formData.icon_url}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/icon.png (optional - auto icon will be used if empty)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to automatically search for an icon based on the service name
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading || isDeleting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Service'
                )}
              </button>
              
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading || isDeleting}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              )}
              
              <Link
                to={`/services/${serviceId}`}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 text-center"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
