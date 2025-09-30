
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

interface ServiceFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  auth_type: string;
  icon_url: string;
}

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    status: 'active',
    auth_type: 'OAuth2',
    icon_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      const response = await fetch('http://localhost:8000/api/services', {
        method: 'POST',
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
          throw new Error(data.message || 'Failed to create service');
        }
      }

      setSuccess('Service created successfully!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'active',
        auth_type: 'OAuth2',
        icon_url: ''
      });

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Create a New Service
        </h1>
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Service Name *
                </label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter service name"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Description
                </label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter service description"
                rows={4}
                ></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Status *
                </label>
                <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Authentication Type *
                </label>
                <select
                name="auth_type"
                value={formData.auth_type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                >
                  <option value="OAuth2">OAuth2</option>
                  <option value="API Key">API Key</option>
                  <option value="Token">Token</option>
                  <option value="Basic Auth">Basic Auth</option>
                  <option value="None">None</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Icon URL (Optional)
                </label>
                <input
                type="url"
                name="icon_url"
                value={formData.icon_url}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/icon.png (leave empty for auto-search)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left empty, we'll automatically search for an icon based on the service name
                </p>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-md transition-colors duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
                style={{ fontFamily: 'Inter, sans-serif' }}
            >
                {isLoading ? 'Creating...' : 'Create Service'}
            </button>
            </form>
        </div>
        </div>
    </main>
  );
}