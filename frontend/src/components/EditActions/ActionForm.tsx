import React from 'react';
import type { ActionFormData } from '../../services/editActionService';

interface ActionFormProps {
  formData: ActionFormData;
  onInputChange: (field: keyof ActionFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isCreate?: boolean;
  submitButtonText?: string;
}

export const ActionForm: React.FC<ActionFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  isCreate = false,
  submitButtonText,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      onInputChange(name as keyof ActionFormData, value);
    };

  const defaultButtonText = isCreate ? 'Create Action' : 'Update Action';

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Action Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter action name"
          required
        />
      </div>

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
          placeholder="Enter action description"
          rows={4}
        />
      </div>

      {/* Trigger Type */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Trigger Type *
        </label>
        <select
          name="trigger_type"
          value={formData.trigger_type}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
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

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isCreate ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            submitButtonText || defaultButtonText
          )}
        </button>
      </div>
    </form>
  );
};
