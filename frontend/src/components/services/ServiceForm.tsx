import React from 'react';
import type { ServiceFormData } from '../../services/editServiceService';

interface ServiceFormProps {
  formData: ServiceFormData;
  onInputChange: (field: keyof ServiceFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isDeleting: boolean;
  isAdmin: boolean;
  onDelete: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  isDeleting,
  isAdmin,
  onDelete,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onInputChange(name as keyof ServiceFormData, value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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

      {/* Action Buttons */}
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
            onClick={onDelete}
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
      </div>
    </form>
  );
};
